import React from 'react';
import { motion } from 'framer-motion';
import './StatsPanel.css';

const StatItem = ({ label, value, className = '' }) => (
  <div className="stat-item">
    <div className="stat-label">{label}</div>
    <motion.div
      className={`stat-value ${className}`}
      key={String(value)}
      initial={{ opacity: 0.5, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.div>
  </div>
);

const StatsPanel = ({ stats, onMine, mining }) => {
  if (!stats) return null;

  return (
    <motion.div
      className="panel stats-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="panel-title">Overview</h2>

      <div className="stats-grid">
        <StatItem label="Chain Length" value={stats.chainLength} />
        <StatItem label="Pending" value={stats.pendingTransactions} />
        <StatItem label="Difficulty" value={stats.difficulty} />
        <StatItem label="Mining Reward" value={stats.miningReward} />
        <StatItem
          label="Status"
          value={stats.isValid ? 'Valid' : 'Invalid'}
          className={stats.isValid ? 'valid' : 'invalid'}
        />
      </div>

      <motion.button
        className="btn btn-mine"
        onClick={onMine}
        disabled={mining}
        whileTap={{ scale: 0.98 }}
        animate={mining ? { opacity: 0.7 } : { opacity: 1 }}
      >
        {mining ? 'Mining…' : 'Mine Block'}
      </motion.button>
    </motion.div>
  );
};

export default StatsPanel;
