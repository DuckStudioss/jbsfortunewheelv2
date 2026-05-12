import React, { useState, useEffect, useRef } from "react";
import { Wheel } from "react-custom-roulette";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { AlertCircle, Ticket, User, Mail, Phone, Hash, Play, Download, Share2, MessageCircle } from "lucide-react";


import html2canvas from "html2canvas";
import { API_URL } from "../config";

const data = [
  { option: "JB's MilkShakes*", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "JB's Fries GRATIS", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  { option: "JB's Fries*", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "Gratis Secret Bar", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  { option: "10% OFF", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "JB's MilkShakes*", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  { option: "JB's Fries GRATIS", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "JB's Fries*", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
  { option: "Gratis Secret Bar", style: { backgroundColor: '#e1261c', textColor: '#ffffff' } },
  { option: "10% OFF", style: { backgroundColor: '#1a1a1a', textColor: '#ffffff' } },
];

const PRIZE_DETAILS: { [key: string]: string } = {
  "JB's MilkShakes*": "GRATIS JB's MilkShakes por la compra de cualquier JB's Combo.",
  "JB's Fries GRATIS": "Gratis JB's Fries.",
  "JB's Fries*": "Gratis JB's Fries por la compra de cualquier JB's Burger.",
  "Gratis Secret Bar": "Gratis Secret Bar.",
  "10% OFF": "10% off en tu próxima compra."
};


const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

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
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const couponRef = useRef<HTMLDivElement>(null);

  const validateCedula = (value: string) => value.length > 0;
  const validateEmail = (value: string) => value.length > 0 && value.includes("@");
  const validatePhoneNumber = (value: string) => true; // Optional anyway


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
      setError("Por favor ingrese una cédula");
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
        newPrizeNumber = 3; 
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
    
    // Generate code
    const generatedCoupon = `JBS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setCouponCode(generatedCoupon);
    
    setShowResult(true);

    if (data[prizeNumber].option !== "Intenta de nuevo") {
      triggerConfetti();
    }
    
    try {
      const prizeName = data[prizeNumber].option;
      const fullPrize = PRIZE_DETAILS[prizeName] || prizeName;
      
      await axios.post(`${API_URL}/api/spins`, {
        customerName: `${firstName} ${lastName}`,
        cedula,
        email,
        phoneNumber,
        award: fullPrize,
        couponCode: generatedCoupon,
        isSpecialPrize: false,
      });

    } catch (error) {
      console.error("Error saving result:", error);
    }
  };


  const downloadCoupon = async () => {
    if (couponRef.current) {
      const canvas = await html2canvas(couponRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'cupon-jb.jpg';
          link.href = url;
          link.click();
          // Cleanup
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      }, 'image/jpeg', 0.9);
    }
  };



  const shareOnWhatsApp = () => {
    const prizeName = data[prizeNumber].option;
    const fullPrize = PRIZE_DETAILS[prizeName] || prizeName;
    const text = `¡Gané un ${fullPrize} en la ruleta de JBs Burgers! 🍔🎡 https://www.instagram.com/jbs_burgers/ ¡Ven a participar tú también!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };


  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const openInstagram = () => {
    if (navigator.share) {
      const prizeName = data[prizeNumber].option;
      const fullPrize = PRIZE_DETAILS[prizeName] || prizeName;
      navigator.share({
        title: 'JB\'s Burgers - ¡Gané un premio!',
        text: `¡Gané un ${fullPrize} en la ruleta de JBs Burgers! 🍔🎡 ¡Ven a participar tú también!`,
        url: window.location.href,
      }).catch(console.error);
    } else {

      window.open(`https://www.instagram.com/jbs_burgers/`, '_blank');
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
                ref={couponRef}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                <img src="/assets/Logo.png" alt="Logo" style={{ width: 120, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', padding: '0 1rem' }}>{PRIZE_DETAILS[data[prizeNumber].option] || data[prizeNumber].option}</h3>

                {couponCode && (
                  <div className="coupon-code">
                    <span>CÓDIGO:</span>
                    <strong>{couponCode}</strong>
                  </div>
                )}
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
                <button className="download-btn" onClick={downloadCoupon}>
                  <Download size={18} /> DESCARGAR CUPÓN (JPG)
                </button>

                <div className="share-section">
                  <span>¡COMPARTE TU PREMIO!</span>
                  <div className="share-buttons">
                    <button onClick={shareOnWhatsApp} className="share-icon whatsapp" title="Compartir en WhatsApp">
                      <WhatsAppIcon />
                    </button>
                    <button onClick={openInstagram} className="share-icon instagram" title="Ver Instagram">
                      <InstagramIcon />
                    </button>
                    <button onClick={() => navigator.share?.({ title: 'JBs Fortune Wheel', text: '¡Gané un premio!', url: window.location.href })} className="share-icon generic" title="Más opciones">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          <button className="play-again-btn" onClick={() => window.location.reload()}>
            JUGAR DE NUEVO
          </button>
        </motion.div>

        <footer className="main-footer">
          <p>Copyright © 2026 <a href="https://www.duckstudios.net/" target="_blank" rel="noreferrer">Duck Studios</a></p>
        </footer>
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
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 112340567"
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

      <footer className="main-footer">
        <p>Copyright © 2026 <a href="https://www.duckstudios.net/" target="_blank" rel="noreferrer">Duck Studios</a></p>
      </footer>
    </div>
  );
};
