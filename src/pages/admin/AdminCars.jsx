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
} from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

// Preset templates tailored to client's exact business catalog
const CLIENT_PRESETS = [
  {
    name: 'Ertiga VXI Petrol+CNG',
    brand: 'Maruti',
    category: 'muv',
    pricePerDay: 3200,
    extraKmRate: 7,
    extraTimeRate: 200,
    seats: 7,
    transmission: 'manual',
    fuelType: 'cng',
    securityDeposit: 3000,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description: 'Spacious 7-seater Maruti Ertiga VXI with Dual Fuel Petrol+CNG efficiency.',
  },
  {
    name: 'Baleno Delta Petrol',
    brand: 'Maruti',
    category: 'hatchback',
    pricePerDay: 2300,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'petrol',
    securityDeposit: 2000,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    description: 'Smooth Maruti Baleno Delta Petrol hatchback for comfortable city & highway drives.',
  },
  {
    name: 'Baleno Zeta CNG',
    brand: 'Maruti',
    category: 'hatchback',
    pricePerDay: 2500,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'cng',
    securityDeposit: 2000,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    description: 'Top-spec Maruti Baleno Zeta Factory CNG with maximum fuel saving.',
  },
  {
    name: 'Thar 4x2 Diesel',
    brand: 'Mahindra',
    category: 'suv',
    pricePerDay: 5000,
    extraKmRate: 7,
    extraTimeRate: 300,
    seats: 4,
    transmission: 'manual',
    fuelType: 'diesel',
    securityDeposit: 5000,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic Mahindra Thar 4x2 RWD Diesel with massive road presence.',
  },
  {
    name: 'Swift VXI (O) Petrol',
    brand: 'Maruti',
    category: 'hatchback',
    pricePerDay: 2300,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'petrol',
    securityDeposit: 2000,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    description: 'Popular Maruti Swift VXI Option Petrol with peppy engine and agility.',
  },
  {
    name: 'Tata Nexon CNG',
    brand: 'Tata',
    category: 'suv',
    pricePerDay: 2800,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'cng',
    securityDeposit: 2500,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    description: '5-Star Safety Tata Nexon iCNG Compact SUV with twin cylinder technology.',
  },
  {
    name: 'WagonR VXI CNG',
    brand: 'Maruti',
    category: 'hatchback',
    pricePerDay: 2000,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'cng',
    securityDeposit: 2000,
    isPopular: false,
    imagesText: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    description: 'Economical Maruti WagonR VXI CNG with tall-boy stance and high mileage.',
  },
  {
    name: 'Fronx Sigma Petrol',
    brand: 'Maruti',
    category: 'hatchback',
    pricePerDay: 2600,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'petrol',
    securityDeposit: 2500,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    description: 'Stylish Maruti Suzuki Fronx Sigma Crossover Petrol SUV.',
  },
  {
    name: 'Venue S+ with Sunroof Petrol',
    brand: 'Hyundai',
    category: 'suv',
    pricePerDay: 2800,
    extraKmRate: 6,
    extraTimeRate: 200,
    seats: 5,
    transmission: 'manual',
    fuelType: 'petrol',
    securityDeposit: 2500,
    isPopular: true,
    imagesText: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description: 'Hyundai Venue S+ Petrol with Electric Sunroof and luxury features.',
  },
];

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
    name: '',
    brand: '',
    category: 'hatchback',
    imagesText: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    pricePerHour: 200,
    pricePerDay: 2300,
    extraKmRate: 6,
    extraTimeRate: 200,
    securityDeposit: 2000,
    features: ['Air Conditioner', 'Bluetooth Music', 'ABS Brakes', 'Power Windows'],
    citiesAvailable: ['Pune', 'Mumbai', 'Pimpri-Chinchwad'],
    isActive: true,
    isPopular: true,
    rating: 4.8,
    description: '',
    registrationNo: '',
    fastagId: '',
    odometer: 25000,
    operationalStatus: 'available',
    insuranceExpiry: '',
    pucExpiry: '',
    nextServiceKm: 30000,
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
      ...car,
      extraKmRate: car.extraKmRate || (car.seats === 7 ? 7 : 6),
      extraTimeRate: car.extraTimeRate || (car.name?.toLowerCase().includes('thar') ? 300 : 200),
      isPopular: car.isPopular !== false,
      imagesText: (car.images || []).join('\n'),
      registrationNo: car.registrationNo || '',
      fastagId: car.fastagId || '',
      odometer: car.odometer || 25000,
      operationalStatus: car.operationalStatus || 'available',
      insuranceExpiry: car.insuranceExpiry || '',
      pucExpiry: car.pucExpiry || '',
      nextServiceKm: car.nextServiceKm || 30000,
    });
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      ...initialFormState,
      ...preset,
    });
    toast.success(`Loaded preset for ${preset.name}`);
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

  // Smart auto-suggest rules when admin types car model name
  const handleNameChange = (val) => {
    const lower = val.toLowerCase();
    let autoBrand = formData.brand;
    let autoCategory = formData.category;
    let autoSeats = formData.seats;
    let autoExtraKm = formData.extraKmRate;
    let autoExtraTime = formData.extraTimeRate;
    let autoPrice = formData.pricePerDay;

    if (lower.includes('thar')) {
      autoBrand = 'Mahindra';
      autoCategory = 'suv';
      autoSeats = 4;
      autoExtraKm = 7;
      autoExtraTime = 300;
      autoPrice = 5000;
    } else if (lower.includes('ertiga')) {
      autoBrand = 'Maruti';
      autoCategory = 'muv';
      autoSeats = 7;
      autoExtraKm = 7;
      autoExtraTime = 200;
      autoPrice = lower.includes('automatic') || lower.includes('at') ? 3000 : 2500;
    } else if (lower.includes('swift')) {
      autoBrand = 'Maruti';
      autoCategory = 'hatchback';
      autoSeats = 5;
      autoExtraKm = 6;
      autoExtraTime = 200;
      autoPrice = 2300;
    } else if (lower.includes('i20')) {
      autoBrand = 'Hyundai';
      autoCategory = 'hatchback';
      autoSeats = 5;
      autoExtraKm = 6;
      autoExtraTime = 200;
      autoPrice = 2300;
    } else if (lower.includes('dzire')) {
      autoBrand = 'Maruti';
      autoCategory = 'sedan';
      autoSeats = 5;
      autoExtraKm = 6;
      autoExtraTime = 200;
      autoPrice = 2500;
    } else if (lower.includes('punch')) {
      autoBrand = 'Tata';
      autoCategory = 'suv';
      autoSeats = 5;
      autoExtraKm = 6;
      autoExtraTime = 200;
      autoPrice = 2500;
    } else if (lower.includes('venue')) {
      autoBrand = 'Hyundai';
      autoCategory = 'suv';
      autoSeats = 5;
      autoExtraKm = 6;
      autoExtraTime = 200;
      autoPrice = 3000;
    } else if (lower.includes('baleno')) {
      autoBrand = 'Maruti';
      autoCategory = 'hatchback';
      autoSeats = 5;
      autoExtraKm = 6;
      autoExtraTime = 200;
      autoPrice = 2300;
    }

    setFormData(prev => ({
      ...prev,
      name: val,
      brand: autoBrand,
      category: autoCategory,
      seats: autoSeats,
      extraKmRate: autoExtraKm,
      extraTimeRate: autoExtraTime,
      pricePerDay: autoPrice,
    }));
  };

  const handleDelete = async (carId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteCar(tenantId, carId);
      toast.success('Car removed from fleet');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete car');
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
    setSubmitting(true);

    const imageUrls = formData.imagesText
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean);

    const seatsNum = Number(formData.seats);

    const carDataPayload = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      images: imageUrls.length > 0 ? imageUrls : [initialFormState.imagesText],
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      seats: seatsNum,
      pricePerHour: Number(formData.pricePerHour),
      pricePerDay: Number(formData.pricePerDay),
      extraKmRate: Number(formData.extraKmRate) || (seatsNum === 7 ? 7 : 6),
      extraTimeRate: Number(formData.extraTimeRate) || 200,
      securityDeposit: Number(formData.securityDeposit),
      features: formData.features,
      citiesAvailable: formData.citiesAvailable,
      isActive: Boolean(formData.isActive),
      isPopular: Boolean(formData.isPopular),
      rating: Number(formData.rating) || 4.8,
      description: formData.description,
      registrationNo: formData.registrationNo?.trim() || '',
      fastagId: formData.fastagId?.trim() || '',
      odometer: Number(formData.odometer) || 0,
      operationalStatus: formData.operationalStatus || 'available',
      insuranceExpiry: formData.insuranceExpiry || '',
      pucExpiry: formData.pucExpiry || '',
      nextServiceKm: Number(formData.nextServiceKm) || 0,
    };

    try {
      if (editingCar) {
        await updateCar(tenantId, editingCar.id, carDataPayload, user?.uid);
        toast.success('Car updated successfully');
      } else {
        await addCar(tenantId, carDataPayload, user?.uid);
        toast.success('New car added to fleet');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save car');
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
      toast.success(`Removed ${count} cars from database`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear cars');
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
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>7-Seaters</span>
              <strong style={{ fontSize: 18, color: '#2563EB', display: 'block', lineHeight: 1.1 }}>{cars.filter(c => c.seats === 7).length}</strong>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers size={18} />
            </div>
          </div>
        </div>

        {/* Business Rate Rule Summary */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.05) 0%, #FFFFFF 100%)',
          border: '1px solid rgba(255, 69, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiZap style={{ color: '#FF4500', flexShrink: 0 }} />
            <span>
              Business Rate Rules: <strong>₹7/km</strong> (7 Seater) • <strong>₹6/km</strong> (5 Seater) | Overtime: <strong>₹200/hr</strong> (Swift/Standard) • <strong>₹300/hr</strong> (Thar 4x4)
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card" style={{ padding: 10, background: '#FFFFFF' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search by vehicle model, brand, category..."
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
              <div className="empty-state-title" style={{ marginTop: 12 }}>No vehicles in fleet</div>
              <p style={{ fontSize: 13, color: '#64748B', margin: '8px 0 16px' }}>
                Click below to add your first vehicle using the dynamic admin form.
              </p>
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm" style={{ background: '#FF4500', borderColor: '#FF4500' }}>
                + Add New Vehicle
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Category</th>
                    <th>Transmission / Fuel</th>
                    <th>Seating</th>
                    <th>Daily Rate</th>
                    <th>Extra KM</th>
                    <th>Extra Time</th>
                    <th>Popular Choice</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map((c) => {
                    const extraKm = c.extraKmRate || (c.seats === 7 ? 7 : 6);
                    const extraTime = c.extraTimeRate || (c.name?.toLowerCase().includes('thar') ? 300 : 200);
                    return (
                      <tr key={c.id}>
                        <td>
                          <div
                            onClick={() => handleOpenView(c)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                            title="Click to view full specs & rates"
                          >
                            <img
                              src={c.images?.[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'}
                              alt=""
                              style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                            />
                            <div>
                              <strong style={{ color: '#0F172A', display: 'block', fontSize: 13, lineHeight: 1.2 }}>{c.name}</strong>
                              <span style={{ fontSize: 10.5, color: '#64748B' }}>{c.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${c.category === 'suv' || c.category === 'muv' ? 'badge-warning' : c.category === 'premium' ? 'badge-success' : 'badge-accent'}`} style={{ fontSize: 10.5, padding: '2px 6px' }}>
                            {c.category ? c.category.toUpperCase() : 'CAR'}
                          </span>
                        </td>
                        <td>
                          <span style={{ textTransform: 'capitalize', fontSize: 12, color: '#334155' }}>{c.transmission} • {c.fuelType}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{c.seats || 5} Seats</span>
                        </td>
                        <td>
                          <strong style={{ color: '#FF4500', fontSize: 13.5 }}>{formatCurrency(c.pricePerDay)}/d</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FF4500', background: 'rgba(255, 69, 0,0.06)', padding: '2px 6px', borderRadius: 99 }}>
                            ₹{extraKm}/km
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1E293B', background: '#F1F5F9', padding: '2px 6px', borderRadius: 99 }}>
                            ₹{extraTime}/hr
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
                src={viewingCar.images?.[0] || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'}
                alt={viewingCar.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                <span className="badge badge-accent" style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  {viewingCar.category || 'CAR'}
                </span>
                {viewingCar.isPopular !== false && (
                  <span className="badge badge-warning" style={{ background: '#FF4500', color: '#FFFFFF', fontWeight: 800 }}>
                    ⭐ Most Popular
                  </span>
                )}
              </div>
            </div>

            {/* Title & Brand */}
            <div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                {viewingCar.brand} • {viewingCar.transmission} • {viewingCar.fuelType}
              </span>
              <h2 style={{ fontSize: 20, color: '#0F172A', fontWeight: 900, margin: '2px 0 0' }}>{viewingCar.name}</h2>
            </div>

            {/* Pricing Rate Grid */}
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Daily Tariff Rate</span>
                <strong style={{ fontSize: 16, color: '#FF4500', display: 'block' }}>{formatCurrency(viewingCar.pricePerDay)}/day</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Extra KM Rate</span>
                <strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>₹{viewingCar.extraKmRate || (viewingCar.seats === 7 ? 7 : 6)}/km</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Extra Hour Charges</span>
                <strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>₹{viewingCar.extraTimeRate || (viewingCar.name?.toLowerCase().includes('thar') ? 300 : 200)}/hr</strong>
              </div>
              <div>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Security Deposit</span>
                <strong style={{ fontSize: 14, color: '#16A34A', display: 'block' }}>{formatCurrency(viewingCar.securityDeposit || 2000)}</strong>
              </div>
            </div>

            {/* Specifications Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 10, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Seating Capacity</span>
                <strong style={{ fontSize: 13, color: '#0F172A' }}>{viewingCar.seats || 5} Seats</strong>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Status</span>
                <strong style={{ fontSize: 13, color: viewingCar.isActive !== false ? '#16A34A' : '#FF5500' }}>
                  {viewingCar.isActive !== false ? '✅ Active in Fleet' : '🔴 Inactive'}
                </strong>
              </div>
            </div>

            {/* Description */}
            {viewingCar.description && (
              <div style={{ padding: 10, borderRadius: 8, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Vehicle Notes</span>
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
                <FiEdit2 size={13} /> Edit Vehicle Data
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

      {/* Dynamic Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCar ? `Edit Vehicle — ${editingCar.name}` : 'Add New Vehicle to Dynamic Fleet'}
        maxWidth={700}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Quick Vehicle Preset Shortcuts */}
          {!editingCar && (
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: 12,
            }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <FiZap style={{ color: '#FF4500' }} /> Quick Fill Preset Templates:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CLIENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#1E293B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{preset.name} ({formatCurrency(preset.pricePerDay)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Header info notice */}
          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(255, 69, 0, 0.05)',
            border: '1px solid rgba(255, 69, 0, 0.15)',
            fontSize: 11.5,
            color: '#111318',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <FiInfo size={14} style={{ color: '#FF4500', flexShrink: 0 }} />
            <span>
              Auto-Logic: Typing "Thar" sets ₹300/hr extra time; "Ertiga" or 7-Seater sets ₹7/km extra km.
            </span>
          </div>

          <div className="grid-2" style={{ gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Car Model Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Maruti Suzuki Swift ZXi"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Maruti / Mahindra / Hyundai"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-4" style={{ gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="hatchback">Hatchback (Swift, i20, Baleno)</option>
                <option value="sedan">Sedan & CNG (Dzire)</option>
                <option value="suv">SUV & 4x4 (Thar, Punch, Venue)</option>
                <option value="muv">7-Seater MUV (Ertiga)</option>
                <option value="premium">Luxury & Executive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select
                className="form-select"
                value={formData.transmission}
                onChange={e => setFormData({ ...formData, transmission: e.target.value })}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                value={formData.fuelType}
                onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Seating Capacity</label>
              <select
                className="form-select"
                value={formData.seats}
                onChange={e => {
                  const s = Number(e.target.value);
                  setFormData({
                    ...formData,
                    seats: s,
                    extraKmRate: s === 7 ? 7 : 6,
                  });
                }}
              >
                <option value={4}>4 Seater</option>
                <option value={5}>5 Seater</option>
                <option value={6}>6 Seater</option>
                <option value={7}>7 Seater</option>
              </select>
            </div>
          </div>

          <div className="grid-3" style={{ gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Daily Price (₹) *</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="2300"
                value={formData.pricePerDay}
                onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Extra KM Rate (₹/km) *</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="6"
                value={formData.extraKmRate}
                onChange={e => setFormData({ ...formData, extraKmRate: e.target.value })}
              />
              <span style={{ fontSize: 10, color: '#64748B' }}>5-seater = ₹6 | 7-seater = ₹7</span>
            </div>

            <div className="form-group">
              <label className="form-label">Extra Time Rate (₹/hr) *</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="200"
                value={formData.extraTimeRate}
                onChange={e => setFormData({ ...formData, extraTimeRate: e.target.value })}
              />
              <span style={{ fontSize: 10, color: '#64748B' }}>Swift = ₹200 | Thar = ₹300</span>
            </div>
          </div>

          <div className="grid-3" style={{ gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Refundable Deposit (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="2000"
                value={formData.securityDeposit}
                onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fleet Visibility</label>
              <select
                className="form-select"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active (Visible on Website)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Popular Showcase</label>
              <select
                className="form-select"
                value={formData.isPopular ? 'popular' : 'standard'}
                onChange={e => setFormData({ ...formData, isPopular: e.target.value === 'popular' })}
              >
                <option value="popular">Mark as Popular Choice</option>
                <option value="standard">Standard Fleet Listing</option>
              </select>
            </div>
          </div>

          {/* Fleet Operations & Maintenance Info */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              🚙 Operational Fleet Details & Maintenance Tracking
            </span>
            <div className="grid-3" style={{ gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Registration No. Plate</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MH 12 AB 1234"
                  value={formData.registrationNo}
                  onChange={e => setFormData({ ...formData, registrationNo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Operational Status</label>
                <select
                  className="form-select"
                  value={formData.operationalStatus}
                  onChange={e => setFormData({ ...formData, operationalStatus: e.target.value })}
                >
                  <option value="available">🟢 Available for Rent</option>
                  <option value="rented">🟡 Currently Rented / Out</option>
                  <option value="maintenance">🛠️ Under Maintenance / Service</option>
                  <option value="out_of_service">🔴 Out of Service</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Odometer Reading (KM)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 35400"
                  value={formData.odometer}
                  onChange={e => setFormData({ ...formData, odometer: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3" style={{ gap: 10, marginTop: 10 }}>
              <div className="form-group">
                <label className="form-label">Fastag Serial ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FT-98765432"
                  value={formData.fastagId}
                  onChange={e => setFormData({ ...formData, fastagId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Insurance Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.insuranceExpiry}
                  onChange={e => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">PUC Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.pucExpiry}
                  onChange={e => setFormData({ ...formData, pucExpiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Device Image File Upload + Image URL Section */}
          <div className="form-group" style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiImage style={{ color: '#FF4500' }} /> Vehicle Photos (Upload from Device or Paste Image Links)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                id="car-photo-upload-input"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <label
                htmlFor="car-photo-upload-input"
                className="btn btn-secondary btn-sm"
                style={{
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: '5px 12px',
                  background: '#FFFFFF',
                  color: '#FF4500',
                  borderColor: '#FF4500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FiUpload size={14} /> Upload Photos from Device
              </label>
            </div>

            {/* Thumbnail Previews Grid */}
            {imageList.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {imageList.map((imgUrl, index) => (
                  <div key={index} style={{ position: 'relative', width: 64, height: 48, borderRadius: 6, overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                    <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'rgba(255, 69, 0, 0.9)',
                        color: '#FFFFFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                      title="Remove image"
                    >
                      <FiX size={12} />
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
              style={{ fontSize: 12 }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full"
            style={{ background: '#FF4500', borderColor: '#FF4500', marginTop: 4 }}
          >
            {submitting ? 'Saving to Firestore...' : editingCar ? 'Update Vehicle Listing' : 'Save & Add Vehicle to Live Fleet'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
