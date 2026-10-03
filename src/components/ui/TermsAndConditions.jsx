import { useState } from 'react';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiChevronUp, FiFileText, FiClock, FiKey, FiDollarSign, FiCreditCard, FiHome, FiUser, FiZap, FiSlash, FiTruck } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';

export const REQUIRED_DOCUMENTS = [
  { id: 1, name: 'Aadhaar Card', icon: <FiCreditCard size={18} color="#FF6B00" />, req: 'Original Required' },
  { id: 2, name: 'Driving Licence', icon: <BsCarFront size={18} color="#FF6B00" />, req: 'Valid Original' },
  { id: 3, name: 'PAN Card', icon: <FiFileText size={18} color="#FF6B00" />, req: 'Original Required' },
  { id: 4, name: 'Rent Agreement', icon: <FiHome size={18} color="#FF6B00" />, req: 'Current Address Proof' },
  { id: 5, name: 'Job ID Card', icon: <FiUser size={18} color="#FF6B00" />, req: 'Employment Proof' },
];

export const CATEGORIZED_TERMS = [
  {
    category: 'Km & Overtime Rates',
    icon: <FiZap size={18} color="#FF6B00" />,
    items: [
      { highlight: '300 km Limit', text: '300 km limit per 24 hours package.' },
      { highlight: 'Extra KM Rates', text: '₹6/km (5 Seater) • ₹7/km (7 Seater / SUV).' },
      { highlight: 'Overtime Fees', text: '₹200/hr (Swift, Ertiga, i20, Dzire, Punch, Venue, Baleno) • ₹300/hr (Thar 4x4).' },
    ],
  },
  {
    category: 'Deposit & Insurance',
    icon: <FiKey size={18} color="#FF6B00" />,
    items: [
      { highlight: 'Security Deposit', text: "Customer's own bike is acceptable OR ₹10,000 cash deposit." },
      { highlight: 'Advance Fee', text: 'Booking advance payment is strictly Non-Refundable.' },
      { highlight: 'Damage Policy', text: 'Minor scratches & dents not covered by insurance. Service center downtime fee + processing fee applies.' },
    ],
  },
  {
    category: 'Rules & Fuel Policy',
    icon: <FiSlash size={18} color="#EF4444" />,
    items: [
      { highlight: 'Strict Policy', text: "DON'T DRINK AND DRIVE. 100% customer liability for damages if alcohol is involved." },
      { highlight: 'Fuel & FASTag', text: 'Maintain given fuel level (extra fuel non-refundable). FASTag server issues not under our control.' },
      { highlight: 'Pickup Payment', text: 'Full rent + deposit must be paid at the time of car pickup.' },
    ],
  },
];

export const HIGHLIGHT_CHIPS = [
  { text: '300 KM / 24h Limit', icon: <FiClock size={14} color="#FF6B00" /> },
  { text: 'Bike / ₹10k Deposit', icon: <FiKey size={14} color="#FF6B00" /> },
  { text: '5 Required Documents', icon: <FiFileText size={14} color="#FF6B00" /> },
  { text: 'No Drink & Drive', icon: <FiSlash size={14} color="#EF4444" /> },
  { text: 'Non-Refundable Advance', icon: <FiCreditCard size={14} color="#FF6B00" /> },
  { text: 'Rent at Pickup', icon: <FiTruck size={14} color="#FF6B00" /> },
];

