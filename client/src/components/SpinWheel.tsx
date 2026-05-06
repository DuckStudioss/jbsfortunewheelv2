import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { AlertCircle, Ticket, User, Mail, Phone, Hash, Play } from "lucide-react";
import { API_URL } from "../config";

const data = [
  { option: "Papitas GRATIS", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "Intenta de nuevo", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  { option: "Postre GRATIS", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "Intenta de nuevo", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  { option: "Papas Refresco GRATIS", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "Intenta de nuevo", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
];

export const SpinWheel: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCedula = (value: string) => /^\d{9}$/.test(value);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhoneNumber = (value: string) => /^\d{8}$/.test(value);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!firstName || !lastName || !email || !cedula) {
      setError("Por favor complete los campos obligatorios (Nombre, Apellido, Cédula y Correo)");
      setIsSubmitting(false);
      return;
    }

    if (!validateCedula(cedula)) {
      setError("La cédula debe contener exactamente 9 números");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Ingrese un correo electrónico válido");
      setIsSubmitting(false);
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setError("Ingrese un número de teléfono válido (8 dígitos)");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check existing spin by cedula
      try {
        await axios.get(`${API_URL}/api/spins/cedula/${cedula}`);
        setError("Esta cédula ya ha participado");
        setIsSubmitting(false);
        return;
      } catch (err: any) {
        if (err.response?.status !== 404) throw err;
      }

      // Check existing spin by email
      try {
        await axios.get(`${API_URL}/api/spins/email/${email}`);
        setError("Este correo electrónico ya ha participado");
        setIsSubmitting(false);
        return;
      } catch (err: any) {
        if (err.response?.status !== 404) throw err;
      }

      // Check special prize
      const specialRes = await axios.get(`${API_URL}/api/spins/special-prize`);
      const isSpecialPrizeAvailable = !specialRes.data.awarded;

      let newPrizeNumber;
      if (isSpecialPrizeAvailable && Math.random() < 0.01) {
        newPrizeNumber = 3; // Special index if we had one, but let's just pick from data
      } else {
        const available = data.map((_, i) => i);
        newPrizeNumber = available[Math.floor(Math.random() * available.length)];
      }

      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    } catch (error) {
      console.error("Error:", error);
      setError("Ocurrió un error al verificar los datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    setShowResult(true);

    if (data[prizeNumber].option !== "Intenta de nuevo") {
      triggerConfetti();
    }

    try {
      await axios.post(`${API_URL}/api/spins`, {
        customerName: `${firstName} ${lastName}`,
        cedula,
        email,
        phoneNumber,
        award: data[prizeNumber].option,
        isSpecialPrize: false,
      });
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  if (showResult) {
    const isLose = data[prizeNumber].option === "Intenta de nuevo";
    return (
      <div className="main-container">
        <motion.div 
          className="result-container"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
        >
          {isLose ? (
            <>
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                ¡Lo sentimos {firstName}!
              </motion.h2>
              <p>Esta vez no ganaste un premio</p>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                ¡Gracias por participar! Mejor suerte la próxima vez.
              </span>
            </>
          ) : (
            <>
              <motion.h2 
                style={{ color: 'var(--primary)' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ¡FELICITACIONES!
              </motion.h2>
              <motion.div 
                className="prize-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                <Ticket size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h3>{data[prizeNumber].option}</h3>
              </motion.div>
              <p>Revisa tu correo electrónico para reclamar tu premio.</p>
            </>
          )}
          <button className="play-again-btn" onClick={() => window.location.reload()}>
            JUGAR DE NUEVO
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="content-container">
        <motion.div 
          className="form-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>LLENA,<br/>GIRA,<br/><span style={{ color: 'var(--primary)' }}>¡GANA!</span></h1>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="spin-form">
            <div className="form-row">
              <div className="form-group">
                <label><User size={12} style={{ marginRight: 4 }} /> NOMBRE</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                  required
                />
              </div>
              <div className="form-group">
                <label><User size={12} style={{ marginRight: 4 }} /> APELLIDO</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label><Hash size={12} style={{ marginRight: 4 }} /> CÉDULA</label>
              <input
                type="text"
                maxLength={9}
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                placeholder="123456789"
                required
              />
            </div>

            <div className="form-group">
              <label><Mail size={12} style={{ marginRight: 4 }} /> CORREO ELECTRÓNICO</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label><Phone size={12} style={{ marginRight: 4 }} /> TELÉFONO (OPCIONAL)</label>
              <input
                type="tel"
                maxLength={8}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="88888888"
              />
            </div>

            <button type="submit" disabled={isSubmitting || mustSpin}>
              {isSubmitting ? "VERIFICANDO..." : mustSpin ? "GIRANDO..." : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Play size={18} fill="white" /> EMPEZAR A GIRAR
                </span>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div 
          className="wheel-section"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="wheel-center-logo">
            <img src="/assets/Logo.png" alt="Center Logo" />
          </div>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStopSpinning}
            outerBorderColor="#ffffff"
            outerBorderWidth={8}
            innerBorderColor="#ffffff"
            innerBorderWidth={0}
            innerRadius={20}
            radiusLineColor="#ffffff"
            radiusLineWidth={1}
            fontSize={16}
            textDistance={60}
            fontFamily="Outfit"
            fontWeight={800}
            perpendicularText={false}
            spinDuration={0.5}
            pointerProps={{
              style: {
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                transform: 'scale(1.2)'
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};
