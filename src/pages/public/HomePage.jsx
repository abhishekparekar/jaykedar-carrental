import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { FiSearch, FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight, FiShield, FiClock, FiKey, FiTruck, FiArrowRight, FiZap, FiCheckCircle, FiStar } from 'react-icons/fi';
import { BsCarFront, BsStarFill, BsAward, BsCarFrontFill, BsWhatsapp } from 'react-icons/bs';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RevvCarCard from '../../components/ui/RevvCarCard';
import CarSkeleton from '../../components/ui/CarSkeleton';
import Modal from '../../components/ui/Modal';
import BookingForm from '../../components/ui/BookingForm';

import { useTenant } from '../../contexts/TenantContext';
import { subscribeToCars, subscribeToReviews } from '../../firebase/firestore';

import heroBgImg from '../../assets/tours_hero_bg.jpg';
import logoImg from '../../assets/Jaylogo2.png';
import coupleTalkImg from '../../assets/happy_couple_talk.png';

const CITIES = ['Pune', 'Mumbai', 'Nashik', 'Shirdi', 'Mahabaleshwar', 'Goa', 'Kolhapur'];

const CATEGORIES = [
  { id: 'hatchback', name: 'Hatchback', desc: 'Swift, i20, Baleno — Perfect for local city & daily commute', icon: <BsCarFront size={24} /> },
  { id: 'sedan', name: 'Sedan & Premium', desc: 'Dzire, Ciaz — Maximum comfort for outstation & business trips', icon: <BsCarFrontFill size={24} /> },
  { id: 'suv', name: 'SUV & Tourer', desc: 'Innova, Scorpio, Thar — Powerful travel across hill stations & highways', icon: <FiTruck size={24} /> },
  { id: 'muv', name: '7-Seater Family MUV', desc: 'Ertiga & Innova Crysta — Spacious family tours & pilgrimage packages', icon: <BsCarFront size={24} /> },
];

