import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSave, FiPhone, FiMail, FiMapPin, FiGlobe, FiCheckCircle,
  FiShare2, FiStar, FiPlus, FiTrash2, FiMessageSquare, FiBookOpen, FiActivity,
} from 'react-icons/fi';
import { BsWhatsapp, BsFacebook, BsInstagram, BsTwitterX, BsYoutube, BsStarFill } from 'react-icons/bs';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToReviews, addReview, deleteReview } from '../../firebase/firestore';

export default function AdminSettings() {
  const { tenantId, settings, updateSettings } = useTenant();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [addingReview, setAddingReview] = useState(false);

  // Business & About page settings state
  const [form, setForm] = useState({
    businessName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    // About Page Fields
    aboutTitle: '',
    aboutSubtitle: '',
    aboutMissionHeading: '',
    aboutMissionText: '',
    aboutStoryText: '',
    statsRenters: '',
    statsFleet: '',
    statsDelivery: '',
    statsRating: '',
  });

  // Reviews state
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    location: 'Pune',
    carName: 'Mahindra Thar 4x4',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        businessName: settings.businessName || "Jay Kedar Car Rental",
        tagline: settings.tagline || 'Premium self-drive car rentals with 300 km daily limit, doorstep delivery & verified fleet.',
        phone: settings.phone || '+91 8485877633',
        email: settings.email || 'abhiparekar58@gmail.com',
        address: settings.address || 'Pimpri-Chinchwad & Pune City, Maharashtra',
        whatsapp: settings.whatsapp || '918485877633',
        businessHours: settings.businessHours || '24 Hours • 365 Days Doorstep Delivery',
        facebook: settings.facebook || 'https://facebook.com',
        instagram: settings.instagram || 'https://instagram.com',
        twitter: settings.twitter || 'https://twitter.com',
        youtube: settings.youtube || 'https://youtube.com',
        // About Page Defaults
        aboutTitle: settings.aboutTitle || 'Reinventing Jay Kedar Car Rental',
        aboutSubtitle: settings.aboutSubtitle || 'Driven by 100% transparency, verified cars, 300 km daily limit, and 30-minute doorstep delivery in Pune.',
        aboutMissionHeading: settings.aboutMissionHeading || 'Empowering Renters with Complete Self-Drive Freedom',
        aboutMissionText: settings.aboutMissionText || 'We believe having a car for weekend family trips, business meetings, or hill-station drives should be simple — accessible on demand without ownership hassle.',
        aboutStoryText: settings.aboutStoryText || 'Every vehicle in our fleet is deep-sanitized, digitally verified, and handed over with complete document verification.',
        statsRenters: settings.statsRenters || '500+',
        statsFleet: settings.statsFleet || '50+',
        statsDelivery: settings.statsDelivery || '30 Mins',
        statsRating: settings.statsRating || '4.9/5',
      });
    }
  }, [settings]);

  useEffect(() => {
    const unsub = subscribeToReviews(tenantId, (data) => {
      setReviewsList(data);
    });
    return () => unsub();
  }, [tenantId]);

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form, user?.uid || 'admin');
      toast.success('About Page & Settings updated live!');
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      toast.error('Please fill in customer name and review comment');
      return;
    }

    setAddingReview(true);
    try {
      await addReview(tenantId, {
        name: reviewForm.name,
        location: reviewForm.location,
        carName: reviewForm.carName,
        rating: Number(reviewForm.rating),
        date: 'Just now',
        comment: reviewForm.comment,
        verified: true,
      }, user?.uid || 'admin');

      toast.success('New customer review published live!');
      setReviewForm({
        name: '',
        location: 'Pune',
        carName: 'Mahindra Thar 4x4',
        rating: 5,
        comment: '',
      });
    } catch (err) {
      console.error('Error adding review:', err);
      toast.error('Failed to add review');
    } finally {
      setAddingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await deleteReview(tenantId, reviewId);
      toast.success('Review deleted');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Failed to delete review');
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px 20px', maxWidth: 980, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#FF4500', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Dynamic Content & Settings
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111318', margin: '4px 0 0' }}>
              About Page, Footer & Business Settings
            </h1>
            <p style={{ fontSize: 13, color: '#6B7080', margin: 0 }}>
              Edit About Page content, counter stats, contact numbers, and publish customer reviews live!
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmitSettings}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: 14, fontWeight: 800 }}
          >
            <FiSave size={16} /> {saving ? 'Saving...' : 'Save Settings Live'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <form onSubmit={handleSubmitSettings} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 🏢 1. BUSINESS BRANDING & CONTACT DETAILS */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 22,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FF4500', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPhone /> Live Contact Page & Business Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.businessName}
                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                    placeholder="Jay Kedar Car Rental"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 8485877633"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number (with 91)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.whatsapp}
                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="918485877633"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Support Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="abhiparekar58@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Office Address *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Pimpri-Chinchwad & Pune City, Maharashtra"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Hours *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.businessHours}
                    onChange={e => setForm({ ...form, businessHours: e.target.value })}
                    placeholder="24 Hours • 365 Days Doorstep Delivery"
                  />
                </div>
              </div>
            </div>

            {/* 📖 2. ABOUT PAGE CONTENT MANAGEMENT */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 22,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FF4500', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBookOpen /> About Us Page Content & Headlines
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">About Page Main Headline</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.aboutTitle}
                    onChange={e => setForm({ ...form, aboutTitle: e.target.value })}
                    placeholder="Reinventing Jay Kedar Car Rental"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mission Card Heading</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.aboutMissionHeading}
                    onChange={e => setForm({ ...form, aboutMissionHeading: e.target.value })}
                    placeholder="Empowering Renters with Complete Freedom"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">About Page Subtitle Paragraph</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={form.aboutSubtitle}
                  onChange={e => setForm({ ...form, aboutSubtitle: e.target.value })}
                  placeholder="Driven by 100% transparency, verified cars..."
                />
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Our Mission & Values Paragraph</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={form.aboutMissionText}
                  onChange={e => setForm({ ...form, aboutMissionText: e.target.value })}
                  placeholder="We believe having a car for weekend family trips..."
                />
              </div>
            </div>

            {/* 📊 3. ABOUT PAGE STAT COUNTERS */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 22,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FF4500', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiActivity /> About Page Counter Numbers
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Happy Renters Count</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.statsRenters}
                    onChange={e => setForm({ ...form, statsRenters: e.target.value })}
                    placeholder="500+"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sanitized Fleet Count</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.statsFleet}
                    onChange={e => setForm({ ...form, statsFleet: e.target.value })}
                    placeholder="50+"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Doorstep Delivery Time</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.statsDelivery}
                    onChange={e => setForm({ ...form, statsDelivery: e.target.value })}
                    placeholder="30 Mins"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Rating</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.statsRating}
                    onChange={e => setForm({ ...form, statsRating: e.target.value })}
                    placeholder="4.9/5"
                  />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-lg"
                style={{ padding: '12px 32px', fontSize: 15, fontWeight: 800 }}
              >
                <FiSave size={18} /> {saving ? 'Saving...' : 'Save Settings Live'}
              </button>
            </div>
          </form>

          {/* 💬 4. CUSTOMER REVIEWS MANAGEMENT */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 22,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111318', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiMessageSquare color="#FF4500" /> Add & Manage Customer Reviews
            </h3>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} style={{
              background: '#F8FAFC',
              padding: 16,
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <strong style={{ fontSize: 13, color: '#FF4500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Add New Customer Review
              </strong>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Rahul Deshmukh"
                    value={reviewForm.name}
                    onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pune (Kothrud)"
                    value={reviewForm.location}
                    onChange={e => setReviewForm({ ...reviewForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Car Rented</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mahindra Thar 4x4"
                    value={reviewForm.carName}
                    onChange={e => setReviewForm({ ...reviewForm, carName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <select
                    className="form-select"
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Review Comment *</label>
                <textarea
                  required
                  rows={2}
                  className="form-textarea"
                  placeholder="Booked Thar 4x4 for weekend trip. Clean car and prompt doorstep delivery!"
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="submit"
                  disabled={addingReview}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13, fontWeight: 800 }}
                >
                  <FiPlus size={15} /> {addingReview ? 'Adding...' : 'Publish Review Live'}
                </button>
              </div>
            </form>

            {/* Published Reviews List */}
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#111318', marginBottom: 12 }}>
              Published Customer Reviews ({reviewsList.length})
            </h4>

            {reviewsList.length === 0 ? (
              <p style={{ fontSize: 13, color: '#64748B' }}>No published reviews in database yet. Add one above!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reviewsList.map(rev => (
                  <div
                    key={rev.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 12,
                      padding: '12px 14px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <strong style={{ fontSize: 13, color: '#111318' }}>{rev.name}</strong>
                        <span style={{ fontSize: 11, color: '#64748B' }}>({rev.location})</span>
                        <span style={{ color: '#F59E0B', fontSize: 12 }}>
                          {'★'.repeat(rev.rating || 5)}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>"{rev.comment}"</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'rgba(255, 85, 0, 0.1)',
                        border: '1px solid rgba(255, 85, 0, 0.2)',
                        color: '#FF4500',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
