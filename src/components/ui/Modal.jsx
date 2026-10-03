import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 540 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-modal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(11, 15, 25, 0.78)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass-card modal-container-box"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: maxWidth,
              maxHeight: '92vh',
              overflowY: 'auto',
              zIndex: 1,
              padding: '24px 28px',
              background: '#FFFFFF',
              borderRadius: 28,
              border: '1.5px solid rgba(255, 153, 0, 0.35)',
              boxShadow: '0 25px 80px rgba(11, 15, 25, 0.40), 0 0 40px rgba(255, 153, 0, 0.18)',
            }}
          >
            {/* Top Glowing Accent Line */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 4,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              background: 'linear-gradient(90deg, #FF9900 0%, #FFA800 50%, #FFB800 100%)',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: '1px solid #E5E7EB',
              marginTop: 4,
            }}>
              <h3 style={{ fontSize: 20, margin: 0, color: '#111827', fontWeight: 900 }}>{title}</h3>
              <button
                onClick={onClose}
                className="btn-icon"
                aria-label="Close modal"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  border: 'none',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#FF9900';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.color = '#111827';
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
