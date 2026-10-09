import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitterX, BsYoutube, BsWhatsapp } from 'react-icons/bs';
import { 
  FiMail, FiPhone, FiMapPin, FiShield, FiArrowRight, FiCheckCircle, 
  FiChevronRight, FiTruck, FiClock, FiCalendar
} from 'react-icons/fi';
import logoImg from '../../assets/Jaylogo2.png';
import footerBgImg from '../../assets/footerbg.jpg';
import { useTenant } from '../../contexts/TenantContext';

export default function Footer() {
  const { settings } = useTenant();

  const footerLinks = {
    'Quick Navigation': [
      { label: 'Home Page',    to: '/' },
      { label: 'Our Fleet',    to: '/fleet' },
      { label: 'About Us',     to: '/about' },
      { label: 'Contact Us',   to: '/contact' },
      { label: 'My Inquiries', to: '/my-inquiries' },
    ],
    'Car Categories': [
      { label: 'Hatchback Fleet', to: '/fleet?category=hatchback' },
      { label: 'Sedan Fleet',     to: '/fleet?category=sedan' },
      { label: 'SUV & 4x4 Fleet', to: '/fleet?category=suv' },
      { label: 'Luxury Cars',    to: '/fleet?category=luxury' },
    ],
  };

  const socials = [
    { icon: <BsFacebook />,  href: settings?.facebook || '#', label: 'Facebook', hoverBg: '#1877F2' },
    { icon: <BsInstagram />, href: settings?.instagram || 'https://ig.me/m/founder_abhishek', label: 'Instagram', hoverBg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { icon: <BsTwitterX />,  href: settings?.twitter || '#', label: 'Twitter/X', hoverBg: '#000000' },
    { icon: <BsYoutube />,   href: settings?.youtube || '#', label: 'YouTube', hoverBg: '#FF0000' },
  ];

  const rawPhone = settings?.phone || '+91 8485877633';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const rawWhatsapp = settings?.whatsapp || cleanPhone || '918485877633';
  const whatsappNumber = rawWhatsapp.startsWith('91') ? rawWhatsapp : `91${rawWhatsapp}`;

  return (
    <footer
      className="footer-root"
      style={{
        background: '#0F172A',
        position: 'relative',
        marginTop: 'auto',
        color: '#FFFFFF',
        borderTop: '1.5px solid rgba(255, 69, 0, 0.40)',
      }}
    >
      {/* Top Glowing Saffron Accent Bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #FF4B1F 0%, #E62E00 50%, #C41C00 100%)',
        width: '100%',
        boxShadow: '0 0 20px rgba(230, 46, 0, 0.75)',
      }} />

      <div style={{ padding: '56px 0 28px' }}>
        <div className="container">
          <div className="footer-grid">

            {/* ── 1. Brand & Business Info Column (NO BG BOX) ── */}
            <div className="footer-brand-col">
              <Link to="/" style={{ display: 'inline-block', marginBottom: 16, textDecoration: 'none' }}>
                <img
                  src={logoImg}
                  alt={settings?.businessName || "Jay Kedarnath Tours & Travels"}
                  style={{
                    height: 94,
                    width: 94,
                    maxHeight: 94,
                    objectFit: 'contain',
                    display: 'block',
                    imageRendering: '-webkit-optimize-contrast',
                    filter: 'drop-shadow(0 4px 20px rgba(230, 46, 0, 0.50))',
                    transition: 'transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </Link>

              <h3 style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', marginBottom: 10, letterSpacing: '0.4px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {settings?.businessName || "Jay Kedarnath Tours & Travels"}
              </h3>

              <p style={{ fontSize: 13.5, color: '#E2E8F0', lineHeight: 1.65, marginBottom: 20, maxWidth: 320, fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                {settings?.tagline || 'Premium cab and vehicle rentals for outstation trips, local journeys, and spiritual pilgrimages across Pune and Maharashtra.'}
              </p>

              {/* Social Media Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      fontSize: 16,
                      backdropFilter: 'blur(4px)',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = s.hoverBg || '#FF4500';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── 2. Link Navigation Columns (NO BG BOX) ── */}
            <div className="footer-links-container">
              {Object.entries(footerLinks).map(([group, links]) => (
                <div key={group} className="footer-link-group">
                  <h4 style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#FF4500',
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                    marginBottom: 18,
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}>{group}</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0 }}>
                    {links.map(link => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                          style={{
                            fontSize: 14,
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 700,
                            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#FF4500';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <FiChevronRight size={14} color="#FF4500" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── 3. Contact & Quick Inquiry CTAs (NO BG BOX) ── */}
            <div className="footer-contact-col">
              <h4 style={{
                fontSize: 13,
                fontWeight: 900,
                color: '#FF4500',
                letterSpacing: '1.4px',
                textTransform: 'uppercase',
                marginBottom: 18,
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>Contact Us</h4>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22, listStyle: 'none', padding: 0 }}>
                <li>
                  <a
                    href={`tel:${rawPhone.replace(/\s+/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 14,
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontWeight: 800,
                      transition: 'color 0.18s ease',
                      textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
                    onMouseLeave={e => e.currentTarget.style.color = '#FFFFFF'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(230, 46, 0, 0.40)',
                    }}>
                      <FiPhone size={15} color="#FFFFFF" />
                    </div>
                    <span>{rawPhone}</span>
                  </a>
                </li>

                <li>
                  <a
                    href={`mailto:${settings?.email || 'abhiparekar58@gmail.com'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13.5,
                      color: '#FFFFFF',
                      fontWeight: 800,
                      textDecoration: 'none',
                      transition: 'color 0.18s ease',
                      wordBreak: 'break-all',
                      textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
                    onMouseLeave={e => e.currentTarget.style.color = '#FFFFFF'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(230, 46, 0, 0.40)',
                    }}>
                      <FiMail size={15} color="#FFFFFF" />
                    </div>
                    <span>{settings?.email || 'abhiparekar58@gmail.com'}</span>
                  </a>
                </li>

                <li>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#FFFFFF', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(230, 46, 0, 0.40)',
                    }}>
                      <FiMapPin size={15} color="#FFFFFF" />
                    </div>
                    <span>{settings?.address || 'Pune, Maharashtra'}</span>
                  </div>
                </li>
              </ul>

              {/* Dynamic WhatsApp Button */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(settings?.businessName || "Jay Kedarnath Tours & Travels")},%20I%20want%20to%20book%20a%20car.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(37,211,102,0.40)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BsWhatsapp size={18} /> Book on WhatsApp
              </a>
            </div>

          </div>

          {/* ── Bottom Divider & Copyright Bar (NO BG BOX) ── */}
          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.15)', margin: '36px 0 20px' }} />

          <div className="footer-bottom-bar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              © {new Date().getFullYear()} <strong style={{ color: '#FFFFFF' }}>{settings?.businessName || "Jay Kedarnath Tours & Travels"}</strong>. All rights reserved.
            </p>

            <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: '#CBD5E1', fontWeight: 700, flexWrap: 'wrap', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              <Link to="/about" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} style={{ color: '#FFFFFF', textDecoration: 'none' }}>About Us</Link>
              <span>•</span>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} style={{ color: '#FFFFFF', textDecoration: 'none' }}>Contact Support</Link>
              <span>•</span>
              <Link to="/fleet" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} style={{ color: '#FFFFFF', textDecoration: 'none' }}>Travel &amp; Tour Fleet</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 3fr 1.3fr;
          gap: 36px;
        }
        .footer-links-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .footer-links-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 640px) {
          .footer-links-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 22px 16px !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            justify-content: center !important;
            text-align: center !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </footer>
  );
}
