import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiAlertTriangle,
  FiCheckCircle, FiBox, FiTag, FiRefreshCw, FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

const INVENTORY_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'spare_parts', label: 'Spare Parts & Tyres', icon: '⚙️' },
  { id: 'cleaning', label: 'Cleaning & Wash Supplies', icon: '🧼' },
  { id: 'accessories', label: 'Car Accessories & Mats', icon: '🪑' },
  { id: 'tech_docs', label: 'GPS Trackers & Fastags', icon: '📡' },
  { id: 'safety', label: 'First Aid & Safety Kits', icon: '🩹' },
];

export default function AdminInventory() {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    category: 'spare_parts',
    quantity: 10,
    reorderLevel: 3,
    costPerUnit: 500,
    supplier: '',
    notes: '',
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const unsub = subscribeToInventory(tenantId, (data) => {
      setInventory(data);
      setLoading(false);
    });
    return () => unsub();
  }, [tenantId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      category: item.category || 'spare_parts',
      quantity: item.quantity ?? 10,
      reorderLevel: item.reorderLevel ?? 3,
      costPerUnit: item.costPerUnit ?? 0,
      supplier: item.supplier || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this inventory item?')) return;
    try {
      await deleteInventoryItem(tenantId, itemId);
      toast.success('Inventory item deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete item.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter item name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
        costPerUnit: Number(form.costPerUnit),
        supplier: form.supplier.trim(),
        notes: form.notes.trim(),
      };

      if (editingItem) {
        await updateInventoryItem(tenantId, editingItem.id, payload, user?.uid);
        toast.success('Inventory item updated!');
      } else {
        await addInventoryItem(tenantId, payload, user?.uid);
        toast.success('Inventory item added!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Inventory List
  const filteredInventory = inventory.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Calculate Metrics & Alerts
  const totalItemsCount = inventory.length;
  const lowStockItems = inventory.filter(item => Number(item.quantity) <= Number(item.reorderLevel));
  const totalValuation = inventory.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.costPerUnit)), 0);

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
              Fleet Inventory & Spare Parts
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>
              Manage car accessories, GPS trackers, Fastags, cleaning supplies & spare stock
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <FiPlus size={18} />
            Add Inventory Item
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
              background: '#EFF6FF', color: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              <FiPackage />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>Total Unique Items</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                {totalItemsCount} Types
              </p>
            </div>
          </div>

          <div className="card-custom" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: lowStockItems.length > 0 ? '#FFF0F0' : '#F0FDF4',
              color: lowStockItems.length > 0 ? '#DC2626' : '#16A34A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              {lowStockItems.length > 0 ? <FiAlertTriangle /> : <FiCheckCircle />}
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>Low Stock Alert</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: lowStockItems.length > 0 ? '#DC2626' : 'var(--color-text)', marginTop: 2 }}>
                {lowStockItems.length} Items Reorder
              </p>
            </div>
          </div>

          <div className="card-custom" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: '#F0FDF4', color: '#16A34A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              <FiDollarSign />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 600 }}>Total Inventory Value</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>
                {formatCurrency(totalValuation)}
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
              placeholder="Search by item name, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, flex: '2 1 300px' }}>
            {INVENTORY_CATEGORIES.map(cat => (
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
        {/* Inventory List (Desktop Table & Mobile Touch Cards) */}
        <div>
          {loading ? (
            <div className="card-custom" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-3)' }}>
              Loading inventory stock...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="card-custom" style={{ padding: 40, textAlign: 'center' }}>
              <FiBox size={40} style={{ color: 'var(--color-text-3)', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>No Inventory Found</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>
                Click "Add Inventory Item" to add spare parts, GPS devices, or car wash stock.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="card-custom admin-desktop-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Item Name & Category</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Stock Level</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Unit Cost</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Supplier / Vendor</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-2)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => {
                      const isLow = Number(item.quantity) <= Number(item.reorderLevel);
                      const catObj = INVENTORY_CATEGORIES.find(c => c.id === item.category) || { label: item.category, icon: '📦' };
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <span>{catObj.icon}</span> {catObj.label}
                              {item.notes && <span style={{ fontStyle: 'italic', marginLeft: 6 }}>• {item.notes}</span>}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 15, color: isLow ? '#DC2626' : 'var(--color-text)' }}>
                                {item.quantity} units
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 400 }}>
                                (Reorder at {item.reorderLevel})
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-2)' }}>
                            {formatCurrency(item.costPerUnit)}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-3)' }}>
                            {item.supplier || 'Local Supplier'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 11,
                              fontWeight: 700,
                              background: isLow ? '#FFF0F0' : '#F0FDF4',
                              color: isLow ? '#DC2626' : '#16A34A',
                              border: isLow ? '1px solid #FECACA' : '1px solid #BBF7D0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}>
                              {isLow ? <><FiAlertTriangle size={12} /> Low Stock</> : <><FiCheckCircle size={12} /> In Stock</>}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="btn-icon"
                                title="Edit Item"
                                style={{ color: 'var(--color-text-2)' }}
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="btn-icon"
                                title="Delete Item"
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
                {filteredInventory.map(item => {
                  const isLow = Number(item.quantity) <= Number(item.reorderLevel);
                  const catObj = INVENTORY_CATEGORIES.find(c => c.id === item.category) || { label: item.category, icon: '📦' };
                  return (
                    <div
                      key={item.id}
                      className="card-custom"
                      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                            {item.name}
                          </h3>
                          <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{catObj.icon}</span> {catObj.label} • 🏢 {item.supplier || 'Local Supplier'}
                          </p>
                        </div>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 800,
                          background: isLow ? '#FFF0F0' : '#F0FDF4',
                          color: isLow ? '#DC2626' : '#16A34A',
                          border: isLow ? '1px solid #FECACA' : '1px solid #BBF7D0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          whiteSpace: 'nowrap',
                        }}>
                          {isLow ? <><FiAlertTriangle size={11} /> Low Stock</> : <><FiCheckCircle size={11} /> In Stock</>}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                        <div>
                          <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Stock Count: </span>
                          <strong style={{ fontSize: 14, color: isLow ? '#DC2626' : 'var(--color-text)' }}>
                            {item.quantity} units
                          </strong>
                          <span style={{ fontSize: 10, color: 'var(--color-text-3)', marginLeft: 4 }}>(Alert: {item.reorderLevel})</span>
                        </div>
                        <strong style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
                          {formatCurrency(item.costPerUnit)}/unit
                        </strong>
                      </div>

                      {/* Bottom Touch Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '7px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <FiEdit2 size={13} /> Edit Item
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="input-label">Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. AIS-140 GPS Tracker, 5W-30 Synthetic Engine Oil"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                {INVENTORY_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Cost Per Unit (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1200"
                value={form.costPerUnit}
                onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label">Available Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 15"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Reorder Alert Level *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="Alert when stock <= level"
                value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Supplier / Vendor Name</label>
            <input
              type="text"
              placeholder="e.g. Fastag Pune Hub / Auto Parts Market"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label">Notes / Storage Rack</label>
            <textarea
              rows={2}
              placeholder="e.g. Kept in Rack B3, for Ertiga & Thar maintenance"
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
              {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
    </AdminLayout>
  );
}
