import { useState, useEffect } from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiUsers,
  FiCheckCircle, FiPhone, FiMail, FiMapPin, FiFileText, FiShield,
  FiEye, FiTag, FiAlertOctagon,
} from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  subscribeToInquiries,
} from '../../firebase/firestore';

export default function AdminCustomers() {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    name: '',
    phone: '',
    email: '',
    city: 'Pune',
    dlNumber: '',
    aadhaarNumber: '',
    emergencyContact: '',
    tag: 'regular', // regular | vip | blacklisted
    kycStatus: 'verified', // verified | pending | rejected
    totalTrips: 1,
    notes: '',
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    const unsubCust = subscribeToCustomers(tenantId, (custData) => {
      setCustomers(custData);
      setLoading(false);
    });

    const unsubInq = subscribeToInquiries(tenantId, (inqData) => {
      setInquiries(inqData);
    });

    return () => {
      unsubCust();
      unsubInq();
    };
  }, [tenantId]);

  // Combine direct customers + unique customers extracted from inquiries
  const combinedCustomers = [...customers];
  inquiries.forEach((inq) => {
    if (inq.customerName || inq.phone) {
      const exists = combinedCustomers.some(
        c => (c.phone && inq.phone && c.phone === inq.phone) || (c.email && inq.email && c.email === inq.email)
      );
      if (!exists) {
        combinedCustomers.push({
          id: `inq-cust-${inq.id}`,
          name: inq.customerName || 'Inquiry Customer',
          phone: inq.phone || 'N/A',
          email: inq.email || 'N/A',
          city: inq.city || 'Pune',
          kycStatus: 'verified',
          tag: 'regular',
          totalTrips: 1,
          fromInquiry: true,
          createdAt: inq.createdAt,
        });
      }
    }
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setForm({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      city: cust.city || 'Pune',
      dlNumber: cust.dlNumber || '',
      aadhaarNumber: cust.aadhaarNumber || '',
      emergencyContact: cust.emergencyContact || '',
      tag: cust.tag || 'regular',
      kycStatus: cust.kycStatus || 'verified',
      totalTrips: cust.totalTrips || 1,
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (cust) => {
    if (!window.confirm(`Are you sure you want to delete ${cust.name}?`)) return;
    try {
      if (cust.fromInquiry) {
        toast.success('Customer removed from view');
      } else {
        await deleteCustomer(tenantId, cust.id);
        toast.success('Customer deleted from database');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete customer');
    }
  };

  const handleToggleKyc = async (cust) => {
    if (cust.fromInquiry) {
      toast.error('Converted inquiries must be registered to CRM to modify KYC');
      return;
    }
    try {
      const nextKyc = cust.kycStatus === 'verified' ? 'pending' : 'verified';
      await updateCustomer(tenantId, cust.id, { kycStatus: nextKyc }, user?.uid);
      toast.success(`${cust.name} KYC updated to ${nextKyc}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update KYC');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please enter customer name and phone');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer && !editingCustomer.fromInquiry) {
        await updateCustomer(tenantId, editingCustomer.id, form, user?.uid);
        toast.success('Customer record updated');
      } else {
        await addCustomer(tenantId, form, user?.uid);
        toast.success('New customer registered in CRM');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = combinedCustomers.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dlNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = tagFilter === 'all' || (c.tag || 'regular') === tagFilter;
    return matchesSearch && matchesTag;
  });

  const verifiedCount = combinedCustomers.filter(c => c.kycStatus === 'verified').length;
  const vipCount = combinedCustomers.filter(c => c.tag === 'vip').length;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, margin: 0, color: 'var(--color-text)', fontWeight: 800 }}>Customer Roster & KYC CRM</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2 }}>
              Verified Renters, Driving Licenses, Govt IDs & Customer Profiles
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <FiPlus size={18} /> Register Customer
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="card-custom" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Total Renters</span>
              <strong style={{ fontSize: 22, color: 'var(--color-text)', display: 'block', marginTop: 2 }}>{combinedCustomers.length}</strong>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-bg)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers size={20} />
            </div>
          </div>

          <div className="card-custom" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Verified KYC</span>
              <strong style={{ fontSize: 22, color: '#16A34A', display: 'block', marginTop: 2 }}>{verifiedCount}</strong>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCheckCircle size={20} />
            </div>
          </div>

          <div className="card-custom" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 700, textTransform: 'uppercase' }}>VIP Renters</span>
              <strong style={{ fontSize: 22, color: '#D97706', display: 'block', marginTop: 2 }}>{vipCount}</strong>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiShield size={20} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card-custom" style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search name, phone, email, DL number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Filter by Tag */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'regular', 'vip', 'blacklisted'].map(t => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: tagFilter === t ? 'var(--color-accent)' : 'var(--color-border)',
                  background: tagFilter === t ? 'var(--color-accent-bg)' : 'transparent',
                  color: tagFilter === t ? 'var(--color-accent)' : 'var(--color-text-2)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t === 'blacklisted' ? '⚠️ Blacklisted' : t === 'vip' ? '⭐ VIP' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Roster (Desktop Table & Mobile Touch Cards) */}
        <div>
          {loading ? (
            <div className="card-custom" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-2)', fontSize: 13 }}>
              Loading customer roster...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="card-custom" style={{ padding: 40, textAlign: 'center' }}>
              <FiUsers size={40} style={{ color: 'var(--color-text-3)', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>No Customer Records Found</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>
                Register your first customer record or adjust filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="card-custom admin-desktop-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Customer & DL</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Contact Phone</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Location</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>KYC Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Tag / Tier</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => {
                      const cleanPhone = (c.phone || '').replace(/\D/g, '');
                      const waNum = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                      const tag = c.tag || 'regular';

                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>
                              {c.dlNumber ? `DL: ${c.dlNumber}` : c.email || 'No DL entered'}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>
                            {c.phone || 'N/A'}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-2)' }}>
                            {c.city || 'Pune'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => handleToggleKyc(c)}
                              style={{
                                cursor: 'pointer',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 11,
                                fontWeight: 800,
                                background: c.kycStatus === 'pending' ? '#FFFBEB' : '#F0FDF4',
                                color: c.kycStatus === 'pending' ? '#D97706' : '#16A34A',
                                border: c.kycStatus === 'pending' ? '1px solid #FDE68A' : '1px solid #BBF7D0',
                              }}
                            >
                              {c.kycStatus === 'pending' ? '⏳ Pending KYC' : '✅ Verified KYC'}
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: tag === 'vip' ? '#FEF3C7' : tag === 'blacklisted' ? '#FEE2E2' : 'var(--color-bg-alt)',
                              color: tag === 'vip' ? '#B45309' : tag === 'blacklisted' ? '#991B1B' : 'var(--color-text-2)',
                              border: '1px solid var(--color-border)',
                            }}>
                              {tag === 'vip' ? '⭐ VIP' : tag === 'blacklisted' ? '⛔ Blacklisted' : 'Regular'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                onClick={() => setViewingCustomer(c)}
                                className="btn-icon"
                                title="View Full Profile"
                              >
                                <FiEye size={15} />
                              </button>
                              <a
                                href={`https://wa.me/${waNum}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-icon"
                                title="WhatsApp Chat"
                                style={{ color: '#25D366' }}
                              >
                                <BsWhatsapp size={15} />
                              </a>
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="btn-icon"
                                title="Edit Record"
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(c)}
                                className="btn-icon"
                                title="Delete"
                                style={{ color: '#DC2626' }}
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Touch Cards View */}
              <div className="admin-mobile-view">
                {filteredCustomers.map(c => {
                  const cleanPhone = (c.phone || '').replace(/\D/g, '');
                  const waNum = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                  const tag = c.tag || 'regular';

                  return (
                    <div
                      key={c.id}
                      className="card-custom"
                      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                            {c.name}
                          </h3>
                          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>
                            📍 {c.city || 'Pune'} • {c.dlNumber ? `DL: ${c.dlNumber}` : c.email || 'No DL'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleKyc(c)}
                          style={{
                            cursor: 'pointer',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 10,
                            fontWeight: 800,
                            background: c.kycStatus === 'pending' ? '#FFFBEB' : '#F0FDF4',
                            color: c.kycStatus === 'pending' ? '#D97706' : '#16A34A',
                            border: c.kycStatus === 'pending' ? '1px solid #FDE68A' : '1px solid #BBF7D0',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c.kycStatus === 'pending' ? '⏳ Pending' : '✅ Verified'}
                        </button>
                      </div>

                      {/* Info Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12 }}>
                        <a
                          href={`tel:${c.phone}`}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 4,
                            background: 'var(--color-bg-alt)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <FiPhone size={13} style={{ color: 'var(--color-accent)' }} /> {c.phone || 'Call'}
                        </a>
                        <a
                          href={`https://wa.me/${waNum}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            borderRadius: 4,
                            background: '#25D366',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <BsWhatsapp size={13} /> WhatsApp
                        </a>
                        <span style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: tag === 'vip' ? '#FEF3C7' : tag === 'blacklisted' ? '#FEE2E2' : 'var(--color-bg-alt)',
                          color: tag === 'vip' ? '#B45309' : tag === 'blacklisted' ? '#991B1B' : 'var(--color-text-2)',
                          border: '1px solid var(--color-border)',
                        }}>
                          {tag === 'vip' ? '⭐ VIP' : tag === 'blacklisted' ? '⛔ Blacklisted' : 'Regular'}
                        </span>
                      </div>

                      {/* Bottom Touch Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                        <button
                          onClick={() => setViewingCustomer(c)}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '7px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <FiEye size={13} /> Profile
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '7px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <FiEdit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="btn-secondary"
                          style={{ padding: '7px 12px', fontSize: 12, color: '#DC2626' }}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                placeholder="e.g. rahul@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Pune"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Driving License (DL) No.</label>
              <input
                type="text"
                placeholder="e.g. MH12 20210098765"
                value={form.dlNumber}
                onChange={(e) => setForm({ ...form, dlNumber: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Aadhaar / Govt ID No.</label>
              <input
                type="text"
                placeholder="e.g. 1234 5678 9012"
                value={form.aadhaarNumber}
                onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">KYC Status</label>
              <select
                value={form.kycStatus}
                onChange={(e) => setForm({ ...form, kycStatus: e.target.value })}
                className="input-field"
              >
                <option value="verified">✅ Verified</option>
                <option value="pending">⏳ Pending Verification</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
            <div>
              <label className="input-label">Customer Tier / Tag</label>
              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="input-field"
              >
                <option value="regular">Regular</option>
                <option value="vip">⭐ VIP</option>
                <option value="blacklisted">⛔ Blacklisted</option>
              </select>
            </div>
            <div>
              <label className="input-label">Emergency Phone</label>
              <input
                type="text"
                placeholder="Parent/Spouse Phone"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Internal Notes / Verification Memo</label>
            <textarea
              rows={2}
              placeholder="Verified DL copy on WhatsApp, clean driving record..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving...' : editingCustomer ? 'Update Profile' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Profile Modal */}
      {viewingCustomer && (
        <Modal
          isOpen={Boolean(viewingCustomer)}
          onClose={() => setViewingCustomer(null)}
          title={`Customer Profile - ${viewingCustomer.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>{viewingCustomer.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2 }}>{viewingCustomer.city || 'Pune, India'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div><strong>Phone:</strong> {viewingCustomer.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {viewingCustomer.email || 'N/A'}</div>
              <div><strong>Driving License:</strong> {viewingCustomer.dlNumber || 'Not submitted'}</div>
              <div><strong>Aadhaar / ID:</strong> {viewingCustomer.aadhaarNumber || 'Not submitted'}</div>
              <div><strong>Emergency Contact:</strong> {viewingCustomer.emergencyContact || 'N/A'}</div>
              <div><strong>KYC Status:</strong> {viewingCustomer.kycStatus || 'Verified'}</div>
            </div>

            {viewingCustomer.notes && (
              <div style={{ padding: 12, background: '#FFFBEB', borderRadius: 'var(--radius-sm)', fontSize: 12, border: '1px solid #FDE68A' }}>
                <strong>Admin Notes:</strong> {viewingCustomer.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => setViewingCustomer(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
