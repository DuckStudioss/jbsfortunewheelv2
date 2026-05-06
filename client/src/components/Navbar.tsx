import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MapPin, Truck } from "lucide-react";
import "./Navbar.css";
const Logo = "/assets/Logo.png";

export const Navbar: React.FC = () => {
  const sucursales = [
    {
      name: "Escazu",
      location: "https://maps.app.goo.gl/vs1ArLzSubmfoRpA6",
      express: "https://www.ubereats.com/cr-en/store/jbs-burgers-escazu/KoXbu46cROqOdd4_YwtkGw",
    },
    {
      name: "Alajuela",
      location: "https://maps.app.goo.gl/isEEHrBHQ4KfU8hL8",
      express: "https://www.ubereats.com/cr/store/jbs-burgers-alajuela/8qN1q0W2WCisrKYvzLPqDA",
    },
    {
      name: "San Ramon",
      location: "https://maps.app.goo.gl/aaNVtLsFHeyELcn36",
      express: "https://www.ubereats.com/cr-en/store/jbs-san-ramon/_8_BSt-ZXgGYaCStxS0M_A",
    },
    {
      name: "Belen",
      location: "https://maps.app.goo.gl/y83aovdDqe6yivdn9",
      express: "https://www.ubereats.com/cr-en/store/jbs-burgers-belen/kd75zV_sSH-M7_1rcxukXg",
    },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDropdownClick = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav className={`navbar-main ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container" ref={navRef}>
        <Link to="/" className="navbar-logo">
          <img src={Logo} alt="JBs Logo" />
        </Link>

        <div className="navbar-desktop">
          <div className="nav-item">
            <button 
              className={`nav-link ${activeDropdown === 'express' ? 'active' : ''}`}
              onClick={() => handleDropdownClick('express')}
            >
              <Truck size={18} /> EXPRESS
            </button>
            {activeDropdown === 'express' && (
              <div className="dropdown-menu">
                {sucursales.map(s => (
                  <a key={s.name} href={s.express} target="_blank" rel="noreferrer">{s.name}</a>
                ))}
              </div>
            )}
          </div>

          <div className="nav-item">
            <button 
              className={`nav-link ${activeDropdown === 'locations' ? 'active' : ''}`}
              onClick={() => handleDropdownClick('locations')}
            >
              <MapPin size={18} /> UBICACIONES
            </button>
            {activeDropdown === 'locations' && (
              <div className="dropdown-menu">
                {sucursales.map(s => (
                  <a key={s.name} href={s.location} target="_blank" rel="noreferrer">{s.name}</a>
                ))}
              </div>
            )}
          </div>
          

        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <div className="navbar-mobile">
            <Link to="/" onClick={() => setIsOpen(false)}>INICIO</Link>
            <div className="mobile-section-title">EXPRESS</div>
            {sucursales.map(s => (
              <a key={s.name} href={s.express} target="_blank" rel="noreferrer">{s.name}</a>
            ))}
            <div className="mobile-section-title">UBICACIONES</div>
            {sucursales.map(s => (
              <a key={s.name} href={s.location} target="_blank" rel="noreferrer">{s.name}</a>
            ))}

          </div>
        )}
      </div>
    </nav>
  );
};
