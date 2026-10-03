import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShieldOff, FiArrowLeft, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
        gap: 16,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid rgba(255,107,53,0.2)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>Verifying Admin Authorization...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to Admin Login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but NOT an Admin -> Access Denied Screen
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-hero)',
        padding: 24,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{
            maxWidth: 480,
            width: '100%',
            padding: 40,
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--color-error-bg)',
            border: '1px solid rgba(255, 85, 0,0.3)',
            color: 'var(--color-error)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            marginBottom: 20,
          }}>
            <FiShieldOff />
          </div>

          <h2 style={{ fontSize: 24, margin: '0 0 10px', color: '#fff' }}>
            Access Denied
          </h2>
          
          <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.6, marginBottom: 24 }}>
            The account <strong style={{ color: 'var(--color-accent)' }}>{user.email}</strong> does not have permission to access the NextRent Admin CRM. Please log in with an authorized administrator account.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary btn-sm">
              <FiArrowLeft /> Back to Website
            </Link>
            <button onClick={signOut} className="btn btn-danger btn-sm">
              <FiLogOut /> Sign Out & Switch Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated AND has admin role -> Render admin route
  return children;
}
