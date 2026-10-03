import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiSettings, FiArrowRight, FiZap } from 'react-icons/fi';
import { BsCarFront, BsStarFill } from 'react-icons/bs';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CarCard({ car, onEnquire }) {
  const navigate = useNavigate();

  if (!car) return null;

  const primaryImage = car.images && car.images.length > 0 
    ? car.images[0] 
    : 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';

  const categoryName = (car.category || 'Fleet').toUpperCase();
  const seatsNum = car.seats || 5;

  const handleCardClick = () => navigate(`/cars/${car.id}`);

  const handleInquireClick = (e) => {
    e.stopPropagation();
    if (onEnquire) onEnquire(car);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="vk-car-card"
      onClick={handleCardClick}
    >
      {/* Uniform Car Image Box (Fixed Aspect Ratio across all admin uploads) */}
      <div className="vk-card-img-box">
        {car.isPopular && (
          <div className="vk-card-badge-popular">
            <FiZap size={11} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: 3 }} /> POPULAR
          </div>
        )}

        {car.rating && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(15, 23, 42, 0.80)',
            backdropFilter: 'blur(4px)',
            color: '#F59E0B',
            fontSize: 11,
            fontWeight: 800,
            zIndex: 2,
          }}>
            <BsStarFill size={11} />
            <span style={{ color: '#FFFFFF' }}>{car.rating}</span>
          </div>
        )}

        <img
          src={primaryImage}
          alt={car.name}
          loading="lazy"
          decoding="async"
          className="vk-card-img"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </div>

      {/* Card Content */}
      <div className="vk-card-body">
        <div className="vk-card-header">
          <span className="vk-card-modelyear">
            {car.brand || 'VK FLEET'}
          </span>
          <span className="vk-card-category-tag">
            {categoryName}
          </span>
        </div>

        <h3 className="vk-card-title">
          {car.name}
        </h3>

        <p className="vk-card-subtitle">
          {car.fuelType ? car.fuelType.toUpperCase() : 'PETROL'} • {car.transmission || 'Manual'}
        </p>

        {/* Specs Bar in Proper Dark Color */}
        <div className="vk-card-specs">
          <div className="vk-spec-item">
            <BsCarFront size={12} color="#FF9900" />
            <span>{categoryName}</span>
          </div>

          <div className="vk-spec-item">
            <FiSettings size={12} color="#FF9900" />
            <span style={{ textTransform: 'capitalize' }}>{car.transmission || 'Manual'}</span>
          </div>

          <div className="vk-spec-item">
            <FiUsers size={12} color="#FF9900" />
            <span>{seatsNum} seats</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="vk-card-footer">
        <div>
          <span className="vk-card-price">
            {formatCurrency(car.pricePerDay || 2300)}
          </span>
          <span className="vk-card-perday">per 24 hrs</span>
        </div>

        <button
          onClick={handleInquireClick}
          className="btn btn-primary vk-inquire-btn"
        >
          <span>Book Now</span> <FiArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
