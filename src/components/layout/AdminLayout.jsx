import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiTruck,
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiChevronDown,
  FiSettings,
  FiPhone,
  FiCreditCard,
  FiPackage,
} from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/Jaylogo2.png';

const navItems = [
  { icon: <FiGrid />, label: 'Dashboard', to: '/admin' },
  { icon: <FiTruck />, label: 'Cars Fleet', to: '/admin/cars' },
  { icon: <FiCalendar />, label: 'Inquiries & Bookings', to: '/admin/inquiries' },
  { icon: <FiUsers />, label: 'Customers Roster', to: '/admin/customers' },
  { icon: <FiCreditCard />, label: 'Expenses & Outflow', to: '/admin/expenses' },
  { icon: <FiPackage />, label: 'Fleet Inventory', to: '/admin/inventory' },
  { icon: <FiPhone />, label: 'Contact & Page Settings', to: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px 0',
      background: '#FFFFFF',
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarOpen ? '10px 14px 12px' : '10px 8px 12px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        gap: 10,
      }}>
        <img
          src={logoImg}
          alt="Jay Kedarnath Tours & Travels"
          style={{
            height: sidebarOpen ? 44 : 36,
            width: sidebarOpen ? 44 : 36,
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12))',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        />
        {sidebarOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, overflow: 'hidden' }}>
            <span style={{ fontSize: 13.5, fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap' }}>
              Jay Kedarnath
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#FF4500', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
              TOURS & TRAVELS ADMIN
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={() => setMobileSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-2)',
              background: isActive ? 'var(--color-accent-bg)' : 'transparent',
              border: isActive ? '1px solid rgba(255, 69, 0,0.25)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{
        padding: '16px 10px 0',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {sidebarOpen && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--color-bg-alt)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || ''}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-error)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s ease',
            width: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          <FiLogOut style={{ fontSize: 16, flexShrink: 0 }} />
          {sidebarOpen && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  const SIDEBAR_WIDTH = sidebarOpen ? 220 : 64;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          background: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          zIndex: 'var(--z-raised)',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="desktop-only"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,23,42,0.4)',
                zIndex: 'var(--z-modal)',
              }}
            />
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 220,
                background: '#FFFFFF',
                borderRight: '1px solid var(--color-border)',
                zIndex: 'calc(var(--z-modal) + 1)',
              }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{
        marginLeft: SIDEBAR_WIDTH,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.2s ease',
        minWidth: 0,
      }} className="admin-main">
        {/* Topbar (Fixed Header Pinned at Top) */}
        <header
          className="admin-topbar"
          style={{
            position: 'fixed',
            top: 0,
            left: SIDEBAR_WIDTH,
            right: 0,
            height: 56,
            background: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 500,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            transition: 'left 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-icon desktop-only" onClick={() => setSidebarOpen(o => !o)}>
              <FiMenu size={16} />
            </button>
            <button className="btn-icon mobile-only" onClick={() => setMobileSidebarOpen(o => !o)}>
              {mobileSidebarOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#FFFFFF',
              }}>
                {(user?.email?.[0] || 'A').toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 600 }}>
                {user?.email?.split('@')[0] || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Inner Page View */}
        <main style={{ flex: 1, padding: 20, marginTop: 56, overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-topbar { left: 0 !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
