import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle, FiTruck, FiShield, FiMapPin,
  FiStar, FiUsers, FiKey, FiClock, FiCheck, FiCompass, FiAward,
} from 'react-icons/fi';
import { BsCarFront, BsStarFill } from 'react-icons/bs';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

import { useTenant } from '../../contexts/TenantContext';
import { subscribeToReviews } from '../../firebase/firestore';



const PROMISES = [
  {
    icon: <FiTruck size={24} />,
    title: 'Doorstep Delivery in 30 Mins',
    desc: 'We deliver your chosen car right to your doorstep or hotel in Pune within 30–45 minutes.',
  },
  {
    icon: <FiKey size={24} />,
    title: '300 KM Daily Limit Included',
    desc: '24-hour rentals include 300 km limit, perfect for outstation road trips to Lonavala, Mahabaleshwar & Mumbai.',
  },
  {
    icon: <FiShield size={24} />,
    title: 'Full Commercial Insurance',
    desc: 'All vehicles come registered with commercial permits & insurance coverage for complete peace of mind.',
  },
  {
    icon: <FiCheckCircle size={24} />,
    title: '100% Transparent Tariff',
    desc: 'No hidden fees, no surprise surcharges — pay rent + deposit at car pickup.',
  },
  {
    icon: <FiClock size={24} />,
    title: '24/7 WhatsApp & Phone Support',
    desc: 'Our local Pune support team is available round the clock at 8446469216 / 9049655717 / 9923336366.',
  },
  {
    icon: <FiStar size={24} />,
    title: '5 Mandatory Pickup Documents',
    desc: 'Original Aadhaar, Driving Licence, PAN Card, Rent Agreement & Job ID card required for quick pickup.',
  },
];

