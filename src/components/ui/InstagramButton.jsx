import { motion } from 'framer-motion';
import { BsInstagram } from 'react-icons/bs';
import { useTenant } from '../../contexts/TenantContext';

function getDirectInstagramUrl(urlOrHandle, message = '') {
  let baseUrl = 'https://ig.me/m/founder_abhishek';
  if (urlOrHandle) {
    if (urlOrHandle.includes('ig.me/m/')) {
      baseUrl = urlOrHandle.split('?')[0];
    } else {
      const match = urlOrHandle.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match && match[1] && match[1] !== 'direct') {
        baseUrl = `https://ig.me/m/${match[1]}`;
      } else if (!urlOrHandle.includes('://')) {
        const handle = urlOrHandle.replace('@', '').trim();
        if (handle) baseUrl = `https://ig.me/m/${handle}`;
      }
    }
  }
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export default function InstagramButton() {
  const { settings } = useTenant();
  const bizName = settings?.businessName || "Jay Kedar Car Rental";
  const instagramUrl = getDirectInstagramUrl(settings?.instagram);

  return (
    <motion.a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 999,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        boxShadow: '0 8px 24px rgba(220, 39, 67, 0.45)',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      title={`Connect with ${bizName} on Instagram (@founder_abhishek)`}
      aria-label="Connect on Instagram"
    >
      <BsInstagram />
      
      {/* Pulse ring animation */}
      <span style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '2px solid #E1306C',
        animation: 'instagram-pulse 2s infinite ease-in-out',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes instagram-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @media (max-width: 768px) {
          a[aria-label="Connect on Instagram"] {
            bottom: 20px !important;
            left: 18px !important;
            width: 50px !important;
            height: 50px !important;
            font-size: 25px !important;
          }
        }
        @media (max-width: 480px) {
          a[aria-label="Connect on Instagram"] {
            bottom: 16px !important;
            left: 14px !important;
            width: 46px !important;
            height: 46px !important;
            font-size: 23px !important;
          }
        }
      `}</style>
    </motion.a>
  );
}
