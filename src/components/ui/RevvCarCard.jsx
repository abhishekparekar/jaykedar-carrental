import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSettings, FiUsers, FiArrowRight, FiClock, FiZap } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RevvCarCard({ car, onEnquire }) {
  const navigate = useNavigate();

  if (!car) return null;

  const primaryImage = car.images && car.images.length > 0
    ? car.images[0]
    : '/force-traveller.jpg';

  const busModel = car.busModel || 'Force Traveller';
  const categoryName = (car.category || 'Bus').toUpperCase();
  const seatsNum = Number(car.seats) || 17;
  const perKmRate = car.perKmRate || car.extraKmRate || 25;
  const extraKmRate = car.extraKmRate || perKmRate || 25;
  const acLabel = car.acType === 'non_ac' ? 'Non-AC' : car.acType === 'both' ? 'AC / Non-AC' : 'AC';

  const handleCardClick = () => navigate(`/cars/${car.id}`);

  const handleInquireClick = (e) => {
    e.stopPropagation();
    if (onEnquire) onEnquire(car);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="vk-car-card"
        onClick={handleCardClick}
      >
        {/* Uniform Car Image Box */}
        <div className="vk-card-img-box">
          {car.isPopular && (
            <div className="vk-card-badge-popular">
              <FiZap size={11} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: 3 }} /> POPULAR
            </div>
          )}

          <img
            src={primaryImage}
            alt={car.name}
            loading="lazy"
            decoding="async"
            className="vk-card-img"
            onError={(e) => {
              e.target.src = '/force-traveller.jpg';
            }}
          />

          <div className="vk-card-badge-km">
            ₹{perKmRate}/km
          </div>

          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(4px)',
            color: '#FFFFFF',
            fontSize: 10.5,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            letterSpacing: '0.3px',
          }}>
            <span>🚐 {busModel}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="vk-card-body">
          <div className="vk-card-header">
            <span className="vk-card-modelyear" style={{ color: '#FF4500', fontWeight: 900 }}>
              {busModel} • {seatsNum} Seater
            </span>
            <span className="vk-card-category-tag">
              {categoryName}
            </span>
          </div>

          <h3 className="vk-card-title" title={car.name}>
            {car.name}
          </h3>

          <p className="vk-card-subtitle">
            <strong style={{ color: '#0F172A' }}>{busModel}</strong> • {seatsNum} Seats • {acLabel} {car.includedKm ? `• ${car.includedKm}` : ''}
          </p>

          {/* Compact 2x2 Specs Bar tailored for Travels & Packages */}
          <div className="vk-card-specs">
            <div className="vk-spec-item">
              <FiUsers size={12} color="#FF4500" style={{ flexShrink: 0 }} />
              <span>{seatsNum} Seats</span>
            </div>

            <div className="vk-spec-item">
              <BsCarFront size={12} color="#FF4500" style={{ flexShrink: 0 }} />
              <span>{acLabel}</span>
            </div>

            <div className="vk-spec-item">
              <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A' }}>₹{perKmRate}/km</span>
              <span>Rate</span>
            </div>

            <div className="vk-spec-item">
              <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>+₹{extraKmRate}</span>
              <span>Extra/km</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="vk-card-footer">
          <div style={{ minWidth: 0 }}>
            <span className="vk-card-price">
              {formatCurrency(car.pricePerDay || 0)}
            </span>
            <span className="vk-card-perday">
              {car.includedKm ? car.includedKm : 'Package / Day'}
            </span>
          </div>

          <button
            onClick={handleInquireClick}
            className="btn btn-primary vk-inquire-btn"
          >
            <span>Inquire</span> <FiArrowRight size={13} style={{ flexShrink: 0 }} />
          </button>
        </div>
      </motion.div>

      <style>{`
        .vk-car-card {
          background: #FFFFFF !important;
          border-radius: 6px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid #E5E7EB !important;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          width: 100%;
          box-sizing: border-box;
        }
        .vk-car-card:hover {
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12) !important;
          border-color: #CBD5E1 !important;
          transform: translateY(-4px);
        }
        .vk-card-img-box {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          height: 160px;
          background: #F8FAFC;
          overflow: hidden;
          flex-shrink: 0;
          border-radius: 6px 6px 0 0;
        }
        .vk-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s ease;
        }
        .vk-car-card:hover .vk-card-img {
          transform: scale(1.06);
        }
        .vk-card-badge-popular {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          background: linear-gradient(135deg, #FF9900 0%, #FFA800 100%);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 4px;
          box-shadow: 0 4px 14px rgba(255, 153, 0, 0.40);
          letter-spacing: 0.5px;
        }
        .vk-card-badge-km {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(4px);
          WebkitBackdropFilter: blur(4px);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .vk-card-body {
          padding: 12px 14px 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .vk-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          gap: 4px;
        }
        .vk-card-modelyear {
          font-size: 11px;
          color: #475569;
          font-weight: 700;
        }
        .vk-card-category-tag {
          font-size: 9.5px;
          color: #FF9900;
          font-weight: 900;
          letter-spacing: 0.6px;
          background: rgba(255, 153, 0, 0.08);
          padding: 2px 7px;
          border-radius: 6px;
          border: 1px solid rgba(255, 153, 0, 0.2);
          white-space: nowrap;
        }
        .vk-card-title {
          font-size: 15.5px;
          font-weight: 900;
          color: #111318;
          margin: 0 0 2px;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .vk-card-subtitle {
          font-size: 11.5px;
          color: #64748B;
          margin: 0 0 8px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .vk-card-specs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px 8px;
          font-size: 11px;
          color: #334155;
          font-weight: 700;
          padding-top: 8px;
          padding-bottom: 8px;
          border-top: 1px solid #F1F5F9;
          margin-top: auto;
        }
        .vk-spec-item {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vk-card-footer {
          padding: 10px 14px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px dashed #E2E8F0;
          background: #FAFAFA;
          gap: 6px;
        }
        .vk-card-price {
          font-size: 18px;
          font-weight: 900;
          color: #FF9900;
          display: block;
          line-height: 1;
        }
        .vk-card-perday {
          font-size: 10px;
          color: #64748B;
          font-weight: 700;
          display: block;
          margin-top: 2px;
        }
        .vk-inquire-btn {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 900;
          border-radius: 999px;
          background: linear-gradient(135deg, #FF9900 0%, #FFA800 100%);
          box-shadow: 0 4px 14px rgba(255, 153, 0, 0.35);
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .vk-inquire-btn:hover {
          transform: translateX(2px);
          box-shadow: 0 6px 18px rgba(255, 153, 0, 0.50);
        }

        @media (max-width: 640px) {
          .vk-car-card { border-radius: 20px; }
          .vk-card-img-box { height: 165px; }
          .vk-card-badge-popular { top: 8px; left: 8px; font-size: 10px; padding: 3px 8px; }
          .vk-card-badge-km { top: 8px; right: 8px; font-size: 10px; padding: 3px 8px; }
          .vk-card-body { padding: 12px 14px 0; }
          .vk-card-header { margin-bottom: 4px; }
          .vk-card-modelyear { font-size: 11px; }
          .vk-card-category-tag { font-size: 9.5px; padding: 2px 6px; }
          .vk-card-title { font-size: 16px !important; margin-bottom: 2px !important; }
          .vk-card-subtitle { font-size: 11.5px !important; margin-bottom: 6px !important; }
          .vk-card-specs { gap: 5px 8px !important; font-size: 10.5px !important; padding-top: 6px !important; padding-bottom: 6px !important; }
          .vk-card-footer { padding: 10px 14px 12px; gap: 6px; }
          .vk-card-price { font-size: 19px !important; }
          .vk-card-perday { font-size: 10px !important; }
          .vk-inquire-btn { padding: 8px 16px !important; font-size: 12px !important; border-radius: 999px; }
        }
      `}</style>
    </>
  );
}
