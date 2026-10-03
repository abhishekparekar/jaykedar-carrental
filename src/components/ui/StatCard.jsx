export default function StatCard({ title, value, icon, change, color = 'accent', subtitle }) {
  const colorStyles = {
    accent: { bg: 'var(--color-accent-bg)', color: 'var(--color-accent)', border: 'rgba(255,87,34,0.2)' },
    blue: { bg: 'var(--color-blue-bg)', color: 'var(--color-blue)', border: 'rgba(37,99,235,0.2)' },
    success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'rgba(16,185,129,0.2)' },
    warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: 'rgba(245,158,11,0.2)' },
  };

  const style = colorStyles[color] || colorStyles.accent;

  return (
    <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </span>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}>
          {icon}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1 }}>
          {value}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>

      {change !== undefined && (
        <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: change >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
          <span>{change >= 0 ? '↑' : '↓'} {Math.abs(change)}%</span>
          <span style={{ color: 'var(--color-text-3)' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}
