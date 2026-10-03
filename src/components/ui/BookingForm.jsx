import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import { FiSend, FiCheckCircle, FiMapPin, FiTruck, FiKey } from 'react-icons/fi';
import { BsCarFront, BsWhatsapp, BsInstagram } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { addInquiry } from '../../firebase/firestore';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import TermsAndConditions from './TermsAndConditions';

export default function BookingForm({ car, onSuccess }) {
  const { tenantId } = useTenant();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [selectedCarName, setSelectedCarName] = useState('Maruti Suzuki Swift');

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    city: car?.citiesAvailable?.[0] || 'Pune',
    pickupDate: new Date(Date.now() + 86400000),
    returnDate: new Date(Date.now() + 86400000 * 3),
    pickupType: 'delivery',
    message: '',
  });

  const cities = ['Pune', 'Mumbai', 'Pimpri-Chinchwad', 'Lonavala', 'Outstation'];

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.returnDate) return 1;
    const diff = formData.returnDate.getTime() - formData.pickupDate.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 1;
  };

  const daysCount = calculateDays();
  const estimatedPrice = car ? (car.pricePerDay || 2300) * daysCount : 0;

  const auth = useAuth();
  const user = auth?.user || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.phone.trim()) {
      toast.error('Please fill in required contact details');
      return;
    }

    setSubmitting(true);
    try {
      await addInquiry(tenantId, {
        carId: car?.id || null,
        carName: car?.name || selectedCarName || 'General Inquiry',
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email || 'N/A',
        city: formData.city,
        pickupDate: formData.pickupDate.toISOString(),
        returnDate: formData.returnDate.toISOString(),
        pickupType: formData.pickupType,
        message: formData.message,
        estimatedPrice,
        daysCount,
      }, user?.uid || 'guest');

      setSubmitted(true);
      toast.success('Rental Inquiry submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(22,163,74,0.1)',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FiCheckCircle size={24} />
        </div>

        <h3 style={{ fontSize: 18, margin: 0, color: '#0F172A', fontWeight: 900 }}>Inquiry Received!</h3>
        <p style={{ fontSize: 12.5, color: '#64748B', maxWidth: 360, margin: 0, lineHeight: 1.5 }}>
          Thank you! Our representative will confirm vehicle availability and doorstep delivery within 15 minutes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', marginTop: 8 }}>
          <a
            href={`https://wa.me/918485877633?text=Hi%20Jay%20Kedar%20Car%20Rental%2C%20I%20just%20submitted%20a%20booking%20inquiry%20for%20${encodeURIComponent(car?.name || selectedCarName)}%20(${daysCount}%20Days%2C%20Est%20₹${estimatedPrice}).%20Name%3A%20${encodeURIComponent(formData.customerName)}.`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)',
              color: '#FFFFFF',
              padding: '9px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <BsWhatsapp size={14} /> Instant WhatsApp
          </a>

          <a
            href={`https://ig.me/m/founder_abhishek?text=Hi%20VK%20SELF%20DRIVE%20CAR%27S%20PUNE%2C%20I%20just%20submitted%20a%20booking%20inquiry%20for%20${encodeURIComponent(car?.name || selectedCarName)}%20(${daysCount}%20Days%2C%20Est%20₹${estimatedPrice}).%20Name%3A%20${encodeURIComponent(formData.customerName)}.`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              color: '#FFFFFF',
              padding: '9px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <BsInstagram size={14} /> Instant Instagram
          </a>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <a
            href="/my-inquiries"
            className="btn btn-primary btn-sm"
            style={{ padding: '6px 14px', fontSize: 12, background: '#FF4500', borderColor: '#FF4500', fontWeight: 800 }}
          >
            Track Status ➔
          </a>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            New Request
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Selected Vehicle Banner / Selector */}
      {!car ? (
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Select Vehicle Model *</label>
          <select
            className="form-select"
            value={selectedCarName}
            onChange={e => setSelectedCarName(e.target.value)}
            style={{ fontWeight: 800, height: 38, fontSize: 13 }}
          >
            <option value="Maruti Suzuki Swift">Maruti Suzuki Swift — ₹2,300/day</option>
            <option value="Mahindra Thar 4x4">Mahindra Thar 4x4 — ₹5,000/day</option>
            <option value="Maruti Suzuki Ertiga 7-Seater">Maruti Suzuki Ertiga 7-Seater — ₹2,500/day</option>
            <option value="Hyundai i20">Hyundai i20 — ₹2,300/day</option>
            <option value="Maruti Suzuki Dzire CNG">Maruti Suzuki Dzire CNG — ₹2,500/day</option>
            <option value="Tata Punch SUV">Tata Punch SUV — ₹2,500/day</option>
            <option value="Hyundai Venue">Hyundai Venue — ₹3,000/day</option>
            <option value="Maruti Suzuki Baleno">Maruti Suzuki Baleno — ₹2,300/day</option>
          </select>
        </div>
      ) : (
        <div style={{
          padding: '8px 12px',
          borderRadius: 10,
          background: 'rgba(255, 69, 0, 0.05)',
          border: '1px solid rgba(255, 69, 0, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: 10, color: '#FF4500', fontWeight: 800, textTransform: 'uppercase' }}>
              Selected Car
            </span>
            <h4 style={{ fontSize: 14, margin: 0, color: '#0F172A', fontWeight: 800 }}>{car.name}</h4>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, color: '#64748B', display: 'block' }}>Est. Total ({daysCount}d)</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#FF4500' }}>
              {formatCurrency(estimatedPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Row 1: Contact Details */}
      <div className="grid-3" style={{ gap: 10 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Full Name *</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Amit Patil"
            value={formData.customerName}
            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
            style={{ height: 36, fontSize: 12.5 }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Mobile Number (+91) *</label>
          <input
            type="tel"
            required
            className="form-input"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            style={{ height: 36, fontSize: 12.5 }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>City / Location</label>
          <select
            className="form-select"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            style={{ height: 36, fontSize: 12.5 }}
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Trip Dates & Delivery Option */}
      <div className="grid-3" style={{ gap: 10 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Pickup Date & Time</label>
          <DatePicker
            selected={formData.pickupDate}
            onChange={date => setFormData({ ...formData, pickupDate: date })}
            showTimeSelect
            dateFormat="MMM d, h:mm aa"
            minDate={new Date()}
            className="form-input"
            style={{ height: 36, fontSize: 12.5 }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Return Date & Time</label>
          <DatePicker
            selected={formData.returnDate}
            onChange={date => setFormData({ ...formData, returnDate: date })}
            showTimeSelect
            dateFormat="MMM d, h:mm aa"
            minDate={formData.pickupDate || new Date()}
            className="form-input"
            style={{ height: 36, fontSize: 12.5 }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Delivery Preference</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, height: 36 }}>
            <button
              type="button"
              className={`btn ${formData.pickupType === 'delivery' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFormData({ ...formData, pickupType: 'delivery' })}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '0 6px',
                justifyContent: 'center',
                background: formData.pickupType === 'delivery' ? 'linear-gradient(135deg, #FF4500 0%, #E66E00 100%)' : '#FFFFFF',
                borderColor: formData.pickupType === 'delivery' ? '#FF4500' : '#CBD5E1',
              }}
            >
              <FiTruck size={12} /> Doorstep
            </button>
            <button
              type="button"
              className={`btn ${formData.pickupType === 'self-pickup' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFormData({ ...formData, pickupType: 'self-pickup' })}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '0 6px',
                justifyContent: 'center',
                background: formData.pickupType === 'self-pickup' ? 'linear-gradient(135deg, #FF4500 0%, #E66E00 100%)' : '#FFFFFF',
                borderColor: formData.pickupType === 'self-pickup' ? '#FF4500' : '#CBD5E1',
              }}
            >
              <BsCarFront size={12} /> Hub Pickup
            </button>
          </div>
        </div>
      </div>



      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !agreedToTerms}
        className="btn btn-primary btn-lg w-full"
        style={{
          background: '#FF4500',
          borderColor: '#FF4500',
          fontSize: 13.5,
          fontWeight: 800,
          padding: '9px',
          opacity: agreedToTerms ? 1 : 0.65,
          marginTop: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {submitting ? 'Submitting...' : <><FiSend size={14} /> Submit Rental Inquiry</>}
      </button>
    </form>
  );
}
