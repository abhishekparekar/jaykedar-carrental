import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTruck,
  FiMessageSquare,
  FiUsers,
  FiDollarSign,
  FiEye,
  FiPhone,
  FiPlus,
  FiGlobe,
  FiDownload,
  FiMapPin,
  FiZap,
  FiTrendingDown,
  FiPackage,
  FiCreditCard,
} from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import {
  subscribeToCars,
  subscribeToInquiries,
  subscribeToCustomers,
  subscribeToExpenses,
  subscribeToInventory,
  updateInquiryStatus,
  formatTimestamp,
} from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminDashboard() {
  const { tenantId } = useTenant();

  const [cars, setCars] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const unsubCars = subscribeToCars(tenantId, setCars);
    const unsubInquiries = subscribeToInquiries(tenantId, (data) => {
      setInquiries(data);
      setLoading(false);
    });
    const unsubCustomers = subscribeToCustomers(tenantId, setCustomers);
    const unsubExpenses = subscribeToExpenses(tenantId, setExpenses);
    const unsubInventory = subscribeToInventory(tenantId, setInventory);

    return () => {
      unsubCars();
      unsubInquiries();
      unsubCustomers();
      unsubExpenses();
      unsubInventory();
    };
  }, [tenantId]);

  const newInquiries = inquiries.filter(i => i.status === 'new');
  const confirmedInquiries = inquiries.filter(i => i.status === 'confirmed');
  const estimatedRevenue = confirmedInquiries.reduce((sum, i) => sum + (i.estimatedPrice || 2300), 0);
  const totalExpensesOutflow = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = estimatedRevenue - totalExpensesOutflow;
  const lowStockCount = inventory.filter(i => Number(i.quantity) <= Number(i.reorderLevel)).length;

  const categoryCounts = cars.reduce((acc, c) => {
    const cat = c.category || 'hatchback';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInquiryStatus(tenantId, id, status);
      toast.success(`Inquiry status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) return toast.info('No inquiries to export');
    const headers = 'ID,Customer,Phone,Email,Car,City,PickupDate,ReturnDate,Status,Price\n';
    const rows = inquiries.map(i =>
      `"${i.id}","${i.customerName}","${i.phone}","${i.email}","${i.carName}","${i.city}","${i.pickupDate}","${i.returnDate}","${i.status}","${i.estimatedPrice || 0}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${tenantId}-${Date.now()}.csv`;
    a.click();
    toast.success('Exported inquiries to CSV');
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Header & Tenant Scope */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, margin: 0, color: '#0F172A', fontWeight: 900 }}>CRM Executive Control Panel</h1>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Scope: <strong style={{ color: '#FF4500' }}>{tenantId}</strong> • Real-Time Firestore Sync
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 12, padding: '6px 12px', gap: 6, fontWeight: 700 }}
          >
            <FiGlobe color="#2563EB" /> Live Website Preview ↗
          </a>
        </div>

        {/* 🚀 QUICK ACTION SHORTCUT BUTTONS BAR */}
        <div className="glass-card" style={{ padding: '12px 14px', background: '#FFFFFF' }}>
          <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <FiZap style={{ color: '#FF4500' }} /> Quick Action Shortcuts:
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              to="/admin/cars"
              className="btn btn-primary btn-sm"
              style={{ background: 'linear-gradient(135deg, #FF4500 0%, #E66E00 100%)', borderColor: '#FF4500', fontSize: 12, fontWeight: 800, padding: '6px 12px', gap: 4 }}
            >
              <FiPlus size={14} /> Add Vehicle
            </Link>
            <Link
              to="/admin/inquiries"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', gap: 4 }}
            >
              <FiMessageSquare size={13} color="#2563EB" /> Inquiries ({inquiries.length})
            </Link>
            <Link
              to="/admin/customers"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', gap: 4 }}
            >
              <FiUsers size={13} color="#16A34A" /> Customer Roster ({customers.length})
            </Link>
            <Link
              to="/admin/expenses"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', gap: 4 }}
            >
              <FiCreditCard size={13} color="#DC2626" /> Expenses ({expenses.length})
            </Link>
            <Link
              to="/admin/inventory"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', gap: 4 }}
            >
              <FiPackage size={13} color="#D97706" /> Fleet Inventory {lowStockCount > 0 ? `(⚠️ ${lowStockCount})` : ''}
            </Link>
            <Link
              to="/admin/settings"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', gap: 4 }}
            >
              <FiPhone size={13} color="#D97706" /> Web & Contact Settings
            </Link>
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', gap: 4 }}
            >
              <FiDownload size={13} color="#475569" /> Export CSV
            </button>
          </div>
        </div>

        {/* Compact Stat Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <StatCard
            title="Total Cars Fleet"
            value={cars.length}
            icon={<FiTruck />}
            color="accent"
            subtitle={`${cars.filter(c => c.isActive !== false).length} Active Vehicles`}
          />

          <StatCard
            title="Total Inquiries"
            value={inquiries.length}
            icon={<FiMessageSquare />}
            color="blue"
            subtitle={`${newInquiries.length} New Unread`}
          />

          <StatCard
            title="Revenue Pipeline"
            value={formatCurrency(estimatedRevenue)}
            icon={<FiDollarSign />}
            color="success"
            subtitle={`${confirmedInquiries.length} Confirmed Bookings`}
          />

          <StatCard
            title="Expense Outflow"
            value={formatCurrency(totalExpensesOutflow)}
            icon={<FiTrendingDown />}
            color="warning"
            subtitle={`${expenses.length} Expense Logs`}
          />

          <StatCard
            title="Net Business Profit"
            value={formatCurrency(netProfit)}
            icon={<FiDollarSign />}
            color={netProfit >= 0 ? "success" : "accent"}
            subtitle="Revenue minus Expenses"
          />
        </div>

        {/* Dashboard Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }} className="dashboard-grid">
          
          {/* Recent Inquiries Table */}
          <div className="glass-card" style={{ padding: 16, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, margin: 0, color: '#0F172A', fontWeight: 800 }}>Recent Rental Inquiries</h3>
              <Link to="/admin/inquiries" style={{ fontSize: 12, color: '#FF4500', textDecoration: 'none', fontWeight: 800 }}>
                View All Inquiries →
              </Link>
            </div>

            {loading ? (
              <p style={{ color: '#64748B', fontSize: 12.5 }}>Loading inquiries...</p>
            ) : inquiries.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-state-icon">
                  <FiMessageSquare size={36} color="#FF4500" />
                </div>
                <div className="empty-state-title" style={{ marginTop: 6 }}>No inquiries received yet</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Car Requested</th>
                      <th>City / Type</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th>Contact / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.slice(0, 6).map((item) => {
                      const cleanPhone = (item.phone || '').replace(/\D/g, '');
                      const waNum = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <strong style={{ color: '#0F172A', display: 'block', fontSize: 12.5 }}>{item.customerName}</strong>
                              <span style={{ fontSize: 11, color: '#64748B' }}>{item.phone}</span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#FF4500', fontSize: 12.5 }}>{item.carName || 'General'}</strong>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, color: '#334155' }}>
                              {item.city || 'Pune'} ({item.pickupType || 'delivery'})
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 11.5, color: '#64748B' }}>
                              {formatTimestamp(item.pickupDate)}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={item.status || 'new'}
                              onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                              style={{ padding: '2px 6px', fontSize: 11, height: 26, width: 105, fontWeight: 700 }}
                            >
                              <option value="new">🟡 New</option>
                              <option value="contacted">🔵 Contacted</option>
                              <option value="confirmed">🟢 Confirmed</option>
                              <option value="closed">🔴 Closed</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <a
                                href={`https://wa.me/${waNum}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '3px 7px',
                                  background: '#25D366',
                                  borderColor: '#25D366',
                                  color: '#FFFFFF',
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                }}
                                title="Chat on WhatsApp"
                              >
                                <BsWhatsapp size={11} /> WhatsApp
                              </a>
                              <button
                                className="btn-icon"
                                onClick={() => {
                                  setSelectedInquiry(item);
                                  setIsDetailOpen(true);
                                }}
                                title="View Full Details"
                              >
                                <FiEye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fleet Breakdown & Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="glass-card" style={{ padding: 16, background: '#FFFFFF' }}>
              <h3 style={{ fontSize: 14, marginBottom: 12, color: '#0F172A', fontWeight: 800 }}>Fleet by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'hatchback', label: 'Hatchback', color: '#FF4500' },
                  { id: 'sedan', label: 'Sedan', color: '#2563EB' },
                  { id: 'suv', label: 'SUV & 4x4', color: '#D97706' },
                  { id: 'muv', label: 'MUV 7-Seater', color: '#16A34A' },
                ].map(cat => {
                  const count = categoryCounts[cat.id] || 0;
                  const pct = cars.length > 0 ? Math.round((count / cars.length) * 100) : 0;
                  return (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                        <span style={{ color: '#0F172A', fontWeight: 700 }}>{cat.label}</span>
                        <span style={{ color: '#64748B' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#F1F5F9', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: cat.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 16, background: '#FFFFFF' }}>
              <h3 style={{ fontSize: 14, marginBottom: 10, color: '#0F172A', fontWeight: 800 }}>Quick Navigation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link to="/admin/cars" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', fontSize: 12, padding: '7px 10px' }}>
                  <FiTruck size={14} color="#FF4500" /> Manage Fleet Vehicles
                </Link>
                <Link to="/admin/inquiries" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', fontSize: 12, padding: '7px 10px' }}>
                  <FiMessageSquare size={14} color="#2563EB" /> Manage Rental Inquiries
                </Link>
                <Link to="/admin/customers" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', fontSize: 12, padding: '7px 10px' }}>
                  <FiUsers size={14} color="#16A34A" /> View Customer Roster
                </Link>
                <Link to="/admin/settings" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', fontSize: 12, padding: '7px 10px' }}>
                  <FiPhone size={14} color="#D97706" /> Web & Contact Settings
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Inquiry Detail & Follow-up"
        maxWidth={580}
      >
        {selectedInquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: 16, color: '#0F172A', display: 'block' }}>{selectedInquiry.customerName}</strong>
              <span style={{ fontSize: 12.5, color: '#475569' }}>
                📞 {selectedInquiry.phone} • ✉️ {selectedInquiry.email || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Vehicle Requested</span>
                <strong style={{ color: '#FF4500' }}>{selectedInquiry.carName || 'General'}</strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Location & Type</span>
                <strong style={{ color: '#0F172A' }}>📍 {selectedInquiry.city} ({selectedInquiry.pickupType})</strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Pickup Date</span>
                <strong style={{ color: '#0F172A' }}>{formatTimestamp(selectedInquiry.pickupDate)}</strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Return Date</span>
                <strong style={{ color: '#0F172A' }}>{formatTimestamp(selectedInquiry.returnDate)}</strong>
              </div>
            </div>

            {selectedInquiry.message && (
              <div style={{ padding: 10, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Message:</span>
                <p style={{ fontSize: 12.5, color: '#334155', margin: '2px 0 0', lineHeight: 1.5 }}>{selectedInquiry.message}</p>
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Update Status</label>
              <select
                className="form-select"
                value={selectedInquiry.status || 'new'}
                onChange={(e) => {
                  handleStatusUpdate(selectedInquiry.id, e.target.value);
                  setSelectedInquiry({ ...selectedInquiry, status: e.target.value });
                }}
                style={{ height: 36, fontSize: 12.5, fontWeight: 700 }}
              >
                <option value="new">🟡 New</option>
                <option value="contacted">🔵 Contacted</option>
                <option value="confirmed">🟢 Confirmed</option>
                <option value="closed">🔴 Closed</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <a
                href={`https://wa.me/${(selectedInquiry.phone || '').replace(/\D/g, '').startsWith('91') ? (selectedInquiry.phone || '').replace(/\D/g, '') : `91${(selectedInquiry.phone || '').replace(/\D/g, '')}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm w-full"
                style={{ background: '#25D366', borderColor: '#25D366', color: '#FFFFFF', fontWeight: 800, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <BsWhatsapp size={15} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 960px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
