import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTwitterX, BsYoutube, BsWhatsapp } from 'react-icons/bs';
import { 
  FiMail, FiPhone, FiMapPin, FiShield, FiChevronRight 
} from 'react-icons/fi';
import logoImg from '../../assets/Jaylogo2.png';
import { useTenant } from '../../contexts/TenantContext';

export default function Footer() {
  const { settings } = useTenant();

  const footerNavLinks = [
    { label: 'Home Page',    to: '/' },
    { label: 'Our Fleet',    to: '/fleet' },
    { label: 'About Us',     to: '/about' },
    { label: 'Contact Us',   to: '/contact' },
    { label: 'My Inquiries', to: '/my-inquiries' },
  ];

  const categoryLinks = [
    { label: 'Hatchback Fleet', to: '/fleet?category=hatchback' },
    { label: 'Sedan Fleet',     to: '/fleet?category=sedan' },
    { label: 'SUV & 4x4 Fleet', to: '/fleet?category=suv' },
    { label: 'Luxury Cars',    to: '/fleet?category=luxury' },
  ];

  const socials = [
    { icon: <BsFacebook />,  href: settings?.facebook || '#', label: 'Facebook', hoverBg: '#1877F2' },
    { icon: <BsInstagram />, href: settings?.instagram || 'https://instagram.com', label: 'Instagram', hoverBg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { icon: <BsTwitterX />,  href: settings?.twitter || '#', label: 'Twitter/X', hoverBg: '#000000' },
    { icon: <BsYoutube />,   href: settings?.youtube || '#', label: 'YouTube', hoverBg: '#FF0000' },
  ];

  const phoneList = (settings?.phones && settings.phones.length > 0)
    ? settings.phones
    : ['8446469216', '9049655717', '9923336366'];

  const rawWhatsapp = settings?.whatsapp || '918446469216';
  const whatsappNumber = rawWhatsapp.replace(/\D/g, '').startsWith('91')
    ? rawWhatsapp.replace(/\D/g, '')
    : `91${rawWhatsapp.replace(/\D/g, '')}`;

  const gstinNumber = settings?.gstin || '27BYAPM5338L1Z3';
  const displayAddress = settings?.address || 'Flat No. B1-17, Siddhivinayak complex Shinde Pool, NDA Road, Shivne, Pune 411023.';
  const displayEmail = settings?.email || 'shashikantmaske1958@gmail.com';
  const businessName = settings?.businessName || "Jay Kedarnath Tours & Travels";

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
        boxShadow: '0 0 16px rgba(230, 46, 0, 0.70)',
      }} />

      <div style={{ padding: '28px 0 16px' }}>
        <div className="container" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 16px' }}>
          <div className="footer-grid">

            {/* ── 1. Brand & Business Info Column ── */}
            <div className="footer-brand-col">
              <Link to="/" style={{ display: 'inline-block', marginBottom: 10, textDecoration: 'none' }}>
                <img
                  src={logoImg}
                  alt={businessName}
                  style={{
                    height: 70,
                    width: 70,
                    maxHeight: 70,
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'drop-shadow(0 3px 14px rgba(230, 46, 0, 0.45))',
                    transition: 'transform 0.25s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </Link>

              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '0.3px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {businessName}
              </h3>

              <p style={{ fontSize: 12.5, color: '#CBD5E1', lineHeight: 1.55, margin: '0 0 10px', maxWidth: 300, fontWeight: 500 }}>
                {settings?.tagline || 'Premium cab and vehicle rentals for outstation trips, local journeys, and spiritual pilgrimages across Pune and Maharashtra.'}
              </p>

              {/* Verified GSTIN Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 69, 0, 0.12)',
                border: '1px solid rgba(255, 69, 0, 0.40)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 12,
              }}>
                <FiShield color="#FF4500" size={13} />
                <span>GSTIN NO. : <strong style={{ color: '#FF9466', fontFamily: 'monospace' }}>{gstinNumber}</strong></span>
              </div>

              {/* Social Media Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.10)',
                      border: '1px solid rgba(255, 255, 255, 0.20)',
                      color: '#FFFFFF',
                      fontSize: 14,
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
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.10)';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.20)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── 2. Quick Navigation ── */}
            <div className="footer-links-col">
              <h4 style={{
                fontSize: 12.5,
                fontWeight: 900,
                color: '#FF4500',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: '0 0 12px',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                Quick Navigation
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                {footerNavLinks.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                      style={{
                        fontSize: 13,
                        color: '#E2E8F0',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#FF4500';
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = '#E2E8F0';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <FiChevronRight size={13} color="#FF4500" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── 3. Car Categories ── */}
            <div className="footer-links-col">
              <h4 style={{
                fontSize: 12.5,
                fontWeight: 900,
                color: '#FF4500',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: '0 0 12px',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                Car Categories
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                {categoryLinks.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                      style={{
                        fontSize: 13,
                        color: '#E2E8F0',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#FF4500';
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = '#E2E8F0';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <FiChevronRight size={13} color="#FF4500" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── 4. Contact Us ── */}
            <div className="footer-contact-col">
              <h4 style={{
                fontSize: 12.5,
                fontWeight: 900,
                color: '#FF4500',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                margin: '0 0 12px',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                Contact Us
              </h4>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14, listStyle: 'none', padding: 0, margin: '0 0 14px' }}>
                {/* Phones */}
                <li>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(230, 46, 0, 0.35)',
                      marginTop: 1,
                    }}>
                      <FiPhone size={13} color="#FFFFFF" />
                    </div>
                    <div>
                      <span style={{ fontSize: 10.5, color: '#94A3B8', display: 'block', fontWeight: 700, marginBottom: 2 }}>
                        Mobile / Call Support:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 6px', fontSize: 12.5, fontWeight: 800 }}>
                        {phoneList.map((ph, idx) => (
                          <span key={ph} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <a
                              href={`tel:${ph}`}
                              style={{
                                color: '#FFFFFF',
                                textDecoration: 'none',
                                transition: 'color 0.18s ease',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
                              onMouseLeave={e => e.currentTarget.style.color = '#FFFFFF'}
                            >
                              {ph}
                            </a>
                            {idx < phoneList.length - 1 && <span style={{ color: '#FF4500' }}>/</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                {/* Email */}
                <li>
                  <a
                    href={`mailto:${displayEmail}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12.5,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'color 0.18s ease',
                      wordBreak: 'break-all',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
                    onMouseLeave={e => e.currentTarget.style.color = '#FFFFFF'}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(230, 46, 0, 0.35)',
                    }}>
                      <FiMail size={13} color="#FFFFFF" />
                    </div>
                    <span>{displayEmail}</span>
                  </a>
                </li>

                {/* Address */}
                <li>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#E2E8F0', fontWeight: 600, lineHeight: 1.45 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(230, 46, 0, 0.35)',
                      marginTop: 1,
                    }}>
                      <FiMapPin size={13} color="#FFFFFF" />
                    </div>
                    <span>{displayAddress}</span>
                  </div>
                </li>

                {/* GSTIN Box */}
                <li>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(255, 69, 0, 0.14)',
                    border: '1px solid rgba(255, 69, 0, 0.40)',
                  }}>
                    <FiShield size={14} color="#FF7A45" style={{ flexShrink: 0 }} />
                    <span>GSTIN NO. : <strong style={{ color: '#FFD8CC', fontFamily: 'monospace' }}>{gstinNumber}</strong></span>
                  </div>
                </li>
              </ul>

              {/* Dynamic WhatsApp Button */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(businessName)},%20I%20want%20to%20book%20a%20car.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <BsWhatsapp size={16} /> Book on WhatsApp
              </a>
            </div>

          </div>

          {/* ── Bottom Divider & Copyright Bar ── */}
          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.12)', margin: '18px 0 12px' }} />

          <div className="footer-bottom-bar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            paddingRight: 64, // Keep clearance from floating WhatsApp button on bottom-right
          }}>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 500 }}>
              © {new Date().getFullYear()} <strong style={{ color: '#FFFFFF' }}>{businessName}</strong> • <strong style={{ color: '#E2E8F0' }}>GSTIN NO. : {gstinNumber}</strong>. All rights reserved.
            </p>

            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94A3B8', fontWeight: 600, flexWrap: 'wrap' }}>
              <Link to="/about" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} style={{ color: '#CBD5E1', textDecoration: 'none' }}>About Us</Link>
              <span>•</span>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} style={{ color: '#CBD5E1', textDecoration: 'none' }}>Contact Support</Link>
              <span>•</span>
              <Link to="/fleet" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })} style={{ color: '#CBD5E1', textDecoration: 'none' }}>Fleet</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.85fr 0.85fr 1.35fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.2fr 1fr !important;
            gap: 24px !important;
          }
          .footer-bottom-bar {
            padding-right: 70px !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .footer-links-col {
            display: inline-block;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding-right: 0 !important;
            padding-bottom: 24px !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </footer>
  );
}