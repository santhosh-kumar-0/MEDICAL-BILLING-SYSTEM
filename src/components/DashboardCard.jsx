import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon,
  color = '#4F46E5',
  trend,
  trendValue,
  onClick,
  className = ''
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -6,
      scale: 1.02,
      transition: {
        duration: 0.22,
        ease: 'easeOut'
      }
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <motion.div
      className={`dashboard-card ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick}
      style={{
        '--card-color': color,
        '--card-hover-shadow': `${color}33`
      }}
    >
      <motion.div
        className="card-background"
        initial={{ scale: 1, opacity: 0.08 }}
        whileHover={{ scale: 1.4, opacity: 0.16 }}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}22, transparent 70%)`
        }}
      />

      <div className="card-particles">
        <motion.div
          className="particle particle-1"
          animate={{
            x: [0, 10, 0],
            y: [0, -6, 0],
            opacity: [0.2, 0.55, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="particle particle-2"
          animate={{
            x: [0, -8, 0],
            y: [0, 7, 0],
            opacity: [0.2, 0.45, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8
          }}
        />
      </div>

      <div className="card-content">
        <div className="card-header">
          <motion.div
            className="card-icon-container"
            initial={{ rotate: 0, scale: 1 }}
            whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
            transition={{ duration: 0.38 }}
          >
            <div className="card-icon">{icon}</div>
            <div className="icon-glow" style={{ background: color }} />
          </motion.div>
          <div className="card-title-section">
            <div className="card-title">{title}</div>
            {subtitle ? <div className="card-subtitle">{subtitle}</div> : null}
          </div>
        </div>

        <div className="card-body">
          <motion.div
            className="card-value"
            initial={{ scale: 0.84, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.38 }}
          >
            {value}
          </motion.div>

          {trend && trendValue ? (
            <motion.div
              className="card-trend"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
              style={{ color: getTrendColor(trend) }}
            >
              <span className="trend-icon">{getTrendIcon(trend)}</span>
              <span className="trend-value">{trendValue}</span>
            </motion.div>
          ) : null}
        </div>
      </div>

      <motion.div
        className="card-shimmer"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 3.4,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};

export default DashboardCard;

