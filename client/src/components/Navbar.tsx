import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import "./Navbar.css";
const Logo = "/assets/Logo.png";

export const Navbar: React.FC = () => {
  const sucursales = [
    {
      name: "Escazú",
      location: "https://maps.app.goo.gl/vs1ArLzSubmfoRpA6",
      express: "https://www.ubereats.com/cr-en/store/jbs-burgers-escazu/KoXbu46cROqOdd4_YwtkGw",
    },
    {
      name: "Belén",
      location: "https://maps.app.goo.gl/y83aovdDqe6yivdn9",
      express: "https://www.ubereats.com/cr-en/store/jbs-burgers-belen/kd75zV_sSH-M7_1rcxukXg",
    },
    {
      name: "Alajuela",
      location: "https://maps.app.goo.gl/isEEHrBHQ4KfU8hL8",
      express: "https://www.ubereats.com/cr/store/jbs-burgers-alajuela/8qN1q0W2WCisrKYvzLPqDA",
    },
    {
      name: "San Ramón",
      location: "https://maps.app.goo.gl/aaNVtLsFHeyELcn36",
      express: "https://www.ubereats.com/cr-en/store/jbs-san-ramon/_8_BSt-ZXgGYaCStxS0M_A",
    },
    {
      name: "San Rafael de Alajuela",
      location: "https://www.google.com/maps/search/JB's+Burgers+San+Rafael+de+Alajuela",
      express: "#",
    },
    {
      name: "Guapiles (frente al hospital)",
      location: "https://www.google.com/maps/search/JB's+Burgers+Guapiles",
      express: "#",
    },
    {
      name: "Curridabat (Vía Guayabos)",
      location: "https://www.google.com/maps/search/JB's+Burgers+Curridabat",
      express: "#",
    },
    {
      name: "San Rafael de Heredia",
      location: "https://www.google.com/maps/search/JB's+Burgers+San+Rafael+de+Heredia",
      express: "#",
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