export default function TermsAndConditions({ expandable = false, defaultOpen = true, compact = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1.5px solid rgba(255, 69, 0, 0.25)',
      boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* ─── Top Banner Header ─── */}
      <div
        onClick={() => expandable && setIsOpen(prev => !prev)}
        style={{
          padding: compact ? '14px 16px' : '16px 20px',
          background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.08) 0%, #FFFFFF 100%)',
          borderBottom: (isOpen || !expandable) ? '1px solid rgba(255, 69, 0, 0.18)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: expandable ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #FF4500 0%, #FF6B00 100%)',
            color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 3px 10px rgba(255, 69, 0, 0.35)',
            flexShrink: 0,
          }}>
            <FiShield />
          </div>
          <div>
            <span style={{ fontSize: 10, color: '#FF4500', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 2 }}>
              JAY KEDAR CAR RENTAL • OFFICIAL POLICY
            </span>
            <h4 style={{ fontSize: compact ? 14 : 16, fontWeight: 900, color: '#111318', margin: 0, lineHeight: 1.25 }}>
              Rental Policy &amp; Mandatory Documents
            </h4>
          </div>
        </div>

        {expandable && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            color: '#FF4500',
            background: 'rgba(255, 69, 0, 0.09)',
            padding: '6px 12px',
            borderRadius: 99,
            border: '1px solid rgba(255, 69, 0, 0.2)',
          }}>
            <span>{isOpen ? 'Collapse' : 'View Policy'}</span>
            {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </div>
        )}
      </div>

      {(!expandable || isOpen) && (
        <div style={{ padding: compact ? '14px' : '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ─── Quick Highlight Pills Bar ─── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}>
            {HIGHLIGHT_CHIPS.map((chip, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 99,
                  background: 'rgba(255, 69, 0, 0.06)',
                  border: '1px solid rgba(255, 69, 0, 0.20)',
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: '#FF4500',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span>{chip.icon}</span>
                <span>{chip.text}</span>
              </div>
            ))}
          </div>

          {/* ─── Notice Alert Box ─── */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            fontSize: 12,
            color: '#991B1B',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 1px 4px rgba(239, 68, 68, 0.06)',
          }}>
            <FiAlertTriangle size={16} style={{ flexShrink: 0, color: '#FF4500' }} />
            <span>⭕ PLEASE READ ALL TERMS &amp; MANDATORY DOCUMENTATION REQUIREMENTS CAREFULLY BEFORE BOOKING ⭕</span>
          </div>

          {/* ─── 📄 MANDATORY DOCUMENTS REQUIRED CARD ─── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.04) 0%, #FFFFFF 100%)',
            border: '1.5px solid rgba(255, 69, 0, 0.20)',
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiFileText color="#FF6B00" size={18} />
                <strong style={{ fontSize: 13.5, color: '#FF4500', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  5 Mandatory Documents Required at Pickup:
                </strong>
              </div>
              <span style={{ fontSize: 11, background: 'rgba(255, 69, 0, 0.1)', color: '#FF4500', padding: '3px 8px', borderRadius: 6, fontWeight: 800 }}>
                Original Verified
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 10,
            }}>
              {REQUIRED_DOCUMENTS.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{doc.icon}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: 12.5, color: '#111318', fontWeight: 800, lineHeight: 1.25 }}>
                      {doc.id}. {doc.name}
                    </strong>
                    <span style={{ fontSize: 10.5, color: '#FF4500', fontWeight: 700 }}>{doc.req}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 3-COLUMN POLICY GRID ─── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 12,
          }}>
            {CATEGORIZED_TERMS.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '14px 16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1.5px solid #F1F5F9' }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <strong style={{ fontSize: 13.5, color: '#111318', fontWeight: 900 }}>{cat.category}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cat.items.map((item, itemIdx) => (
                    <div key={itemIdx} style={{ fontSize: 12.5, lineHeight: 1.5, color: '#111318' }}>
                      <strong style={{ color: '#FF4500', fontWeight: 800 }}>• {item.highlight}: </strong>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ─── Bottom Security Note ─── */}
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.06) 0%, #FFFFFF 100%)',
            border: '1px dashed rgba(255, 69, 0, 0.35)',
            fontSize: 12.5,
            color: '#111318',
            textAlign: 'center',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
            <span>🛻</span>
            <span>
              <strong>Full Rent + Deposit (Customer Bike OR ₹10,000 Cash)</strong> collected at car pickup.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