const MISSION_POINTS = [
  { title: '300 KM Daily Limit Included', desc: 'Sufficient kilometer limit included with every 24-hour rental package.' },
  { title: '30-Min Doorstep Handover', desc: 'Quick vehicle delivery to your home, office, or railway station in Pune.' },
  { title: '5 Mandatory Verified Docs', desc: 'Secure verification ensuring 100% safety for all drivers and vehicles.' },
  { title: 'Zero Hidden Surcharges', desc: 'Clear pricing with refundable deposit returned promptly on car return.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function AboutPage() {
  const { tenantId, settings } = useTenant();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsub = subscribeToReviews(tenantId, (data) => {
      setReviews(data || []);
    });
    return () => unsub();
  }, [tenantId]);

  const dynamicStats = [
    { label: 'Happy Renters', value: settings?.statsRenters || '500+', icon: <FiUsers size={22} /> },
    { label: 'Sanitized Rental Cars', value: settings?.statsFleet || '50+', icon: <BsCarFront size={22} /> },
    { label: 'Doorstep Delivery Time', value: settings?.statsDelivery || '30 Mins', icon: <FiTruck size={22} /> },
    { label: 'Customer Rating', value: settings?.statsRating || '4.9/5', icon: <FiStar size={22} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />

      <main style={{ paddingTop: 72, paddingBottom: 36, flex: 1 }}>

        {/* ─── Hero Header ─── */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', marginBottom: 32 }}>
          <div className="container" style={{ padding: '36px 16px 30px' }}>
            <span className="section-label-red" style={{ marginBottom: 10, display: 'inline-block' }}>
              About {settings?.businessName || "Jay Kedarnath Tours & Travels"}
            </span>
            <h1 style={{ fontSize: 'clamp(24px, 4.5vw, 38px)', fontWeight: 900, color: '#111318', margin: '0 0 10px', lineHeight: 1.25 }}>
              {settings?.aboutTitle ? (
                <span style={{
                  background: 'linear-gradient(135deg, #0B2545 0%, #FF4B1F 50%, #E62E00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {settings.aboutTitle}
                </span>
              ) : (
                <>
                  <span style={{ color: '#111318' }}>About</span>{' '}
                  <span style={{
                    background: 'linear-gradient(90deg, #FF4B1F 0%, #E62E00 50%, #C41C00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 900,
                  }}>Jay Kedarnath Tours & Travels</span>
                </>
              )}
            </h1>
            <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#64748B', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
              {settings?.aboutSubtitle || 'Driven by 100% transparency, verified cars, 300 km daily limit, and 30-minute doorstep delivery in Pune.'}
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '0 16px' }}>

          {/* ─── Dynamic Stats Grid ─── */}
          <div className="about-stats-grid" style={{ marginBottom: 32 }}>
            {dynamicStats.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: '22px 16px',
                  textAlign: 'center',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: 'rgba(255, 69, 0, 0.09)',
                  border: '1px solid rgba(255, 69, 0, 0.25)',
                  color: '#FF4500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {s.icon}
                </div>
                <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', color: '#FF4500', fontWeight: 900, margin: 0, lineHeight: 1 }}>
                  {s.value}
                </h2>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0, fontWeight: 700 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ─── OUR MISSION CARD ─── */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '28px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.05)',
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="section-label-red" style={{ margin: 0 }}>Our Core Mission</span>
            </div>

            <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 900, color: '#111318', marginBottom: 12, lineHeight: 1.25 }}>
              {settings?.aboutMissionHeading || 'Empowering Travelers with Seamless Tours & Travel Services'}
            </h2>

            <p style={{ fontSize: 'clamp(13.5px, 1.8vw, 15px)', color: '#475569', lineHeight: 1.7, marginBottom: 14, maxWidth: 850 }}>
              {settings?.aboutMissionText || 'We believe having a car for weekend family trips, business meetings, or hill-station drives should be simple — accessible on demand without ownership hassle.'}
            </p>

            <p style={{ fontSize: 'clamp(13px, 1.6vw, 14.5px)', color: '#64748B', lineHeight: 1.7, marginBottom: 24, maxWidth: 850 }}>
              {settings?.aboutStoryText || 'Every vehicle in our fleet is deep-sanitized, digitally verified, and handed over with complete document verification.'}
            </p>

            {/* Mission Key Feature Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}>
              {MISSION_POINTS.map((mp, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 14,
                    padding: '16px 14px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255, 69, 0, 0.12)',
                    color: '#FF4500',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 14,
                    fontWeight: 800,
                  }}>
                    <FiCheck />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: '#111318', display: 'block', marginBottom: 3, fontWeight: 800 }}>
                      {mp.title}
                    </strong>
                    <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, display: 'block' }}>
                      {mp.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── OFFICIAL REGISTRATION & CREDENTIALS CARD ─── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.05) 0%, #FFFFFF 100%)',
            borderRadius: 18,
            padding: '24px 22px',
            border: '1.5px solid rgba(255, 69, 0, 0.25)',
            boxShadow: '0 6px 24px rgba(15, 23, 42, 0.05)',
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div>
                <span className="section-label-red" style={{ margin: '0 0 6px', display: 'inline-block' }}>
                  Legal &amp; Business Credentials
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: 0 }}>
                  Government Registered &amp; Verified Travel Operator
                </h3>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#DCFCE7',
                color: '#15803D',
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 900,
              }}>
                <FiShield size={14} /> 100% Tax Compliant
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}>
              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  GSTIN Registration NO.
                </span>
                <strong style={{ fontSize: 15, color: '#FF4500', fontFamily: 'monospace', letterSpacing: '0.6px' }}>
                  {settings?.gstin || '27BYAPM5338L1Z3'}
                </strong>
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Office Address
                </span>
                <span style={{ fontSize: 13, color: '#111827', fontWeight: 700, lineHeight: 1.4, display: 'block' }}>
                  {settings?.address || 'Flat No. B1-17, Siddhivinayak complex Shinde Pool, NDA Road, Shivne, Pune 411023.'}
                </span>
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Email Address
                </span>
                <a href={`mailto:${settings?.email || 'shashikantmaske1958@gmail.com'}`} style={{ fontSize: 13, color: '#111827', fontWeight: 800, textDecoration: 'none', wordBreak: 'break-all' }}>
                  {settings?.email || 'shashikantmaske1958@gmail.com'}
                </a>
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Helpline Mobiles
                </span>
                <span style={{ fontSize: 13, color: '#111827', fontWeight: 800, display: 'block' }}>
                  8446469216 / 9049655717 / 9923336366
                </span>
              </div>
            </div>
          </div>



          {/* ─── WHY CHOOSE US CARD GRID ─── */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="section-label-red" style={{ display: 'inline-block', marginBottom: 6 }}>Why Choose Us</span>
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, color: '#111318', margin: 0 }}>
                Everything You Need For A Safe Trip
              </h2>
            </div>
            <div className="about-cards-grid">
              {PROMISES.map((p, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: '20px 18px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(255, 69, 0, 0.08)',
                    border: '1px solid rgba(255, 69, 0, 0.20)',
                    color: '#FF4500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    {p.icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111318', margin: '0 0 6px' }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── LIVE DYNAMIC REVIEWS SECTION ─── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span className="section-label-red" style={{ display: 'inline-block', marginBottom: 6 }}>Customer Feedback</span>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, color: '#111318', margin: 0 }}>
                  What Our Renters Say
                </h2>
              </div>
              <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiCheckCircle /> Verified Renter Reviews ({reviews.length})
              </span>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: 13 }}>
                No customer reviews published yet. Admin can add live reviews in Admin Panel Settings.
              </div>
            ) : (
              <div className="about-cards-grid">
                {reviews.map((rev, idx) => (
                  <div
                    key={rev.id || idx}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 16,
                      padding: '20px 18px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 14,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', color: '#F59E0B', gap: 2 }}>
                          {Array.from({ length: rev.rating || 5 }).map((_, rIdx) => (
                            <BsStarFill key={rIdx} size={14} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{rev.date || 'Verified'}</span>
                      </div>

                      <p style={{ fontSize: 13, color: '#000000', lineHeight: 1.6, margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
                        "{rev.comment}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: '50%',
                        background: 'rgba(255, 69, 0,0.08)',
                        color: '#FF4500',
                        fontWeight: 800,
                        fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {rev.name?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <strong style={{ fontSize: 13, color: '#000000', display: 'block', lineHeight: 1.2 }}>{rev.name}</strong>
                        <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>{rev.location || 'Pune'} • {rev.carName || 'Travel Vehicle'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />

      <style>{`
        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .about-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .about-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .about-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .about-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .about-cards-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .about-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
