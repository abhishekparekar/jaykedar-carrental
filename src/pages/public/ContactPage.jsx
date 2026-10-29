import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMail, FiPhone, FiMapPin, FiSend, FiClock,
  FiCheckCircle, FiZap, FiMessageSquare, FiShield, FiPhoneCall,
} from 'react-icons/fi';
import { BsWhatsapp, BsInstagram, BsCarFront, BsCarFrontFill } from 'react-icons/bs';
import toast from 'react-hot-toast';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { addInquiry } from '../../firebase/firestore';

import heroBgImg from '../../assets/herobg2.jpg';

const CITIES = ['Pune', 'Mumbai', 'Pimpri-Chinchwad', 'Lonavala', 'Outstation'];
const CAR_CATEGORIES = ['All Fleet / Any Car', 'Hatchback (Swift, i20, Baleno)', 'Sedan & CNG (Dzire)', 'SUV & 4x4 (Thar, Punch, Venue)', '7-Seater MUV (Ertiga)'];

export default function ContactPage() {
  const { tenantId, settings } = useTenant();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phoneList = (settings?.phones && settings.phones.length > 0)
    ? settings.phones
    : ['8446469216', '9049655717', '9923336366'];
  const primaryPhone = phoneList[0] || '8446469216';
  const email = settings?.email || 'shashikantmaske1958@gmail.com';
  const address = settings?.address || 'Flat No. B1-17, Siddhivinayak complex Shinde Pool, NDA Road, Shivne, Pune 411023.';
  const rawWhatsapp = settings?.whatsapp || '918446469216';
  const whatsapp = rawWhatsapp.replace(/\D/g, '').startsWith('91')
    ? rawWhatsapp.replace(/\D/g, '')
    : `91${rawWhatsapp.replace(/\D/g, '')}`;
  const gstin = settings?.gstin || '27BYAPM5338L1Z3';
  const hours = settings?.businessHours || '24 Hours • 365 Days Doorstep Delivery';

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    city: 'Pune',
    category: 'All Fleet / Any Car',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.message) {
      toast.error('Please fill in required name, phone, and message');
      return;
    }

    setSubmitting(true);
    try {
      await addInquiry(tenantId, {
        carId: null,
        carName: `Contact Form — ${form.category}`,
        customerName: form.customerName,
        email: form.email || 'N/A',
        phone: form.phone,
        city: form.city,
        message: form.message,
        pickupType: 'Doorstep Delivery',
      }, user?.uid || 'guest');
      setSubmitted(true);
      toast.success('Inquiry submitted! Our manager will reach out within 15 minutes.');
    } catch (err) {
      console.error('Error submitting contact form:', err);
      toast.error('Failed to submit message. Please try WhatsApp directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />

      <main style={{ paddingTop: 110, paddingBottom: 48, flex: 1 }}>

        {/* ─── Hero Header Block ─── */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', marginBottom: 32 }}>
          <div className="container" style={{ padding: '32px 20px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{
                background: 'rgba(255, 69, 0, 0.08)',
                color: '#FF4500',
                border: '1px solid rgba(255, 69, 0, 0.25)',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                display: 'inline-block',
              }}>
                Contact &amp; Instant Rental Quote
              </span>
              <span style={{
                background: '#FFFFFF',
                color: '#111827',
                border: '1.5px solid rgba(255, 69, 0, 0.35)',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(255, 69, 0, 0.08)',
              }}>
                <FiShield size={13} color="#FF4500" />
                <span>GSTIN NO. : <strong style={{ color: '#E62E00', fontFamily: 'monospace' }}>{gstin}</strong></span>
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 4.5vw, 36px)', fontWeight: 900, color: '#111827', margin: '0 0 8px', lineHeight: 1.25 }}>
              Get in Touch with <span style={{ color: '#FF4500' }}>Tours &amp; Travel Support</span>
            </h1>
            <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#4B5563', margin: 0, maxWidth: 620, lineHeight: 1.6, fontWeight: 600 }}>
              Have questions about daily rental rates, 30-minute doorstep delivery, or outstation packages? Submit your inquiry below or connect live on WhatsApp.
            </p>
          </div>
        </div>

        <div className="container" style={{ width: '100%' }}>

          {/* ─── Main 2-Column Section: Left Form + Right Urgent Delivery Showcase ─── */}
          <div className="contact-main-grid" style={{ marginBottom: 36 }}>
            
            {/* Left Column: Executive Contact Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 24,
                padding: '28px 30px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Signature Vector Wave Accent */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 95, height: 95, overflow: 'hidden', borderTopRightRadius: 24, pointerEvents: 'none', zIndex: 1 }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M0 0 C50 10, 90 40, 100 100 L100 0 Z" fill="#FF4500" opacity="0.15" />
                  <path d="M20 0 C65 15, 95 50, 100 85 L100 0 Z" fill="#E62E00" opacity="0.30" />
                </svg>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                    color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(230, 46, 0, 0.40)',
                  }}>
                    <FiCheckCircle size={30} />
                  </div>
                  <h3 style={{ fontSize: 20, color: '#111827', fontWeight: 900, margin: 0 }}>Rental Inquiry Received!</h3>
                  <p style={{ fontSize: 14, color: '#4B5563', maxWidth: 360, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                    Thank you! Our rental representative will review your message and contact you within 15 minutes.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(settings?.businessName || "Jay Kedarnath Tours & Travels")},%20I%20just%20submitted%20a%20contact%20inquiry.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)', borderColor: '#25D366', color: '#FFFFFF', padding: '10px 20px', fontSize: 13.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, borderRadius: '9999px' }}
                    >
                      <BsWhatsapp size={16} /> WhatsApp Manager
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 18px', fontSize: 13.5, fontWeight: 800, borderRadius: '9999px' }}
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 2 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BsCarFront color="#FF4500" size={22} /> Reserve or Inquire Vehicle
                    </h2>
                    <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                      Fill in your details below for instant doorstep delivery quote.
                    </span>
                  </div>

                  <div className="grid-2" style={{ gap: 14 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Amit Patil"
                        value={form.customerName}
                        onChange={e => setForm({ ...form, customerName: e.target.value })}
                        style={{ height: 42, fontSize: 13.5, borderRadius: 12, border: '1.5px solid #E2E8F0' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Mobile Number (+91) *</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        style={{ height: 42, fontSize: 13.5, borderRadius: 12, border: '1.5px solid #E2E8F0' }}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: 14 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Email Address (Optional)</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        style={{ height: 42, fontSize: 13.5, borderRadius: 12, border: '1.5px solid #E2E8F0' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 4 }}>City / Location</label>
                      <select
                        className="form-select"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        style={{ height: 42, fontSize: 13.5, borderRadius: 12, border: '1.5px solid #E2E8F0' }}
                      >
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Vehicle Category Preference</label>
                    <select
                      className="form-select"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={{ height: 42, fontSize: 13.5, borderRadius: 12, border: '1.5px solid #E2E8F0' }}
                    >
                      {CAR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Inquiry Message or Dates *</label>
                    <textarea
                      required
                      rows={3}
                      className="form-textarea"
                      placeholder="Specify travel dates, vehicle model (e.g. Thar, Swift, Ertiga), or doorstep delivery location..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={{ fontSize: 13.5, borderRadius: 12, border: '1.5px solid #E2E8F0' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg w-full"
                    style={{
                      background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 50%, #C41C00 100%)',
                      border: 'none',
                      fontSize: 15,
                      fontWeight: 900,
                      padding: '13px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 6px 20px rgba(230, 46, 0, 0.40)',
                      color: '#FFFFFF',
                    }}
                  >
                    {submitting ? 'Submitting Message...' : <><FiSend size={16} /> Submit Inquiry Message</>}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Right Column: "NEED URGENT CAR DELIVERY?" Showcase Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                background: `linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(241, 245, 249, 0.95) 100%), url("${heroBgImg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 20,
              }}
            >
              {/* Signature Vector Wave Accent */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 85, height: 85, overflow: 'hidden', borderTopRightRadius: 24, pointerEvents: 'none', zIndex: 1 }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M0 0 C50 10, 90 40, 100 100 L100 0 Z" fill="#FF4500" opacity="0.15" />
                  <path d="M20 0 C65 15, 95 50, 100 85 L100 0 Z" fill="#E62E00" opacity="0.30" />
                </svg>
              </div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 900,
                  marginBottom: 14,
                  boxShadow: '0 4px 14px rgba(230, 46, 0, 0.35)',
                  letterSpacing: '0.5px',
                }}>
                  <FiZap size={15} /> 30-MIN EMERGENCY DISPATCH
                </div>

                <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 10px', color: '#111827', lineHeight: 1.2 }}>
                  NEED URGENT CAR DELIVERY?
                </h3>

                <p style={{ fontSize: 13.5, color: '#334155', margin: '0 0 18px', lineHeight: 1.6, fontWeight: 600 }}>
                  Get 100% sanitized travel vehicles with prompt doorstep pickup anywhere in Pune &amp; PCMC within <strong style={{ color: '#FF4500' }}>30 minutes</strong>! Direct 1-click booking below.
                </p>

                {/* Checklist Pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    '30-Min Prompt Pickup Guarantee',
                    'Affordable Outstation & Tour Packages',
                    'Zero Security Deposit Hassle',
                    '24/7 Roadside Assistance & Support',
                  ].map((feat, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#111827',
                      background: 'rgba(255, 255, 255, 0.85)',
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                    }}>
                      <FiCheckCircle color="#22C55E" size={16} style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Hotline Box */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                background: '#FFFFFF',
                padding: '16px 18px',
                borderRadius: 16,
                border: '1.5px solid #FFD8CC',
                boxShadow: '0 6px 20px rgba(255, 69, 0, 0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#FF4500', textTransform: 'uppercase', fontWeight: 900, display: 'block', letterSpacing: '0.6px' }}>
                    Direct Booking Hotlines:
                  </span>
                  <span style={{ fontSize: 10.5, background: 'rgba(255,69,0,0.1)', color: '#FF4500', fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>
                    24x7 Available
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {phoneList.map((ph, idx) => (
                    <a
                      key={ph}
                      href={`tel:${ph}`}
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: '#111827',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 10,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#FF4500';
                        e.currentTarget.style.color = '#FF4500';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.color = '#111827';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiPhoneCall color="#FF4500" size={16} />
                        <span>+91 {ph}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Line {idx + 1}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* 1-Click CTAs */}
              <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <a
                  href={`tel:${primaryPhone}`}
                  className="btn btn-secondary"
                  style={{
                    background: '#111827',
                    borderColor: '#111827',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 900,
                    padding: '11px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(17, 24, 39, 0.20)',
                  }}
                >
                  <FiPhoneCall size={15} /> Call Primary Line
                </a>

                <a
                  href={`https://wa.me/${whatsapp}?text=Hi%20${encodeURIComponent(settings?.businessName || "Jay Kedarnath Tours & Travels")},%20I%20need%20URGENT%20car%20delivery%20in%2030%20minutes.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)',
                    borderColor: '#25D366',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 900,
                    padding: '11px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
                  }}
                >
                  <BsWhatsapp size={16} /> WhatsApp Direct
                </a>
              </div>

              {/* Instagram Direct Message Full Width CTA */}
              <a
                href={settings?.instagram || 'https://ig.me/m/founder_abhishek'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 900,
                  padding: '12px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(220, 39, 67, 0.35)',
                  width: '100%',
                }}
              >
                <BsInstagram size={17} /> Connect on Instagram Direct Messenger
              </a>
            </motion.div>

          </div>

          {/* ─── Contact Info Quick Cards Bar ─── */}
          <div className="contact-info-cards-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            {/* Phone Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '18px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(230, 46, 0, 0.30)',
                marginTop: 2,
              }}>
                <FiPhoneCall size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                  Mobile / Call Lines (24/7)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px' }}>
                  {phoneList.map((ph, idx) => (
                    <span key={ph} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <a
                        href={`tel:${ph}`}
                        style={{ fontSize: 13.5, fontWeight: 900, color: '#111827', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
                        onMouseLeave={e => e.currentTarget.style.color = '#111827'}
                      >
                        +91 {ph}
                      </a>
                      {idx < phoneList.length - 1 && <span style={{ color: '#FF4500', fontWeight: 800 }}>/</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '18px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(230, 46, 0, 0.30)',
                marginTop: 2,
              }}>
                <FiMail size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                  Email Support
                </span>
                <a
                  href={`mailto:${email}`}
                  style={{ fontSize: 13.5, fontWeight: 900, color: '#111827', textDecoration: 'none', display: 'block', wordBreak: 'break-all' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
                  onMouseLeave={e => e.currentTarget.style.color = '#111827'}
                >
                  {email}
                </a>
              </div>
            </div>

            {/* GSTIN Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '18px 20px',
              border: '2px solid rgba(255, 69, 0, 0.35)',
              boxShadow: '0 6px 20px rgba(230, 46, 0, 0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(230, 46, 0, 0.30)',
                marginTop: 2,
              }}>
                <FiShield size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#FF4500', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Govt. Tax Registration
                  </span>
                  <span style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                    Verified
                  </span>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: '#111827', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <span>GSTIN NO. :</span>
                  <span style={{ letterSpacing: '0.8px', fontFamily: 'monospace', color: '#E62E00', fontWeight: 900 }}>
                    {gstin}
                  </span>
                </div>
              </div>
            </div>

            {/* Office Address Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '18px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(230, 46, 0, 0.30)',
                marginTop: 2,
              }}>
                <FiMapPin size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                  Office Address
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', display: 'block', lineHeight: 1.4 }}>
                  {address}
                </span>
              </div>
            </div>

            {/* Business Hours Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '18px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(230, 46, 0, 0.30)',
                marginTop: 2,
              }}>
                <FiClock size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                  Business Working Hours
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#111827', display: 'block', lineHeight: 1.4 }}>
                  {hours}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <style>{`
        .contact-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 24px;
        }
        @media (max-width: 960px) {
          .contact-main-grid {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
