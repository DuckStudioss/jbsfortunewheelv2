import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

console.log('Initializing DB connection...');
console.log('Supabase URL present:', !!SUPABASE_URL);

let supabase: any = null;
let db: any = null;

try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    console.log('Connecting to Supabase...');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.log('No Supabase credentials, falling back to SQLite...');
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: SQLite is not supported in production on Vercel. Please set SUPABASE_URL and SUPABASE_KEY.');
    }
    const dbPath = process.env.RENDER_DISK_PATH 
      ? path.join(process.env.RENDER_DISK_PATH, 'spins4.db')
      : 'spins4.db';
    db = new Database(dbPath);
  }
} catch (err) {
  console.error('Failed to initialize database:', err);
}

console.log('Email config:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD?.substring(0, 3) + '...' // Only log first 3 chars for security
});

const app = express();
const port = process.env.PORT || 3001;

// Update CORS configuration to allow requests from your Vercel domain
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://pizza-wheel.vercel.app', // Add your Vercel domain
  'https://jbsfortunewheelv2.vercel.apps',
  process.env.FRONTEND_URL // This will be used if you set it in environment variables
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }
 
    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some((allowedOrigin?: string) => 
      allowedOrigin ? origin.toLowerCase() === allowedOrigin.toLowerCase() : false
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


// Initialize table if using SQLite
if (db) {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS spins (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      cedula TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      phoneNumber TEXT,
      award TEXT NOT NULL,
      isSpecialPrize INTEGER DEFAULT 0,
      isDisbursed INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      sucursal TEXT,
      couponCode TEXT
    )
  `).run();
}

interface Spin {
  id: string;
  couponCode?: string;
  customerName: string;
  email: string;
  award: string;
  isSpecialPrize?: boolean;
  isDisbursed: boolean;
  createdAt?: string;
}

// Only create table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS spins (
      id TEXT PRIMARY KEY,
      couponCode TEXT,
      customerName TEXT NOT NULL,
      cedula TEXT NOT NULL,
      email TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      sucursal TEXT NOT NULL,
      award TEXT NOT NULL,
      isSpecialPrize BOOLEAN DEFAULT 0,
      isDisbursed BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )

`);

// Replace the email transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // You'll need to replace this with your actual SMTP server
  port: 587, // This port might be different for your provider
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Add this to test the connection when server starts
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email server error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});

