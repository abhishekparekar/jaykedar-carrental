import { motion } from 'framer-motion';
import { BsWhatsapp } from 'react-icons/bs';
import { useTenant } from '../../contexts/TenantContext';

export default function WhatsAppButton() {
  const { settings } = useTenant();
  const rawNum = settings?.whatsapp || settings?.phone || '918485877633';
  const phoneNumber = rawNum.replace(/\D/g, '');
  const bizName = settings?.businessName || "Jay Kedar Car Rental";
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      title={`Chat with ${bizName} on WhatsApp (${settings?.phone || '+91 8485877633'})`}
      aria-label="Chat on WhatsApp"
    >
      <BsWhatsapp />
      
      {/* Pulse ring animation */}
      <span style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '2px solid #25D366',
        animation: 'whatsapp-pulse 2s infinite ease-in-out',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes whatsapp-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @media (max-width: 768px) {
          a[aria-label="Chat on WhatsApp"] {
            bottom: 20px !important;
            right: 18px !important;
            width: 50px !important;
            height: 50px !important;
            font-size: 26px !important;
          }
        }
        @media (max-width: 480px) {
          a[aria-label="Chat on WhatsApp"] {
            bottom: 16px !important;
            right: 14px !important;
            width: 46px !important;
            height: 46px !important;
            font-size: 24px !important;
          }
        }
      `}</style>
    </motion.a>
  );
}
