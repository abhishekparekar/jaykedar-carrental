import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiEye, FiTrash2, FiDownload } from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToInquiries,
  updateInquiryStatus,
  deleteInquiry,
  formatTimestamp,
} from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminInquiries() {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToInquiries(tenantId, (data) => {
      setInquiries(data);
      setLoading(false);
    });
    return () => unsub();
  }, [tenantId]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInquiryStatus(tenantId, id, status, user?.uid);
      toast.success(`Inquiry status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry record?')) return;
    try {
      await deleteInquiry(tenantId, id);
      toast.success('Inquiry deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete inquiry');
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

  const filteredInquiries = inquiries.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.customerName?.toLowerCase().includes(q);
      const matchPhone = item.phone?.includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      const matchCar = item.carName?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCar) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, margin: 0, color: 'var(--color-text)' }}>Inquiries & Bookings</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginTop: 2 }}>
              Scope: <strong>{tenantId}</strong>
            </p>
          </div>

          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="glass-card" style={{ padding: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: '#FFFFFF' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search by customer, phone, email, vehicle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, height: 38 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['all', 'new', 'contacted', 'confirmed', 'closed'].map(st => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
                style={{ textTransform: 'capitalize', padding: '5px 12px', fontSize: 12 }}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-2)', fontSize: 13 }}>Loading inquiries...</p>
          ) : filteredInquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No inquiries match filter</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer Info</th>
                    <th>Car Requested</th>
                    <th>City / Delivery</th>
                    <th>Est. Total</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: 'var(--color-text)', display: 'block' }}>{item.customerName}</strong>
                        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{item.phone} • {item.email}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-accent)' }}>{item.carName || 'General'}</strong>
                      </td>
                      <td>📍 {item.city} ({item.pickupType || 'delivery'})</td>
                      <td>
                        <strong style={{ color: 'var(--color-text)' }}>
                          {formatCurrency(item.estimatedPrice || 0)}
                        </strong>
                      </td>
                      <td>{formatTimestamp(item.createdAt)}</td>
                      <td>
                        <select
                          className="form-select"
                          value={item.status || 'new'}
                          onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                          style={{ padding: '2px 6px', fontSize: 11, height: 28, width: 110 }}
                        >
                          <option value="new">🟡 New</option>
                          <option value="contacted">🔵 Contacted</option>
                          <option value="confirmed">🟢 Confirmed</option>
                          <option value="closed">🔴 Closed</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <a
                            href={`https://wa.me/${(item.phone || '').replace(/\D/g, '').startsWith('91') ? (item.phone || '').replace(/\D/g, '') : `91${(item.phone || '').replace(/\D/g, '')}`}`}
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
                          <button className="btn-icon" onClick={() => handleDelete(item.id)} style={{ color: 'var(--color-error)' }} title="Delete Record">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Inquiry Detail"
      >
        {selectedInquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: 16, color: 'var(--color-text)', display: 'block' }}>{selectedInquiry.customerName}</strong>
              <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
                📞 {selectedInquiry.phone} • ✉️ {selectedInquiry.email}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-3)', display: 'block' }}>Car Requested</span>
                <strong style={{ color: 'var(--color-accent)' }}>{selectedInquiry.carName || 'General Inquiry'}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--color-text-3)', display: 'block' }}>City Location</span>
                <strong>📍 {selectedInquiry.city}</strong>
              </div>
            </div>

            {selectedInquiry.message && (
              <div style={{ padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)' }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-3)', display: 'block' }}>Message:</span>
                <p style={{ fontSize: 13, color: 'var(--color-text-2)', margin: '2px 0 0' }}>{selectedInquiry.message}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select
                className="form-select"
                value={selectedInquiry.status || 'new'}
                onChange={(e) => {
                  handleStatusUpdate(selectedInquiry.id, e.target.value);
                  setSelectedInquiry({ ...selectedInquiry, status: e.target.value });
                }}
              >
                <option value="new">🟡 New</option>
                <option value="contacted">🔵 Contacted</option>
                <option value="confirmed">🟢 Confirmed</option>
                <option value="closed">🔴 Closed</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