// Modify the POST /api/spins endpoint
app.post('/api/spins', async (req: Request, res: Response) => {
  const { customerName, cedula, email, phoneNumber, sucursal, award, isSpecialPrize, couponCode } = req.body as any;

  const id = uuidv4();

  try {
    // 1. Check if email or cedula already exists
    if (supabase) {
      const { data: existingEmail } = await supabase
        .from('spins')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingEmail) {
        return res.status(400).json({ error: 'Este correo electrónico ya ha participado' });
      }

      const { data: existingCedula } = await supabase
        .from('spins')
        .select('id')
        .eq('cedula', cedula)
        .single();
      
      if (existingCedula) {
        return res.status(400).json({ error: 'Esta cédula ya ha participado' });
      }
    } else {
      const existingEmail = db.prepare('SELECT id FROM spins WHERE email = ?').get(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Este correo electrónico ya ha participado' });
      }

      const existingCedula = db.prepare('SELECT id FROM spins WHERE cedula = ?').get(cedula);
      if (existingCedula) {
        return res.status(400).json({ error: 'Esta cédula ya ha participado' });
      }
    }


    // 2. Insert the new spin
    if (supabase) {
      const { error: insertError } = await supabase
        .from('spins')
        .insert([{
          id,
          couponCode,
          customerName,
          cedula,
          email,
          phoneNumber,
          sucursal,
          award,
          isSpecialPrize: !!isSpecialPrize,
          isDisbursed: false
        }]);

      
      if (insertError) throw insertError;
    } else {
      db.prepare(
        'INSERT INTO spins (id, couponCode, customerName, cedula, email, phoneNumber, sucursal, award, isSpecialPrize, isDisbursed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, couponCode || null, customerName, cedula, email, phoneNumber, sucursal || 'Escazú', award, isSpecialPrize ? 1 : 0, 0);
    }

    console.log('Spin saved successfully:', { id, customerName, email, award });

    // Send email logic (remains same)
    if (award !== "Intenta de nuevo") {
      try {
        await transporter.sendMail({
          from: `"JBs Rewards" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '¡Felicitaciones por tu premio en JBs! 🎉',
          attachments: [{
            filename: 'Logo.png',
            path: './public/Logo.png',
            cid: 'logo'
          }],
          html: `
            <div style="background-color: #000000; color: white; font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="cid:logo" alt="JBs Logo" style="max-width: 200px;">
              </div>
              <h2 style="font-size: 32px; text-transform: uppercase; margin: 0 0 20px 0; text-align: center; color: white;">¡Felicitaciones ${customerName}!</h2>
              <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 24px; text-align: center; margin: 0; color: #e1261c;">Has ganado: <strong>${award}</strong></p>
              </div>
              <div style="margin: 30px 0; line-height: 1.6;">
                <p style="margin: 10px 0;">Para reclamar tu premio:</p>
                <ul style="list-style: none; padding: 0; margin: 20px 0;">
                  <li style="margin: 10px 0;">✅ Visita cualquier sucursal de JBs</li>
                  <li style="margin: 10px 0;">✅ Presenta este correo</li>
                  <li style="margin: 10px 0;">✅ Muestra tu cedula</li>
                </ul>
              </div>
              <div style="background: #e1261c; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Número de referencia: ${id}</p>
              </div>
              <p style="color: #ff9999; font-size: 14px; text-align: center; margin-top: 30px;">⚠️ Este premio es válido hasta el 31 de marzo de 2025</p>
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                <p style="margin: 0;">¡Gracias por participar!</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    res.status(201).json({ 
      id, 
      customerName, 
      email, 
      award,
      isSpecialPrize,
      isDisbursed: false 
    });
  } catch (err: any) {
    console.error('Spin Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all spins
app.get('/api/spins', async (_: Request, res: Response) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('spins')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } else {
      const rows = db.prepare('SELECT * FROM spins ORDER BY createdAt DESC').all() as Spin[];
      const formattedRows = rows.map(row => ({
        ...row,
        isSpecialPrize: !!row.isSpecialPrize,
        isDisbursed: !!row.isDisbursed
      }));
      res.json(formattedRows);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to check by email
app.get("/api/spins/email/:email", async (req, res) => {
  const { email } = req.params;
  
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('spins')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return res.status(404).json({ message: "Spin not found" });
      res.json(data);
    } else {
      const row = db.prepare('SELECT * FROM spins WHERE email = ?').get(email) as any;
      if (!row) return res.status(404).json({ message: "Spin not found" });
      res.json(row);
    }
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// Endpoint to check by cedula
app.get("/api/spins/cedula/:cedula", async (req, res) => {
  const { cedula } = req.params;
  
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('spins')
        .select('*')
        .eq('cedula', cedula)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return res.status(404).json({ message: "Spin not found" });
      res.json(data);
    } else {
      const row = db.prepare('SELECT * FROM spins WHERE cedula = ?').get(cedula) as any;
      if (!row) return res.status(404).json({ message: "Spin not found" });
      res.json(row);
    }
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// Add endpoint to check special prize availability
app.get("/api/spins/special-prize", (_, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM spins WHERE isSpecialPrize = 1').get() as { count: number };
    res.json({ awarded: row.count > 0 });
  } catch (err) {
    console.error("Error checking special prize:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Add endpoint to update disbursement status
app.patch("/api/spins/:id/disburse", (req, res) => {
  const { id } = req.params;
  
  try {
    db.prepare('UPDATE spins SET isDisbursed = 1 WHERE id = ?').run(id);
    res.json({ message: "Disbursement status updated successfully" });
  } catch (err) {
    console.error("Error updating disbursement status:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
}