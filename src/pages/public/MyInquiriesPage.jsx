import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiFileText, FiMapPin, FiCalendar, FiClock,
  FiCheckCircle, FiCopy, FiInfo, FiShare2, FiZap, FiTruck,
} from 'react-icons/fi';
import { BsCarFront, BsWhatsapp } from 'react-icons/bs';
import toast from 'react-hot-toast';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useTenant } from '../../contexts/TenantContext';
import { subscribeToInquiries, formatTimestamp } from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

export default function MyInquiriesPage() {
  const { tenantId } = useTenant();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    setLoading(true);
    setSearched(true);

    const unsub = subscribeToInquiries(tenantId, (all) => {
      const q = emailOrPhone.toLowerCase().trim();
      const userItems = all.filter(item => 
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q))
      );
      setInquiries(userItems);
      setLoading(false);
    });

    return () => unsub();
  };

  const handleCopyRef = (refId) => {
    navigator.clipboard.writeText(refId);
    toast.success(`Reference #${refId.slice(0, 8)} copied to clipboard!`);
  };

  const handleShareWhatsApp = (item) => {
    const text = `Hi! I submitted a rental inquiry for *${item.carName || 'Vehicle'}* (Ref: #${item.id.slice(0, 8)}).\nLocation: ${item.city || 'Pune'}\nDates: ${item.pickupDate || 'Flexible'} to ${item.returnDate || 'Flexible'}.\nPlease confirm vehicle availability!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/918485877633?text=${encoded}`, '_blank');
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="badge badge-warning" style={{ fontSize: 11, fontWeight: 800 }}>⏳ New Inquiry Received</span>;
      case 'contacted':
        return <span className="badge badge-blue" style={{ fontSize: 11, fontWeight: 800 }}>📞 Agent Contacted</span>;
      case 'confirmed':
        return <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 800 }}>✅ Booking Confirmed</span>;
      case 'closed':
        return <span className="badge badge-error" style={{ fontSize: 11, fontWeight: 800 }}>❌ Closed / Cancelled</span>;
      default:
        return <span className="badge badge-accent" style={{ fontSize: 11, fontWeight: 800 }}>{status}</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />

      <main style={{ paddingTop: 'clamp(68px, 9vw, 84px)', paddingBottom: 40, flex: 1 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          
          {/* Header */}
          <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', marginBottom: 24, margin: '0 -16px 24px', padding: '28px 16px 22px' }}>
            <span className="section-label-red" style={{ display: 'inline-block', marginBottom: 10 }}>Track Your Request</span>
            <h1 style={{ fontSize: 'clamp(22px, 4.5vw, 36px)', fontWeight: 900, color: '#111318', margin: '0 0 8px', lineHeight: 1.25 }}>
              My{' '}
              <span style={{
                background: 'linear-gradient(90deg, #FF4B1F 0%, #E62E00 50%, #C41C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900,
              }}>RENTAL INQUIRIES</span>
            </h1>
            <p style={{ fontSize: 'clamp(12.5px, 1.8vw, 14px)', color: '#64748B', margin: 0, maxWidth: 500, lineHeight: 1.6 }}>
              Enter your email or phone number to track all your submitted rental inquiries.
            </p>
          </div>


          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            style={{
              padding: 12,
              display: 'flex',
              gap: 10,
              marginBottom: 24,
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              required
              className="form-input"
              placeholder="Enter Mobile Number (+91...), Email, or Ref ID..."
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              style={{ fontSize: 13.5, flex: 1, minWidth: 220, height: 42 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #FF4500 0%, #E66E00 100%)',
                borderColor: '#FF4500',
                whiteSpace: 'nowrap',
                fontSize: 13.5,
                fontWeight: 800,
                padding: '0 20px',
                height: 42,
              }}
            >
              Search Inquiry <FiSearch />
            </button>
          </form>

          {/* Results Area */}
          {searched && (
            <div>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Searching records...</p>
              ) : inquiries.length === 0 ? (
                <div className="glass-card empty-state" style={{ background: '#FFFFFF', padding: '36px 20px', textAlign: 'center', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
                    <FiFileText size={42} color="#FF4500" />
                  </div>
                  <strong style={{ fontSize: 16, color: '#0F172A', display: 'block' }}>No inquiries found</strong>
                  <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    We couldn't find any rental inquiries matching "{emailOrPhone}". Make sure the phone or email matches what you entered during booking.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {inquiries.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 18,
                        background: '#FFFFFF',
                        borderRadius: 16,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                      }}
                    >
                      {/* Top bar with vehicle name & status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>
                              Ref: #{item.id.slice(0, 8)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyRef(item.id)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#FF4500', padding: 0 }}
                              title="Copy Ref ID"
                            >
                              <FiCopy size={12} />
                            </button>
                          </div>
                          <h3 style={{ fontSize: 17, margin: '2px 0 0', color: '#0F172A', fontWeight: 900 }}>
                            {item.carName || 'General Inquiry'}
                          </h3>
                        </div>
                        {statusBadge(item.status)}
                      </div>

                      {/* Details Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: 10,
                        padding: 12,
                        background: '#F8FAFC',
                        borderRadius: 12,
                        border: '1px solid #F1F5F9',
                        fontSize: 12.5,
                      }}>
                        <div>
                          <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Location</span>
                          <strong style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <FiMapPin size={12} color="#FF4500" /> {item.city || 'Pune'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Pickup Type</span>
                          <strong style={{ color: '#0F172A', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <BsCarFront size={12} color="#FF4500" /> {item.pickupType || 'Doorstep Delivery'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Submitted On</span>
                          <strong style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <FiCalendar size={12} color="#FF4500" /> {formatTimestamp(item.createdAt)}
                          </strong>
                        </div>

                        {item.estimatedPrice && (
                          <div>
                            <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Est. Total</span>
                            <strong style={{ color: '#FF4500', fontSize: 14, fontWeight: 900 }}>
                              {formatCurrency(item.estimatedPrice)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Customer Contact Summary */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          Customer: <strong>{item.customerName || 'Guest'}</strong> • {item.phone || item.email}
                        </div>

                        {/* Action Buttons: WhatsApp Share & Copy */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(item)}
                            className="btn btn-primary btn-sm"
                            style={{
                              background: '#25D366',
                              borderColor: '#25D366',
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 800,
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <BsWhatsapp size={14} /> Share Inquiry on WhatsApp
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
