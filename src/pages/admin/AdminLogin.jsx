import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiLogIn, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/Jaylogo1.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setErrorMsg('Invalid password or email. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-alt)',
      padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          background: '#FFFFFF',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src={logoImg}
            alt="Jay Kedar Car Rental"
            style={{
              height: 72,
              width: 'auto',
              margin: '0 auto 14px',
              display: 'block',
              filter: 'drop-shadow(0 6px 18px rgba(255, 69, 0, 0.42))',
            }}
          />
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: '#111318' }}>Jay Kedar Car Rental Admin Portal</h2>
          <p style={{ fontSize: 12, color: '#6B7080', margin: 0 }}>
            Authorized Admin Access Only
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-bg)',
            border: '1px solid rgba(255, 85, 0,0.2)',
            color: 'var(--color-error)',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-3)',
                fontSize: 15,
              }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: 38 }}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="admin@gmail.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-3)',
                fontSize: 15,
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-3)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            style={{ marginTop: 4, background: '#FF4500', borderColor: '#FF4500', fontWeight: 800 }}
          >
            {loading ? 'Authenticating Role...' : 'Sign In to CRM'} <FiLogIn />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
