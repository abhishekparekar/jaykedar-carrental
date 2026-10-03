import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiRefreshCw, FiSearch, FiSliders, FiCheck, FiZap, FiTruck, FiUsers, FiStar, FiCheckCircle } from 'react-icons/fi';
import { BsCarFront, BsCarFrontFill } from 'react-icons/bs';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RevvCarCard from '../../components/ui/RevvCarCard';
import CarSkeleton from '../../components/ui/CarSkeleton';
import Modal from '../../components/ui/Modal';
import BookingForm from '../../components/ui/BookingForm';

import { useTenant } from '../../contexts/TenantContext';
import { subscribeToCars } from '../../firebase/firestore';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Fleet', icon: <BsCarFront size={15} /> },
  { id: 'popular', label: 'Popular Choice', icon: <FiZap size={15} style={{ color: '#FF4500' }} /> },
  { id: 'hatchback', label: 'Hatchback (Swift, i20, Baleno)', icon: <BsCarFront size={15} /> },
  { id: 'sedan', label: 'Sedan & CNG (Dzire)', icon: <BsCarFrontFill size={15} /> },
  { id: 'suv', label: 'SUV & 4x4 (Thar, Punch, Venue)', icon: <FiTruck size={15} /> },
  { id: 'muv', label: '7-Seater MUV (Ertiga)', icon: <BsCarFront size={15} /> },
];

export default function FleetPage() {
  const { tenantId, settings } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    const unsub = subscribeToCars(tenantId, (data) => {
      setCars(data);
      setLoading(false);
    });
    return () => unsub();
  }, [tenantId]);

  useEffect(() => {
    const params = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [selectedCategory]);

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (selectedCategory === 'popular') return car.isPopular !== false;
      if (selectedCategory !== 'all' && car.category !== selectedCategory) return false;
      return true;
    });
  }, [cars, selectedCategory]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />

      <main style={{ paddingTop: 110, paddingBottom: 48, flex: 1 }}>

        <div className="fleet-container" style={{ width: '100%', paddingTop: 28 }}>

          {/* Full-Width Car Cards Grid */}
          <section>
            {loading ? (
              <div className="grid-fleet-catalog">
                <CarSkeleton />
                <CarSkeleton />
                <CarSkeleton />
                <CarSkeleton />
              </div>
            ) : filteredCars.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(255, 69, 0,0.08)',
                  border: '1px solid rgba(255, 69, 0,0.2)',
                  color: '#FF4500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <BsCarFront size={28} />
                </div>
                <h3 style={{ fontSize: 18, color: '#111318', fontWeight: 800, marginBottom: 6 }}>
                  No Cars Found in This Category
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px' }}>
                  Try selecting another category like All Fleet or Popular Choice.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)' }}
                >
                  Show All Cars ➔
                </button>
              </div>
            ) : (
              <div className="grid-fleet-catalog">
                {filteredCars.map(car => (
                  <RevvCarCard
                    key={car.id}
                    car={car}
                    onEnquire={carItem => {
                      setSelectedCar(carItem);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ─── Dynamic Stats Grid BELOW Fleet Catalog ─── */}
          <div style={{ marginTop: 36, marginBottom: 20 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
            }} className="fleet-stats-grid">
              {[
                { label: 'Happy Renters', value: settings?.statsRenters || '500+', icon: <FiUsers size={20} /> },
                { label: 'Sanitized Fleet Cars', value: settings?.statsFleet || '50+', icon: <BsCarFront size={20} /> },
                { label: 'Doorstep Delivery', value: settings?.statsDelivery || '30 Mins', icon: <FiTruck size={20} /> },
                { label: 'Customer Rating', value: settings?.statsRating || '4.9/5', icon: <FiStar size={20} /> },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.35 }}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    padding: '16px 12px',
                    textAlign: 'center',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: 'rgba(255, 69, 0, 0.09)',
                    border: '1px solid rgba(255, 69, 0, 0.22)',
                    color: '#FF4500',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: '#FF4500', fontWeight: 900, margin: 0, lineHeight: 1 }}>
                    {s.value}
                  </h3>
                  <p style={{ fontSize: 11, color: '#64748B', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>



          <style>{`
            .fleet-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto;
              padding: 0 clamp(12px, 2.5vw, 36px) !important;
              box-sizing: border-box;
            }
            .grid-fleet-catalog {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
            }
            .fleet-stats-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
            @media (max-width: 768px) {
              .fleet-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
            }
            @media (max-width: 400px) {
              .fleet-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
            }
            @media (min-width: 1600px) {
              .grid-fleet-catalog {
                grid-template-columns: repeat(5, 1fr);
                gap: 20px;
              }
            }
            @media (max-width: 1200px) {
              .grid-fleet-catalog {
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
              }
            }
            @media (max-width: 768px) {
              .fleet-container {
                padding: 0 14px;
              }
              .grid-fleet-catalog {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
              }
            }
            @media (max-width: 480px) {
              .fleet-container {
                padding: 0 10px;
              }
              .grid-fleet-catalog {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
              }
            }
            @media (max-width: 360px) {
              .grid-fleet-catalog {
                grid-template-columns: 1fr;
                gap: 10px;
              }
            }
          `}</style>
        </div>
      </main>

      {/* Inquiry Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCar ? `Inquire — ${selectedCar.name}` : 'Rental Inquiry'}
      >
        {selectedCar && (
          <BookingForm
            car={selectedCar}
            onSuccess={() => setIsModalOpen(false)}
          />
        )}
      </Modal>

      <Footer />
    </div>
  );
}
