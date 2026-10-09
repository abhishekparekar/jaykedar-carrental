import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiSettings,
  FiZap,
  FiCheckCircle,
  FiShield,
  FiArrowLeft,
  FiShare2,
  FiCalendar,
  FiClock,
  FiTruck,
  FiKey,
} from 'react-icons/fi';
import { BsFuelPump, BsStarFill, BsLuggage, BsWhatsapp, BsInstagram } from 'react-icons/bs';
import toast from 'react-hot-toast';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingForm from '../../components/ui/BookingForm';
import RevvCarCard from '../../components/ui/RevvCarCard';
import CarSkeleton from '../../components/ui/CarSkeleton';
import Modal from '../../components/ui/Modal';

import { useTenant } from '../../contexts/TenantContext';
import { getCar, getCars } from '../../firebase/firestore';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CarDetailPage() {
  const { carId } = useParams();
  const { tenantId, settings } = useTenant();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCar(tenantId, carId)
      .then((data) => {
        setCar(data);
        if (data) {
          getCars(tenantId).then((all) => {
            const filtered = all.filter((c) => c.id !== carId && c.category === data.category);
            setSimilarCars(filtered.slice(0, 3));
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching car:', err);
        toast.error('Failed to load car details');
      })
      .finally(() => setLoading(false));
  }, [tenantId, carId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
        <Navbar />
        <main style={{ paddingTop: 90, flex: 1 }} className="container">
          <CarSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
        <Navbar />
        <main style={{ paddingTop: 120, flex: 1, textAlign: 'center' }} className="container">
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#000000' }}>Car Not Found</h2>
          <p style={{ color: '#475569', marginBottom: 20, fontWeight: 600 }}>
            The requested car listing does not exist or has been removed.
          </p>
          <Link to="/fleet" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 99 }}>
            Browse All Fleet
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = car.images && car.images.length > 0
    ? car.images
    : ['/force-traveller.jpg'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />

      <main style={{ paddingTop: 'clamp(72px, 9vw, 88px)', paddingBottom: 40, flex: 1 }}>
        <div className="container">
          {/* Back button */}
          <Link
            to="/fleet"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 800,
              color: '#FF4500',
              textDecoration: 'none',
              marginBottom: 18,
              background: 'rgba(255, 69, 0, 0.08)',
              padding: '7px 16px',
              borderRadius: 99,
              border: '1px solid rgba(255, 69, 0, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <FiArrowLeft size={14} /> Back to Fleet
          </Link>

          <div className="car-detail-layout">
            {/* Left Column: Gallery & Vehicle Specs */}
            <div style={{ minWidth: 0 }}>
              {/* Photo Gallery Card */}
              <div style={{
                padding: 8,
                overflow: 'hidden',
                marginBottom: 22,
                background: '#FFFFFF',
                borderRadius: 18,
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
              }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#F1F5F9',
                    marginBottom: 8,
                  }}
                  className="car-gallery-main"
                >
                  <img
                    src={images[selectedImageIndex]}
                    alt={car.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  />
                  <button
                    className="btn-icon"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard');
                    }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Share"
                  >
                    <FiShare2 size={16} color="#000000" />
                  </button>
                </div>

                {/* Gallery Thumbnails */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        style={{
                          width: 72,
                          height: 52,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: selectedImageIndex === idx ? '2.5px solid #FF4500' : '2px solid #E2E8F0',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Status Badges */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className="badge badge-accent" style={{ background: '#FF4500', color: '#FFFFFF', fontWeight: 900, fontSize: 11.5, padding: '4px 12px', borderRadius: 99 }}>
                    🚐 {car.busModel || 'Force Traveller'}
                  </span>
                  <span className="badge" style={{ background: '#0F172A', color: '#FFFFFF', fontWeight: 800, fontSize: 11, padding: '4px 10px', borderRadius: 99 }}>
                    {(car.category || 'BUS').toUpperCase()}
                  </span>
                  {car.rating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: 11.5, fontWeight: 900, background: '#FEF3C7', padding: '3px 10px', borderRadius: 99 }}>
                      <BsStarFill size={11} /> {car.rating} Rating
                    </span>
                  )}
                  <span style={{ fontSize: 11.5, color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 900, background: '#DCFCE7', padding: '3px 10px', borderRadius: 99 }}>
                    <FiCheckCircle size={12} /> Available Now
                  </span>
                </div>
                
                <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', margin: '0 0 8px', color: '#000000', fontWeight: 900, lineHeight: 1.2 }}>
                  {car.name}
                </h1>
                <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                  {car.description || 'Premium clean travels and tour package service with experienced driver, AC seating, and punctual service.'}
                </p>
              </div>

              {/* Specifications Card */}
              <div style={{
                padding: '18px 20px',
                marginBottom: 22,
                background: '#FFFFFF',
                borderRadius: 18,
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 6px 24px rgba(15, 23, 42, 0.05)',
              }}>
                <h3 style={{ fontSize: 15, marginBottom: 14, color: '#000000', fontWeight: 900 }}>
                  Fleet & Tour Specifications
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 900 }}>Seating (Shita)</span>
                    <strong style={{ fontSize: 13, color: '#000000', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontWeight: 900 }}>
                      <FiUsers style={{ color: '#FF4500', flexShrink: 0 }} size={13} /> {car.seats || 17} Seats
                    </strong>
                  </div>

                  <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 900 }}>AC Type</span>
                    <strong style={{ fontSize: 13, color: '#000000', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontWeight: 900 }}>
                      <FiCheckCircle style={{ color: '#FF4500', flexShrink: 0 }} size={13} /> {car.acType === 'non_ac' ? 'Non-AC' : car.acType === 'both' ? 'AC / Non-AC' : 'AC'}
                    </strong>
                  </div>

                  <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 900 }}>Rate Per KM</span>
                    <strong style={{ fontSize: 13, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontWeight: 900 }}>
                      ₹{car.perKmRate || car.extraKmRate || 25} / km
                    </strong>
                  </div>

                  <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 900 }}>Included KM</span>
                    <strong style={{ fontSize: 13, color: '#000000', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontWeight: 900 }}>
                      {car.includedKm || 'Custom Trip'}
                    </strong>
                  </div>

                  <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', textTransform: 'uppercase', fontWeight: 900 }}>Extra KM Rate</span>
                    <strong style={{ fontSize: 13, color: '#D97706', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontWeight: 900 }}>
                      ₹{car.extraKmRate || car.perKmRate || 25} / km
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pricing Tariff Card */}
              <div style={{
                padding: '18px 20px',
                marginBottom: 22,
                background: '#FFFFFF',
                borderRadius: 18,
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 6px 24px rgba(15, 23, 42, 0.05)',
              }}>
                <h3 style={{ fontSize: 15, marginBottom: 14, color: '#000000', fontWeight: 900 }}>Tour Package Tariff & Rates</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.09) 0%, #FFFFFF 100%)', border: '1px solid rgba(255, 69, 0, 0.28)' }}>
                    <span style={{ fontSize: 11, color: '#FF4500', fontWeight: 900 }}>Package / Base Rate</span>
                    <h4 style={{ fontSize: 18, margin: '3px 0 0', color: '#FF4500', fontWeight: 900 }}>{formatCurrency(car.pricePerDay || 0)}</h4>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#000000', fontWeight: 800, opacity: 0.8 }}>Distance Rate</span>
                    <h4 style={{ fontSize: 16, margin: '3px 0 0', color: '#16A34A', fontWeight: 900 }}>
                      ₹{car.perKmRate || car.extraKmRate || 25} / km
                    </h4>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#000000', fontWeight: 800, opacity: 0.8 }}>Included KM Limit</span>
                    <h4 style={{ fontSize: 16, margin: '3px 0 0', color: '#000000', fontWeight: 900 }}>
                      {car.includedKm || 'As quoted'}
                    </h4>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: 11, color: '#000000', fontWeight: 800, opacity: 0.8 }}>Extra KM Charge</span>
                    <h4 style={{ fontSize: 16, margin: '3px 0 0', color: '#D97706', fontWeight: 900 }}>
                      ₹{car.extraKmRate || car.perKmRate || 25} / km
                    </h4>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column: Sticky Booking Card */}
            <aside className="car-detail-sidebar">
              <div style={{
                padding: 20,
                background: '#FFFFFF',
                borderRadius: 18,
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}>
                <div>
                  <span style={{ fontSize: 11, color: '#000000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.7 }}>
                    Package / Base Rate
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#FF4500', lineHeight: 1 }}>
                      {formatCurrency(car.pricePerDay || 0)}
                    </span>
                    <span style={{ fontSize: 13, color: '#000000', fontWeight: 700, opacity: 0.8 }}>
                      {car.includedKm ? `(${car.includedKm})` : ''}
                    </span>
                  </div>
                </div>

                {/* Key Benefits List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#000000', fontWeight: 800 }}>
                    <FiUsers style={{ color: '#FF4500', flexShrink: 0 }} size={15} />
                    <span>{car.seats || 17} Passenger Seating ({car.acType === 'non_ac' ? 'Non-AC' : 'AC'})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#000000', fontWeight: 800 }}>
                    <FiCheckCircle style={{ color: '#FF4500', flexShrink: 0 }} size={15} />
                    <span>Experienced Tour & Outstation Driver</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#000000', fontWeight: 800 }}>
                    <FiShield style={{ color: '#FF4500', flexShrink: 0 }} size={15} />
                    <span>Punctual Service & Clean Interiors</span>
                  </div>
                </div>

                {/* Book / Inquire Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    fontSize: 14.5,
                    fontWeight: 900,
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #FF4500 0%, #E63900 100%)',
                    boxShadow: '0 6px 20px rgba(255, 69, 0, 0.40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    color: '#FFFFFF',
                  }}
                >
                  <FiCalendar size={16} /> Book / Inquire Vehicle
                </button>

                {/* 1-Click WhatsApp & Instagram Direct Inquiry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  <a
                    href={`https://wa.me/918485877633?text=Hi%20Jay%20Kedar%20Car%20Rental%2C%20I%20want%20to%20inquire%20about%20renting%20${encodeURIComponent(car.name)}%20(${encodeURIComponent(car.category || 'Self-Drive')})%20for%20${encodeURIComponent(formatCurrency(car.pricePerDay))}/day.%20Please%20confirm%20availability.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #1EAA52 100%)',
                      color: '#FFFFFF',
                      padding: '10px 8px',
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                    }}
                  >
                    <BsWhatsapp size={15} /> WhatsApp
                  </a>

                  <a
                    href={`https://ig.me/m/founder_abhishek?text=Hi%20${encodeURIComponent(settings?.businessName || 'Jay Kedar Car Rental')}%2C%20I%20want%20to%20inquire%20about%20renting%20${encodeURIComponent(car.name)}%20(${encodeURIComponent(car.category || 'Self-Drive')})%20for%20${encodeURIComponent(formatCurrency(car.pricePerDay))}/day.%20Please%20confirm%20availability.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      color: '#FFFFFF',
                      padding: '10px 8px',
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(220, 39, 67, 0.25)',
                    }}
                  >
                    <BsInstagram size={15} /> Instagram
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Similar Vehicles Grid */}
          {similarCars.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <h2 style={{ fontSize: 20, marginBottom: 16, color: '#000000', fontWeight: 900 }}>Similar Vehicles</h2>
              <div className="grid-3">
                {similarCars.map((sCar) => (
                  <RevvCarCard key={sCar.id} car={sCar} onEnquire={(c) => navigate(`/cars/${c.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Book ${car.name}`}
      >
        <BookingForm
          car={car}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      <Footer />

      <style>{`
        .car-detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 24px;
        }
        .car-detail-sidebar {
          align-self: start;
          position: sticky;
          top: 90px;
        }
        .car-gallery-main {
          height: 400px;
        }
        @media (max-width: 1100px) {
          .car-detail-layout {
            grid-template-columns: minmax(0, 1fr) 290px;
            gap: 18px;
          }
          .car-gallery-main {
            height: 330px;
          }
        }
        @media (max-width: 900px) {
          .car-detail-layout {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .car-detail-sidebar {
            position: static !important;
          }
          .car-gallery-main {
            height: 270px;
          }
        }
        @media (max-width: 640px) {
          .car-gallery-main {
            height: 230px;
          }
        }
        @media (max-width: 400px) {
          .car-gallery-main {
            height: 195px;
          }
        }
      `}</style>
    </div>
  );
}
