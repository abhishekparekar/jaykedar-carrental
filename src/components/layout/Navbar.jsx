import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiPhone, FiCalendar, FiChevronRight,
  FiHome, FiTruck, FiInfo, FiPhoneCall, FiFileText, FiCheckCircle, FiClock, FiShield
} from 'react-icons/fi';
import { BsWhatsapp, BsInstagram } from 'react-icons/bs';

import logoImg from '../../assets/Jaylogo2.png';
import navbarBgImg from '../../assets/navbar_bg.png';
import { useTenant } from '../../contexts/TenantContext';

const navLinks = [
  { label: 'Home', to: '/', icon: <FiHome size={18} /> },
  { label: 'Fleet', to: '/fleet', icon: <FiTruck size={18} /> },
  { label: 'About Us', to: '/about', icon: <FiInfo size={18} /> },
  { label: 'Contact', to: '/contact', icon: <FiPhoneCall size={18} /> },
  { label: 'My Inquiries', to: '/my-inquiries', icon: <FiFileText size={18} /> },
];

export default function Navbar() {
  const { settings } = useTenant();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const phoneRaw = settings?.phone || '+91 8485877633';
  const cleanPhone = phoneRaw.replace(/\D/g, '');

  const handleLogoClick = (e) => {
    setMenuOpen(false);
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 9999,
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="container navbar-inner-bar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
          position: 'relative',
        }}>

          {/* ── Logo Branding (Crisp, High-Visibility Transparent Emblem) ── */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="navbar-brand-link"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <img
              src={logoImg}
              alt="Jay Kedarnath Tours & Travels"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="navbar-brand-logo-img"
            />
          </Link>

          {/* ── Desktop Executive Navigation Links ── */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className="desktop-nav-item"
                style={({ isActive }) => ({
                  position: 'relative',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: 14,
                  fontWeight: isActive ? 900 : 700,
                  color: isActive ? '#FFFFFF' : '#374151',
                  background: isActive ? 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)' : 'transparent',
                  border: 'none',
                  boxShadow: isActive ? '0 4px 14px rgba(230, 46, 0, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                })}
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          left: '25%',
                          right: '25%',
                          height: 3,
                          borderRadius: 2,
                          background: 'linear-gradient(90deg, #FF4B1F 0%, #E62E00 100%)',
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right Actions: Desktop Call/Book & Mobile Clean Buttons ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Desktop Direct Phone Pill */}
            <a
              href={`tel:${cleanPhone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 16px',
                borderRadius: '9999px',
                background: '#F8FAFC',
                border: '1px solid #E5E7EB',
                color: '#111827',
                fontSize: 13.5,
                fontWeight: 800,
                textDecoration: 'none',
              }}
              className="desktop-nav"
            >
              <FiPhone size={14} style={{ color: '#FF4500' }} />
              <span>{phoneRaw}</span>
            </a>

            {/* Desktop Book Now Button */}
            <Link
              to="/fleet"
              className="btn btn-primary desktop-nav"
              style={{
                padding: '8px 22px',
                fontSize: 14,
                fontWeight: 800,
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 50%, #C41C00 100%)',
                color: '#FFFFFF',
                boxShadow: '0 6px 20px rgba(230, 46, 0, 0.40)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              <FiCalendar size={15} /> Book Now
            </Link>

            {/* 📱 MOBILE QUICK DIRECT CALL BUTTON (Mobile Only) */}
            <a
              href={`tel:${cleanPhone}`}
              className="mobile-only-flex"
              aria-label="Call Support"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                color: '#FFFFFF',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(230, 46, 0, 0.35)',
                textDecoration: 'none',
              }}
            >
              <FiPhoneCall size={17} />
            </a>

            {/* 📱 MOBILE MENU TOGGLE BUTTON (Mobile Only) */}
            <button
              type="button"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle Menu"
              className="mobile-only-flex"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: menuOpen ? 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)' : 'rgba(255, 255, 255, 0.95)',
                border: menuOpen ? '1.5px solid #E62E00' : '1.5px solid rgba(230, 46, 0, 0.30)',
                color: menuOpen ? '#FFFFFF' : '#111827',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 📱 CLEAN & CLUTTER-FREE MOBILE NAVIGATION DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop Dark Glass Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'rgba(15, 23, 42, 0.70)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />

            {/* Slide-Over Sleek Mobile Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '72%',
                maxWidth: 260,
                zIndex: 10001,
                background: '#FFFFFF',
                boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              {/* Drawer Top Header */}
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FFFFFF',
              }}>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <img
                    src={logoImg}
                    alt="Jay Kedarnath Tours & Travels"
                    className="navbar-brand-logo-img"
                    style={{ height: 54, width: 54, maxHeight: 54, objectFit: 'contain' }}
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <FiX size={14} />
                </button>
              </div>

              {/* Drawer Main Navigation Links */}
              <div style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    style={({ isActive }) => ({
                      padding: '9px 12px',
                      borderRadius: 10,
                      fontSize: 13.5,
                      fontWeight: isActive ? 900 : 700,
                      color: isActive ? '#FFFFFF' : '#111827',
                      background: isActive ? 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)' : '#FFFFFF',
                      border: isActive ? '1.5px solid #E62E00' : '1px solid #F1F5F9',
                      boxShadow: isActive ? '0 3px 10px rgba(230, 46, 0, 0.30)' : 'none',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(230, 46, 0, 0.10)',
                            color: isActive ? '#FFFFFF' : '#FF4500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {link.icon}
                          </div>
                          <span>{link.label}</span>
                        </div>
                        {isActive ? (
                          <FiCheckCircle size={14} color="#FFFFFF" />
                        ) : (
                          <FiChevronRight size={13} style={{ color: '#94A3B8' }} />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Drawer Bottom Direct Action Buttons */}
              <div style={{
                padding: '10px 10px 16px',
                borderTop: '1px solid #F1F5F9',
                background: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}>
                <a
                  href={`tel:${cleanPhone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    background: '#111827',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 900,
                    textDecoration: 'none',
                  }}
                >
                  <FiPhoneCall size={14} /> Call {phoneRaw}
                </a>

                <a
                  href={`https://wa.me/${(settings?.whatsapp || '918485877633').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(settings?.businessName || "Jay Kedarnath Tours & Travels")},%20I%20want%20to%20book%20a%20car.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 900,
                    textDecoration: 'none',
                  }}
                >
                  <BsWhatsapp size={14} /> WhatsApp
                </a>

                <a
                  href={settings?.instagram || 'https://ig.me/m/founder_abhishek'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 900,
                    textDecoration: 'none',
                  }}
                >
                  <BsInstagram size={14} /> Instagram DM (@founder_abhishek)
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-nav {
          display: flex !important;
        }
        .mobile-only-flex {
          display: none !important;
        }
        .navbar-brand-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
          padding: 2px 0;
        }
        .navbar-brand-logo-img {
          height: 60px;
          width: 60px;
          max-height: 60px;
          object-fit: contain;
          display: block;
          image-rendering: -webkit-optimize-contrast;
          filter: drop-shadow(0 2px 8px rgba(15, 23, 42, 0.18));
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .navbar-brand-link:hover .navbar-brand-logo-img {
          transform: scale(1.08);
        }
        .navbar-inner-bar {
          height: 70px !important;
        }

        @media (max-width: 980px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-only-flex {
            display: flex !important;
          }
          .navbar-brand-link {
            margin-left: 0 !important;
          }
          .navbar-brand-logo-img {
            height: 52px !important;
            width: 52px !important;
            max-height: 52px !important;
          }
          .navbar-inner-bar {
            height: 64px !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-brand-logo-img {
            height: 48px !important;
            width: 48px !important;
            max-height: 48px !important;
          }
          .navbar-inner-bar {
            height: 60px !important;
          }
        }
        @media (max-width: 360px) {
          .navbar-brand-logo-img {
            height: 44px !important;
            width: 44px !important;
            max-height: 44px !important;
          }
          .navbar-inner-bar {
            height: 56px !important;
          }
        }
      `}</style>
    </>
  );
}
