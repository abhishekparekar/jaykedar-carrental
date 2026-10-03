export default function CarSkeleton() {
  return (
    <div className="glass-card" style={{ overflow: 'hidden', height: 380, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ width: '100%', height: 180 }} />
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '70%', height: 22, marginBottom: 16 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          <div className="skeleton" style={{ height: 16 }} />
          <div className="skeleton" style={{ height: 16 }} />
          <div className="skeleton" style={{ height: 16 }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: 38 }} />
      </div>
    </div>
  );
}