const FEATURES = [
  { icon: <FiTruck size={22} />, title: 'Doorstep Pickup & Drop', desc: 'Punctual pickup and drop directly at your home, hotel or airport terminal.' },
  { icon: <FiKey size={22} />, title: 'Outstation & Tour Trips', desc: 'Travel anywhere in Maharashtra, Goa, and all-India tourist destinations.' },
  { icon: <FiShield size={22} />, title: 'Safe & Insured Fleet', desc: 'Comprehensive commercial insurance and all India tourist permit (AITP).' },
  { icon: <FiClock size={22} />, title: '24/7 Roadside Assistance', desc: 'Round-the-clock emergency support and courteous customer care on every trip.' },
  { icon: <FiZap size={22} />, title: 'Affordable Transparent Rates', desc: 'No hidden fees or surge pricing. Crystal clear per-km & package rates.' },
  { icon: <FiCheckCircle size={22} />, title: 'Deep Sanitized Vehicles', desc: '100% clean, vacuumed, and sanitized vehicles before every departure.' },
  { icon: <BsCarFront size={22} />, title: 'Experienced & Well-Maintained', desc: 'Modern, well-maintained vehicles ready for long distances and pilgrimages.' },
  { icon: <FiStar size={22} />, title: 'Transparent Pricing', desc: 'No hidden taxes or unexpected surcharges at checkout.' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', initials: 'RS', city: 'Pune', role: 'Software Engineer', comment: 'Rented a Fronx for a trip to Lonavala. Car was delivered right at my door in Pune. Super smooth booking experience!', rating: 5, carUsed: 'Maruti Fronx 2026' },
  { name: 'Priya Verma', initials: 'PV', city: 'Bangalore', role: 'Product Manager', comment: 'The Innova Hycross gave us royal comfort for our family road trip to Coorg. 10/10 service and vehicle quality!', rating: 5, carUsed: 'Innova Hycross AT' },
  { name: 'Anish Kulkarni', initials: 'AK', city: 'Mumbai', role: 'Entrepreneur', comment: 'Extremely easy booking process. Rented the Mahindra Thar 4x4 for mountain camping. Highly recommended!', rating: 5, carUsed: 'Thar 4x4 Convertible' },
  { name: 'Sneha Deshmukh', initials: 'SD', city: 'Hyderabad', role: 'Architect', comment: 'Zero security deposit hassle and 100% clean sanitized car. Jay Kedarnath is now our go-to tours & travels service!', rating: 5, carUsed: 'Hyundai Creta' },
  { name: 'Deepak Patel', initials: 'DP', city: 'Delhi NCR', role: 'Business Owner', comment: 'Booked Scorpio N for a 5-day trip to Manali. Unlimited km option saved us so much money on fuel & fees!', rating: 5, carUsed: 'Scorpio N 2025' },
  { name: 'Meera Kapoor', initials: 'MK', city: 'Chennai', role: 'Design Lead', comment: 'Doorstep drop and pick up made my weekend drive completely stress-free. Premium service quality!', rating: 5, carUsed: 'Swift ZXi' },
];

export default function HomePage() {
  const { tenantId, settings } = useTenant();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hero Search Form state
  const [city, setCity] = useState('Pune');
  const [pickupDate, setPickupDate] = useState(new Date(Date.now() + 86400000));
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000 * 3));

  // Swiper Navigation refs
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const unsubCars = subscribeToCars(tenantId, (data) => {
      setCars(data);
      setLoading(false);
    });
    const unsubReviews = subscribeToReviews(tenantId, (data) => {
      setReviews(data || []);
    });
    return () => {
      unsubCars();
      unsubReviews();
    };
  }, [tenantId]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/fleet?city=${encodeURIComponent(city)}`);
  };

  const openEnquiry = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F7F7F8' }}>
      <Navbar />

      {/* 1. CINEMATIC TOURS & TRAVELS HERO SECTION */}
      <section
        className="hero-bg-section"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 25, 47, 0.72) 0%, rgba(15, 23, 42, 0.88) 100%), url("${heroBgImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0A192F',
          paddingTop: 104,
          paddingBottom: 68,
          position: 'relative',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ margin: '0 auto', textAlign: 'center', maxWidth: 1000 }}>
            {/* Main Premium Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hero-main-title"
              style={{
                color: '#FFFFFF',
                fontWeight: 900,
                lineHeight: 1.15,
                fontSize: 'clamp(2.4rem, 5.8vw, 4.2rem)',
                letterSpacing: '-0.02em',
                marginBottom: 18,
                textShadow: '0 4px 24px rgba(0, 0, 0, 0.50)',
              }}
            >
              <span>EXPLORE EVERY JOURNEY YOUR WAY</span><br />
              <span style={{
                background: 'linear-gradient(135deg, #FF4B1F 0%, #FF5E36 50%, #FF8A00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900,
                fontStyle: 'italic',
              }}>
                Premium Tours &amp; Travels Services
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                color: '#E2E8F0',
                fontSize: 'clamp(15px, 2.2vw, 18px)',
                fontWeight: 600,
                maxWidth: 780,
                margin: '0 auto 32px',
                lineHeight: 1.6,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.50)',
              }}
            >
              Outstation Trips • Pilgrimages &amp; Holiday Tours • Local City Travel • 24/7 Verified Vehicle Fleet with Doorstep Pickup in Pune.
            </motion.p>

            {/* Hero Action CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/fleet"
                className="btn btn-primary"
                style={{
                  padding: '14px 40px',
                  fontSize: 16,
                  fontWeight: 900,
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 50%, #C41C00 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 30px rgba(230, 46, 0, 0.40)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <BsCarFront size={19} /> Explore Travel Fleet
              </Link>
              <a
                href={`https://wa.me/${(settings?.whatsapp || '918485877633').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(settings?.businessName || 'Jay Kedarnath Tours & Travels')},%20I%20want%20to%20inquire%20about%20booking%20a%20vehicle.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '14px 34px',
                  fontSize: 16,
                  fontWeight: 900,
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255, 255, 255, 0.30)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.30)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <BsWhatsapp size={19} style={{ color: '#25D366' }} /> WhatsApp Instant Inquire
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TOP SELLING CARS / MOST POPULAR SECTION — FULL WIDTH */}
      <section style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        padding: '50px 0 60px',
        borderTop: '1px solid #E5E7EB',
      }}>
        <div style={{ width: '100%', padding: '0 clamp(16px, 4vw, 48px)' }}>
          {/* Section Header with Left Title + Right Link */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <span className="section-label" style={{
                background: 'rgba(255, 107, 0, 0.09)',
                color: '#FF6B00',
                border: '1px solid rgba(255, 107, 0, 0.25)',
                padding: '5px 14px',
                borderRadius: '9999px',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}>
                Most Popular Choices
              </span>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#111827', margin: '8px 0 0', letterSpacing: '-0.02em' }}>
                Top Cars in <span style={{ color: '#FF6B00' }}>{city}</span>
              </h2>
            </div>
            <Link to="/fleet" className="btn btn-secondary btn-sm" style={{
              borderRadius: '9999px',
              padding: '10px 22px',
              fontWeight: 800,
              fontSize: 13.5,
              background: '#1A1D29',
              color: '#FFFFFF',
              border: '1px solid #2B3245',
              boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
            }}>
              View Popular Fleet <FiArrowRight size={16} />
            </Link>
          </div>

          {/* Clean Full-Width 4-Column Fleet Grid */}
          {loading ? (
            <div className="grid-fleet-catalog">
              <CarSkeleton />
              <CarSkeleton />
              <CarSkeleton />
              <CarSkeleton />
            </div>
          ) : cars.filter(c => c.isPopular !== false).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#6B7280', fontSize: 14, fontWeight: 600 }}>
              No cars currently marked as popular. Admin can toggle Popular Choice in Admin Panel.
            </div>
          ) : (
            <div className="grid-fleet-catalog">
              {cars.filter(c => c.isPopular !== false).slice(0, 4).map((car) => (
                <RevvCarCard key={car.id} car={car} onEnquire={openEnquiry} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. FULL FLEET SECTION */}
      <section className="section-sm" style={{ background: '#F7F7F8', borderTop: '1px solid #E4E6EA', borderBottom: '1px solid #E4E6EA' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="section-label">Full Fleet</span>
              <h2 className="section-title" style={{ margin: 0 }}>All Available <span>Tour &amp; Travel Vehicles</span></h2>
            </div>
            <Link to="/fleet" className="btn btn-secondary btn-sm">
              View All Fleet <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid-fleet-catalog">
              <CarSkeleton />
              <CarSkeleton />
              <CarSkeleton />
              <CarSkeleton />
            </div>
          ) : cars.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              maxWidth: 550,
              margin: '0 auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255, 69, 0, 0.08)',
                color: '#FF4500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <BsCarFront size={26} />
              </div>
              <h3 style={{ fontSize: 18, color: '#0F172A', fontWeight: 800, marginBottom: 8 }}>
                Fleet Being Updated
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
                Our fleet is currently being updated. You can still submit a custom inquiry below or message us directly on WhatsApp.
              </p>
              <a
                href={`https://wa.me/${settings?.whatsapp || '918485877633'}?text=Hi%20${encodeURIComponent(settings?.businessName || 'Jay Kedarnath Tours & Travels')}%2C%20I%20want%20to%20inquire%20about%20vehicle%20availability.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  fontWeight: 700,
                  borderRadius: 99,
                  background: '#25D366',
                  borderColor: '#25D366',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                }}
              >
                <BsWhatsapp size={16} /> Contact on WhatsApp
              </a>
            </div>
          ) : (
            <>
              <div className="grid-fleet-catalog">
                {cars.slice(0, 8).map((car) => (
                  <RevvCarCard key={car.id} car={car} onEnquire={openEnquiry} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <Link to="/fleet" className="btn btn-primary btn-md" style={{ padding: '10px 24px', fontSize: 14 }}>
                  Explore All Fleet ({cars.length}+ Cars) <FiArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. CATEGORIES - CLEAN STATIC GRID (NO ANIMATION / NO SCROLL) */}
      <section className="section-sm" style={{ background: '#F8FAFC', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: 32 }}>
            <span className="section-label" style={{
              background: 'rgba(255, 107, 0, 0.09)',
              color: '#FF6B00',
              border: '1px solid rgba(255, 107, 0, 0.25)',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}>
              Browse Fleet
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#111827', margin: '8px 0 0' }}>
              Explore by <span style={{ color: '#FF6B00' }}>Category</span>
            </h2>
          </div>

          <div className="home-category-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/fleet?category=${cat.id}`}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="home-category-card"
                >
                  {/* Signature Vector Curve */}
                  <div className="home-category-wave">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                      <path d="M0 0 C50 10, 90 40, 100 100 L100 0 Z" fill="#FF4500" opacity="0.15" />
                      <path d="M20 0 C65 15, 95 50, 100 85 L100 0 Z" fill="#E62E00" opacity="0.30" />
                    </svg>
                  </div>

                  <div className="home-category-icon-box">
                    {cat.icon}
                  </div>
                  <h3 className="home-category-title">{cat.name}</h3>
                  <p className="home-category-desc">{cat.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 DIRECT HOMEPAGE INQUIRY FORM SECTION — 2-COLUMN LAYOUT */}
      <section id="inquiry-form-section" style={{
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        padding: '50px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-header text-center" style={{ marginBottom: 32 }}>
            <span className="section-label" style={{
              background: 'rgba(255, 69, 0, 0.08)',
              color: '#FF4500',
              border: '1px solid rgba(255, 69, 0, 0.25)',
              padding: '5px 16px',
              borderRadius: '9999px',
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Instant Booking &amp; Quote
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#111827', margin: '8px 0 0' }}>
              Book Your Car in <span style={{ color: '#FF4500' }}>30 Minutes</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'center',
          }}>
            {/* Left Column: Instant Booking Form Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                padding: '24px 26px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                position: 'relative',
              }}
            >
              <h3 style={{ fontSize: 19, fontWeight: 900, color: '#111827', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BsCarFront color="#FF4500" size={20} /> Reserve Your Vehicle
              </h3>
              <BookingForm car={null} onSuccess={() => toast.success('Rental inquiry submitted! We will reach out shortly.')} />
            </motion.div>

            {/* Right Column: Hero Vector Background Card with Boy & Girl Talk Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'relative',
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                background: `linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(241, 245, 249, 0.95) 100%), url("${heroBgImg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 460,
              }}
            >
              {/* Top Floating Feature Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, zIndex: 2, marginBottom: 16 }}>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: '#111827',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <FiCheckCircle color="#22C55E" size={15} /> 30-Min Doorstep Drop
                </div>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: '#111827',
                  color: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(17, 24, 39, 0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <BsWhatsapp color="#25D366" size={15} /> 24/7 Consultation Support
                </div>
              </div>

              {/* Center Illustration: Boy & Girl Rental Talk */}
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', margin: 'auto 0' }}>
                <img
                  src={coupleTalkImg}
                  alt="Car Rental Consultation"
                  style={{
                    width: '100%',
                    maxHeight: 280,
                    objectFit: 'contain',
                    borderRadius: 18,
                    display: 'block',
                    margin: '0 auto',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.12))',
                  }}
                />
              </div>

              {/* Bottom Callout Banner */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                marginTop: 16,
                padding: '12px 18px',
                borderRadius: 16,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#111827' }}>Need Help Booking?</h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#4B5563', fontWeight: 600 }}>Talk directly with our booking expert</p>
                </div>
                <a
                  href={`https://wa.me/${(settings?.whatsapp || '918485877633').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(settings?.businessName || 'Jay Kedarnath Tours & Travels')},%20I%20want%20to%20inquire%20about%20booking%20a%20car.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 900,
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #FF4B1F 0%, #E62E00 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(230, 46, 0, 0.35)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <BsWhatsapp size={14} style={{ color: '#FFFFFF', display: 'inline-block', marginRight: 5 }} /> Chat Now
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US - CLEAN STATIC GRID (NO ANIMATION / NO SCROLL) */}
      <section className="section-sm" style={{ background: '#FFFFFF', padding: '50px 0' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: 32 }}>
            <span className="section-label" style={{
              background: 'rgba(255, 69, 0, 0.08)',
              color: '#FF4500',
              border: '1px solid rgba(255, 69, 0, 0.25)',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}>
              Why Choose {settings?.businessName || "Jay Kedarnath Tours & Travels"}
            </span>
            <h2 className="section-title" style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#111827', margin: '8px 0 0' }}>
              The Ultimate <span style={{ color: '#FF4500' }}>Tours &amp; Travel</span> Experience
            </h2>
          </div>

          <div className="home-features-grid">
            {FEATURES.map((feat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="home-feature-card"
              >
                {/* Signature Vector Curve */}
                <div className="home-category-wave feat-wave">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                    <path d="M0 0 C50 10, 90 40, 100 100 L100 0 Z" fill="#FF4500" opacity="0.15" />
                    <path d="M20 0 C65 15, 95 50, 100 85 L100 0 Z" fill="#E62E00" opacity="0.30" />
                  </svg>
                </div>

                <div className="home-category-icon-box feat-icon-box" style={{ marginBottom: 4 }}>
                  {feat.icon}
                </div>
                <h3 className="home-category-title" style={{ margin: 0 }}>{feat.title}</h3>
                <p className="home-category-desc">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* 6. TESTIMONIALS */}
      <section className="section-sm" style={{ background: '#F7F7F8', borderTop: '1px solid #E4E6EA', paddingBottom: 48 }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: 28 }}>
            <span className="section-label-red">Reviews</span>
            <h2 className="section-title">Loved by <span>Drivers</span></h2>
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: 13 }}>
              No customer reviews published yet. Admin can add live customer reviews in Admin Panel Settings.
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  style={{
                    padding: 22,
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #E4E6EA',
                    boxShadow: '0 4px 20px rgba(17,19,24,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 3, color: '#F59E0B' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => <BsStarFill key={i} size={14} />)}
                      </div>
                      <span style={{ fontSize: 11, background: 'rgba(22,163,74,0.08)', color: '#16A34A', fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(22,163,74,0.2)' }}>
                        Verified Customer
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontStyle: 'italic', color: '#000000', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid #F0F1F3' }}>
                    <div style={{
                      width: 38, height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF4500 0%, #900007 100%)',
                      color: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800,
                      boxShadow: '0 2px 10px rgba(255, 69, 0,0.30)',
                    }}>
                      {rev.name?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 14, color: '#000000', lineHeight: 1.2 }}>{rev.name}</strong>
                      <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>{rev.location || 'Pune'} • {rev.carName || 'Travel Fleet'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ENQUIRY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCar ? `Enquire for ${selectedCar.name}` : 'Rental Inquiry'}
      >
        <BookingForm
          car={selectedCar}
          onSuccess={() => {
            setTimeout(() => setIsModalOpen(false), 2500);
          }}
        />
      </Modal>

      <Footer />
    </div>
  );
}
