import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiDollarSign, FiFilter,
  FiTruck, FiCalendar, FiTag, FiFileText, FiTrendingDown, FiPieChart,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  subscribeToCars,
  formatTimestamp,
} from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

const EXPENSE_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'fuel', label: 'Fuel / Gas', icon: '⛽' },
  { id: 'maintenance', label: 'Vehicle Service & Maintenance', icon: '🔧' },
  { id: 'wash', label: 'Car Wash & Detailing', icon: '🧼' },
  { id: 'insurance', label: 'Insurance & PUC', icon: '🛡️' },
  { id: 'salary', label: 'Driver & Staff Salary', icon: '👨‍✈️' },
  { id: 'rto_tax', label: 'RTO / Tax / Challan', icon: '📜' },
  { id: 'office', label: 'Office & Admin General', icon: '🏢' },
];

export default function AdminExpenses() {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    title: '',
    category: 'fuel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    carId: '',
    paymentMethod: 'UPI',
    notes: '',
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const unsubExp = subscribeToExpenses(tenantId, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    const unsubCars = subscribeToCars(tenantId, (carsData) => {
      setCars(carsData);
    });

    return () => {
      unsubExp();
      unsubCars();
    };
  }, [tenantId]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setForm({
      title: exp.title || '',
      category: exp.category || 'fuel',
      amount: exp.amount || '',
      date: exp.date || new Date().toISOString().split('T')[0],
      carId: exp.carId || '',
      paymentMethod: exp.paymentMethod || 'UPI',
      notes: exp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (expId) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteExpense(tenantId, expId);
      toast.success('Expense record deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete expense record.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Please enter an expense title / description.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid expense amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        carId: form.carId || null,
        carName: cars.find(c => c.id === form.carId)?.name || 'General Fleet',
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      };

      if (editingExpense) {
        await updateExpense(tenantId, editingExpense.id, payload, user?.uid);
        toast.success('Expense updated successfully!');
      } else {
        await addExpense(tenantId, payload, user?.uid);
        toast.success('Expense recorded successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredExpenses = expenses.filter(exp => {
    const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch =
      (exp.title && exp.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.carName && exp.carName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.paymentMethod && exp.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Calculate Metrics
  const totalExpensesSum = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const fuelExpensesSum = expenses.filter(e => e.category === 'fuel').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const maintenanceSum = expenses.filter(e => e.category === 'maintenance').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)' }}>
              Expenses & Outflow CRM
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>
              Track fleet fuel, maintenance, washes, taxes, and operational overheads
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <FiPlus size={18} />
            Record Expense
          </button>
        </div>

        {/* Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <div className="card-custom" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: '#FFF0F0', color: '#DC2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              <FiTrendingDown />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>Total Expense Outflow</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                {formatCurrency(totalExpensesSum)}
              </p>
            </div>
          </div>

          <div className="card-custom" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: '#FFFBEB', color: '#D97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              ⛽
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>Fuel Outflow</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                {formatCurrency(fuelExpensesSum)}
              </p>
            </div>
          </div>

          <div className="card-custom" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: '#EFF6FF', color: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              🔧
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>Service & Maintenance</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                {formatCurrency(maintenanceSum)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="card-custom" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search expenses by title, car, method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, flex: '2 1 300px' }}>
            {EXPENSE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? 'var(--color-accent)' : 'var(--color-border)',
                  background: selectedCategory === cat.id ? 'var(--color-accent-bg)' : 'transparent',
                  color: selectedCategory === cat.id ? 'var(--color-accent)' : 'var(--color-text-2)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.icon && <span style={{ marginRight: 4 }}>{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List View (Desktop Table & Mobile Touch Cards) */}
        <div>
          {loading ? (
            <div className="card-custom" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-3)' }}>
              Loading expenses log...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="card-custom" style={{ padding: 40, textAlign: 'center' }}>
              <FiTrendingDown size={40} style={{ color: 'var(--color-text-3)', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>No Expenses Recorded</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>
                Click "Record Expense" to add fuel receipts, maintenance costs, or operational bills.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="card-custom admin-desktop-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Title & Category</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Car / Fleet</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Payment Method</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Amount</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map(exp => {
                      const catObj = EXPENSE_CATEGORIES.find(c => c.id === exp.category) || { label: exp.category, icon: '🏷️' };
                      return (
                        <tr key={exp.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{exp.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <span>{catObj.icon}</span> {catObj.label}
                              {exp.notes && <span style={{ fontStyle: 'italic', marginLeft: 6 }}>• {exp.notes}</span>}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-2)', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FiTruck size={14} style={{ color: 'var(--color-text-3)' }} />
                              {exp.carName || 'General Fleet'}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>
                            {exp.date}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-bg-alt)',
                              border: '1px solid var(--color-border)',
                              fontSize: 11,
                              fontWeight: 700,
                              color: 'var(--color-text-2)'
                            }}>
                              {exp.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#DC2626' }}>
                            -{formatCurrency(exp.amount)}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                              <button
                                onClick={() => handleOpenEdit(exp)}
                                className="btn-icon"
                                title="Edit Expense"
                                style={{ color: 'var(--color-text-2)' }}
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(exp.id)}
                                className="btn-icon"
                                title="Delete Expense"
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
                {filteredExpenses.map(exp => {
                  const catObj = EXPENSE_CATEGORIES.find(c => c.id === exp.category) || { label: exp.category, icon: '🏷️' };
                  return (
                    <div
                      key={exp.id}
                      className="card-custom"
                      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                            {exp.title}
                          </h3>
                          <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{catObj.icon}</span> {catObj.label} • 📅 {exp.date}
                          </p>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#DC2626', whiteSpace: 'nowrap' }}>
                          -{formatCurrency(exp.amount)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-2)', fontWeight: 600 }}>
                          <FiTruck size={13} style={{ color: 'var(--color-text-3)' }} />
                          {exp.carName || 'General Fleet'}
                        </div>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: 'var(--color-bg-alt)',
                          border: '1px solid var(--color-border)',
                          fontSize: 10,
                          fontWeight: 800,
                          color: 'var(--color-text-2)'
                        }}>
                          {exp.paymentMethod || 'Cash'}
                        </span>
                      </div>

                      {/* Bottom Touch Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '7px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <FiEdit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="btn-secondary"
                          style={{ padding: '7px 12px', fontSize: 12, color: '#DC2626' }}
                        >
                          <FiTrash2 size={13} /> Delete
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
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label">Expense Title / Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Full Tank Fuel MH 12 AB 1234 or Oil Change"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {EXPENSE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 2500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Associated Car (Optional)</label>
              <select
                value={form.carId}
                onChange={(e) => setForm({ ...form, carId: e.target.value })}
                className="input-field"
              >
                <option value="">-- General Fleet / Office --</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.registrationNo ? `(${c.registrationNo})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="input-field"
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="Cash">Cash</option>
              <option value="NetBanking">Net Banking / NEFT</option>
              <option value="Card">Credit / Debit Card</option>
            </select>
          </div>

          <div>
            <label className="input-label">Notes / Receipt Ref</label>
            <textarea
              rows={2}
              placeholder="Receipt number, shop name, or extra details..."
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
              {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
