import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiInfo, FiZap,
  FiUpload, FiImage, FiX, FiTruck, FiUsers, FiCheckCircle, FiStar,
} from 'react-icons/fi';
import { BsCarFront, BsCarFrontFill } from 'react-icons/bs';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToCars,
  getCars,
  addCar,
  updateCar,
  deleteCar,
  seedDefaultFleet,
} from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminCars() {
  const { tenantId } = useTenant();
  const { user } = useAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [viewingCar, setViewingCar] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleOpenView = (car) => {
    setViewingCar(car);
    setIsViewModalOpen(true);
  };

  const initialFormState = {
    name: 'Force Traveller - Lonavala Package',
    busModel: 'Force Traveller',
    category: 'bus',
    seats: 17,
    acType: 'ac',
    pricePerDay: 9500,
    perKmRate: 25,
    includedKm: 'Lonavala Package',
    extraKmRate: 25,
    description: '17 Seat AC Force Traveller Bus. Push-back seats, chilled AC, sanitized bus, professional tour driver.',
    imagesText: '/force-traveller.jpg',
    isActive: true,
    isPopular: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCars(tenantId, (data) => {
      setCars(data);
      setLoading(false);
    });
    return () => unsub();
  }, [tenantId]);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name || '',
      busModel: car.busModel || 'Force Traveller',
      category: car.category || 'bus',
      seats: Number(car.seats) || 17,
      acType: car.acType || 'ac',
      pricePerDay: car.pricePerDay || 9500,
      perKmRate: car.perKmRate || car.extraKmRate || 25,
      includedKm: car.includedKm || '',
      extraKmRate: car.extraKmRate || car.perKmRate || 25,
      description: car.description || '',
      imagesText: (car.images || ['/force-traveller.jpg']).join('\n'),
      isActive: car.isActive !== false,
      isPopular: car.isPopular !== false,
    });
    setIsModalOpen(true);
  };

  const handleSeedForceFleet = async () => {
    if (!window.confirm('Do you want to add the 4 Force Traveller packages (Lonavala, Mahabaleshwar, Mumbai Non-AC, Mumbai AC) into Firestore?')) return;
    try {
      setLoading(true);
      await seedDefaultFleet(tenantId, user?.uid);
      toast.success('Successfully added 4 Force Traveller packages to your fleet!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add packages');
    } finally {
      setLoading(false);
    }
  };

  // Device File Upload Handler (Base64 Reader)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload valid image files');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Url = evt.target.result;
        setFormData(prev => {
          const currentList = prev.imagesText.split('\n').map(u => u.trim()).filter(Boolean);
          const newList = [...currentList, base64Url];
          return {
            ...prev,
            imagesText: newList.join('\n'),
          };
        });
        toast.success(`Uploaded ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentList = formData.imagesText.split('\n').map(u => u.trim()).filter(Boolean);
    const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({
      ...prev,
      imagesText: updatedList.join('\n'),
    }));
    toast.success('Image removed');
  };

  const handleDelete = async (carId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteCar(tenantId, carId);
      toast.success('Vehicle / Package removed from fleet');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleActive = async (car) => {
    try {
      await updateCar(tenantId, car.id, { isActive: !car.isActive }, user?.uid);
      toast.success(`${car.name} status updated`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleTogglePopular = async (car) => {
    try {
      const nextState = !car.isPopular;
      await updateCar(tenantId, car.id, { isPopular: nextState }, user?.uid);
      toast.success(`${car.name} ${nextState ? 'marked as Popular' : 'removed from Popular'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update popular status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter vehicle or package name');
      return;
    }
    setSubmitting(true);

    const imageUrls = formData.imagesText
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean);

    const seatsNum = Number(formData.seats) || 17;
    const priceNum = Number(formData.pricePerDay) || 0;
    const perKmNum = Number(formData.perKmRate) || 0;
    const extraKmNum = Number(formData.extraKmRate) || perKmNum || 25;

    const carDataPayload = {
      name: formData.name.trim(),
      busModel: formData.busModel?.trim() || 'Force Traveller',
      category: formData.category || 'bus',
      seats: seatsNum,
      acType: formData.acType || 'ac',
      pricePerDay: priceNum,
      perKmRate: perKmNum,
      includedKm: formData.includedKm?.trim() || '',
      extraKmRate: extraKmNum,
      description: formData.description?.trim() || '',
      images: imageUrls.length > 0 ? imageUrls : ['/force-traveller.jpg'],
      isActive: Boolean(formData.isActive),
      isPopular: Boolean(formData.isPopular),
      rating: 4.9,
    };

    try {
      if (editingCar) {
        await updateCar(tenantId, editingCar.id, carDataPayload, user?.uid);
        toast.success('Fleet item updated successfully');
      } else {
        await addCar(tenantId, carDataPayload, user?.uid);
        toast.success('New vehicle / package added to fleet');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save fleet item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAllCars = async () => {
    if (!window.confirm('Are you sure you want to delete ALL fleet cars from Firestore? This cannot be undone.')) return;
    try {
      setLoading(true);
      const all = await getCars(tenantId);
      let count = 0;
      for (const item of all) {
        await deleteCar(tenantId, item.id);
        count++;
      }
      toast.success(`Removed ${count} cars from database. Fleet is now completely empty.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear cars');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSampleFleet = async () => {
    if (!window.confirm('Do you want to load default sample preset cars into Firestore?')) return;
    try {
      setLoading(true);
      await seedDefaultFleet(tenantId, user?.uid);
      toast.success('Sample presets loaded into fleet');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sample fleet');
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const imageList = formData.imagesText.split('\n').map(u => u.trim()).filter(Boolean);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, margin: 0, color: 'var(--color-text)', fontWeight: 800 }}>Fleet Management</h1>
            <p style={{ fontSize: 12.5, color: 'var(--color-text-2)', marginTop: 2 }}>
              Dynamic Admin Managed Fleet • Cloud Firestore Sync
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleSeedForceFleet}
              className="btn btn-secondary btn-sm"
              style={{
                color: '#FF4500',
                borderColor: '#FF4500',
                background: 'rgba(255, 69, 0, 0.08)',
                fontWeight: 800,
                fontSize: 12,
                gap: 6,
              }}
              title="Add 4 Force Traveller packages (Lonavala, Mahabaleshwar, Mumbai Non-AC & AC)"
            >
              🚐 Add 4 Force Traveller Packages
            </button>
            {cars.length > 0 && (
              <button onClick={handleClearAllCars} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error)', gap: 6, fontSize: 12 }}>
                <FiTrash2 /> Clear Fleet
              </button>
            )}
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm" style={{ gap: 6, background: 'linear-gradient(135deg, #FF4500 0%, #E66E00 100%)', borderColor: '#FF4500', fontSize: 12.5, padding: '8px 14px' }}>
              <FiPlus /> Add Vehicle
            </button>
          </div>
        </div>

        {/* Compact Quick Stats Bar */}
        <div className="grid-4" style={{ gap: 10 }}>
          <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Cars</span>
              <strong style={{ fontSize: 18, color: '#0F172A', display: 'block', lineHeight: 1.1 }}>{cars.length}</strong>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 69, 0,0.09)', color: '#FF4500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BsCarFront size={18} />
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Active Live</span>
              <strong style={{ fontSize: 18, color: '#16A34A', display: 'block', lineHeight: 1.1 }}>{cars.filter(c => c.isActive !== false).length}</strong>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(22,163,74,0.08)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCheckCircle size={18} />
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Popular Picked</span>
              <strong style={{ fontSize: 18, color: '#FF4500', display: 'block', lineHeight: 1.1 }}>{cars.filter(c => c.isPopular !== false).length}</strong>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 69, 0,0.08)', color: '#FF4500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiZap size={18} />
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Buses & Travellers</span>
              <strong style={{ fontSize: 18, color: '#2563EB', display: 'block', lineHeight: 1.1 }}>{cars.filter(c => Number(c.seats) >= 13).length}</strong>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers size={18} />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card" style={{ padding: 10, background: '#FFFFFF' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search by package, bus model, tour destination, seats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, height: 36, fontSize: 13 }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-2)', fontSize: 13 }}>Loading live fleet from Firestore...</p>
          ) : filteredCars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <BsCarFront size={48} color="#FF4500" />
              </div>
              <div className="empty-state-title" style={{ marginTop: 12 }}>No vehicles or packages in fleet</div>
              <p style={{ fontSize: 13, color: '#64748B', margin: '8px 0 16px' }}>
                Click below to add your first vehicle or tour package.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSeedForceFleet}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'linear-gradient(135deg, #FF4500 0%, #E66E00 100%)', borderColor: '#FF4500', fontWeight: 800, padding: '9px 18px', fontSize: 13 }}
                >
                  🚐 Add 4 Force Traveller Packages
                </button>
                <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm" style={{ padding: '9px 18px', fontSize: 13 }}>
                  + Custom Vehicle / Package
                </button>
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle / Tour Package</th>
                    <th>Type</th>
                    <th>Seats (Shita)</th>
                    <th>AC Type</th>
                    <th>Package Rate (₹)</th>
                    <th>Rate / KM (₹)</th>
                    <th>Included KM</th>
                    <th>Extra KM</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((c) => {
                    const seatsCount = Number(c.seats) || 17;
                    const perKmRate = c.perKmRate || c.extraKmRate || 25;
                    const extraKmRate = c.extraKmRate || perKmRate || 25;
                    const isNonAc = c.acType === 'non_ac';
                    const isBothAc = c.acType === 'both';
                    return (
                      <tr key={c.id}>
                        <td>
                          <div
                            onClick={() => handleOpenView(c)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                            title="Click to view full package details"
                          >
                            <img
                              src={c.images?.[0] || '/force-traveller.jpg'}
                              alt=""
                              onError={(e) => { e.target.src = '/force-traveller.jpg'; }}
                              style={{ width: 48, height: 34, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #E2E8F0' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <strong style={{ color: '#0F172A', display: 'block', fontSize: 13, lineHeight: 1.2 }}>{c.name}</strong>
                                <span style={{ fontSize: 9.5, fontWeight: 800, background: '#FEF3C7', color: '#D97706', padding: '1px 5px', borderRadius: 4 }}>
                                  {c.busModel || 'Force Traveller'}
                                </span>
                              </div>
                              <span style={{ fontSize: 11, color: '#64748B' }}>{c.description ? c.description.slice(0, 38) + '...' : 'Tour & Rental'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${c.category === 'bus' ? 'badge-warning' : c.category === 'package' ? 'badge-success' : 'badge-accent'}`} style={{ fontSize: 10.5, padding: '2px 8px' }}>
                            {c.category ? c.category.toUpperCase() : 'BUS'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>{seatsCount} Seats</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${isNonAc ? 'badge-secondary' : 'badge-accent'}`}
                            style={{
                              fontSize: 10.5,
                              padding: '2px 8px',
                              background: isNonAc ? '#E2E8F0' : isBothAc ? '#FEF3C7' : 'rgba(37,99,235,0.1)',
                              color: isNonAc ? '#475569' : isBothAc ? '#D97706' : '#2563EB',
                              fontWeight: 800,
                            }}
                          >
                            {isNonAc ? 'Non-AC' : isBothAc ? 'AC / Non-AC' : 'AC'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#FF4500', fontSize: 14 }}>{formatCurrency(c.pricePerDay || 0)}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', background: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: 99 }}>
                            ₹{perKmRate}/km
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                            {c.includedKm || '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#D97706' }}>
                            ₹{extraKmRate}/km
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleTogglePopular(c)}
                            style={{
                              cursor: 'pointer',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: 99,
                              fontSize: 10.5,
                              fontWeight: 800,
                              background: c.isPopular !== false ? 'rgba(255, 69, 0, 0.12)' : '#F1F5F9',
                              color: c.isPopular !== false ? '#FF4500' : '#64748B',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {c.isPopular !== false ? <><FiZap size={11} color="#FF4500" /> Popular</> : 'Standard'}
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleActive(c)}
                            className={`badge ${c.isActive !== false ? 'badge-success' : 'badge-error'}`}
                            style={{ cursor: 'pointer', border: 'none', fontSize: 10.5, padding: '2px 6px' }}
                          >
                            {c.isActive !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-icon" onClick={() => handleOpenView(c)} title="View Vehicle Details">
                              <FiInfo size={13} color="#2563EB" />
                            </button>
                            <button className="btn-icon" onClick={() => handleOpenEdit(c)} title="Edit Vehicle">
                              <FiEdit2 size={13} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDelete(c.id, c.name)} style={{ color: 'var(--color-error)' }} title="Delete Vehicle">
                              <FiTrash2 size={13} />
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
      </div>

      {/* 👁️ Vehicle Details Info Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewingCar ? `${viewingCar.name} — Full Specifications & Rates` : 'Vehicle Info'}
        maxWidth={620}
      >
        {viewingCar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Main Image & Quick Badges */}
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 200, background: '#0F172A' }}>
              <img
                src={viewingCar.images?.[0] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'}
                alt={viewingCar.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                <span className="badge badge-accent" style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  {viewingCar.category || 'BUS'}
                </span>
                {viewingCar.isPopular !== false && (
                  <span className="badge badge-warning" style={{ background: '#FF4500', color: '#FFFFFF', fontWeight: 800 }}>
                    ⭐ Most Popular
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                {viewingCar.seats || 17} Seats • {viewingCar.acType === 'non_ac' ? 'Non-AC' : viewingCar.acType === 'both' ? 'AC / Non-AC' : 'AC'}
              </span>
              <h2 style={{ fontSize: 20, color: '#0F172A', fontWeight: 900, margin: '2px 0 0' }}>{viewingCar.name}</h2>
            </div>

            {/* Pricing Rate Grid */}
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Package / Base Rate</span>
                <strong style={{ fontSize: 17, color: '#FF4500', display: 'block' }}>{formatCurrency(viewingCar.pricePerDay || 0)}</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Rate Per KM</span>
                <strong style={{ fontSize: 15, color: '#16A34A', display: 'block' }}>₹{viewingCar.perKmRate || viewingCar.extraKmRate || 25}/km</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Included KM Limit</span>
                <strong style={{ fontSize: 15, color: '#0F172A', display: 'block' }}>{viewingCar.includedKm || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Extra KM Rate</span>
                <strong style={{ fontSize: 15, color: '#D97706', display: 'block' }}>₹{viewingCar.extraKmRate || viewingCar.perKmRate || 25}/km</strong>
              </div>
            </div>

            {/* Specifications Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 10, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Seating Capacity (Shita)</span>
                <strong style={{ fontSize: 13, color: '#0F172A' }}>{viewingCar.seats || 17} Seats</strong>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Fleet Visibility</span>
                <strong style={{ fontSize: 13, color: viewingCar.isActive !== false ? '#16A34A' : '#FF5500' }}>
                  {viewingCar.isActive !== false ? '✅ Active on Website' : '🔴 Hidden'}
                </strong>
              </div>
            </div>

            {/* Description / Inclusions */}
            {viewingCar.description && (
              <div style={{ padding: 10, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Inclusions & Notes</span>
                <p style={{ fontSize: 12.5, color: '#334155', margin: 0, lineHeight: 1.5 }}>{viewingCar.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(viewingCar);
                }}
                className="btn btn-primary btn-sm"
                style={{ background: '#FF4500', borderColor: '#FF4500', fontWeight: 800, padding: '7px 16px' }}
              >
                <FiEdit2 size={13} /> Edit Package
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '7px 14px' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 🚐 Clean Travels Fleet & Tour Package Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCar ? `Edit Package / Vehicle — ${editingCar.name}` : 'Add New Vehicle / Tour Package'}
        maxWidth={640}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* Vehicle / Tour Package Title & Bus Model */}
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Vehicle / Tour Package Name *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Force Traveller - Lonavala Package"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ fontSize: 13, height: 40, fontWeight: 700 }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                Bus Model / Vehicle *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Force Traveller"
                value={formData.busModel || 'Force Traveller'}
                onChange={e => setFormData({ ...formData, busModel: e.target.value })}
                style={{ fontSize: 13, height: 40, fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Row 1: Fleet Type, Seating (Shita), AC Configuration */}
          <div className="grid-3" style={{ gap: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                Category / Fleet Type
              </label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{ fontSize: 12.5, height: 38 }}
              >
                <option value="bus">Bus & Tempo Traveller</option>
                <option value="package">Tour Package</option>
                <option value="muv">7-Seater MUV (Ertiga / Innova)</option>
                <option value="car">Cab / Car (Swift / Dzire)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                Seating Capacity (Seats) *
              </label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                placeholder="e.g. 17 or 20"
                value={formData.seats}
                onChange={e => setFormData({ ...formData, seats: e.target.value })}
                style={{ fontSize: 12.5, height: 38, fontWeight: 800 }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                AC Configuration *
              </label>
              <select
                className="form-select"
                value={formData.acType}
                onChange={e => setFormData({ ...formData, acType: e.target.value })}
                style={{ fontSize: 12.5, height: 38 }}
              >
                <option value="ac">AC (Air Conditioned)</option>
                <option value="non_ac">Non-AC</option>
                <option value="both">Both AC & Non-AC Available</option>
              </select>
            </div>
          </div>

          {/* Row 2: Package Rate & Per KM Rate */}
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                Package / Base Rate (₹) *
              </label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="e.g. 9500, 11000, 12000, 15000"
                value={formData.pricePerDay}
                onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })}
                style={{ fontSize: 13, height: 38, fontWeight: 800, color: '#FF4500' }}
              />
              <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', marginTop: 2 }}>
                Fixed tour package price or base day rate
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                Rate Per KM (₹/km) *
              </label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="e.g. 25, 27, 29"
                value={formData.perKmRate}
                onChange={e => setFormData({ ...formData, perKmRate: e.target.value })}
                style={{ fontSize: 13, height: 38, fontWeight: 800, color: '#16A34A' }}
              />
              <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', marginTop: 2 }}>
                Rate per km for distance billing (e.g. ₹25/km, ₹29/km)
              </span>
            </div>
          </div>

          {/* Row 3: Included KM Limit & Extra KM Rate */}
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                Included KM Limit (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 350 km or Lonavala Round Trip"
                value={formData.includedKm}
                onChange={e => setFormData({ ...formData, includedKm: e.target.value })}
                style={{ fontSize: 12.5, height: 38 }}
              />
              <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', marginTop: 2 }}>
                Package distance limit (e.g. 350 km)
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                Extra KM Rate (₹/km)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 25 or 28"
                value={formData.extraKmRate}
                onChange={e => setFormData({ ...formData, extraKmRate: e.target.value })}
                style={{ fontSize: 12.5, height: 38 }}
              />
              <span style={{ fontSize: 10.5, color: '#64748B', display: 'block', marginTop: 2 }}>
                Rate charged beyond package KM limit
              </span>
            </div>
          </div>

          {/* Inclusions & Highlights Note */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
              Package Inclusions & Features (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Push-back seats, Driver allowance included, Music system, Clean interior, Toll extra"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ fontSize: 12.5, height: 38 }}
            />
          </div>

          {/* Visibility & Badges */}
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>Website Visibility</label>
              <select
                className="form-select"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                style={{ fontSize: 12.5, height: 38 }}
              >
                <option value="active">Active (Visible on Website)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>Showcase Badge</label>
              <select
                className="form-select"
                value={formData.isPopular ? 'popular' : 'standard'}
                onChange={e => setFormData({ ...formData, isPopular: e.target.value === 'popular' })}
                style={{ fontSize: 12.5, height: 38 }}
              >
                <option value="popular">Mark as Popular Package</option>
                <option value="standard">Standard Fleet Listing</option>
              </select>
            </div>
          </div>

          {/* Photos Upload / URL */}
          <div className="form-group" style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <label className="form-label" style={{ margin: 0, fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiImage style={{ color: '#FF4500' }} /> Vehicle Photo (Upload or Paste Link)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                id="travel-photo-upload-input"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label
                htmlFor="travel-photo-upload-input"
                className="btn btn-secondary btn-sm"
                style={{
                  cursor: 'pointer',
                  fontSize: 11.5,
                  padding: '4px 10px',
                  background: '#FFFFFF',
                  color: '#FF4500',
                  borderColor: '#FF4500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <FiUpload size={13} /> Upload from Device
              </label>
            </div>

            {/* Thumbnail Previews */}
            {imageList.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {imageList.map((imgUrl, index) => (
                  <div key={index} style={{ position: 'relative', width: 60, height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                    <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: 'rgba(255, 69, 0, 0.9)',
                        color: '#FFFFFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        cursor: 'pointer',
                      }}
                      title="Remove image"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Or paste image URLs (one per line)..."
              value={formData.imagesText}
              onChange={e => setFormData({ ...formData, imagesText: e.target.value })}
              style={{ fontSize: 11.5, padding: 8 }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full"
            style={{ background: '#FF4500', borderColor: '#FF4500', marginTop: 4, height: 42, fontSize: 14, fontWeight: 800 }}
          >
            {submitting ? 'Saving to Fleet...' : editingCar ? 'Update Fleet Listing' : 'Save & Add to Live Fleet'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
