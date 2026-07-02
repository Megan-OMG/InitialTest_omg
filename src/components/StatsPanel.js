import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./StatsPanel.css";

const StatValue = ({ value }) => (
  <AnimatePresence mode="popLayout">
    <motion.div
      key={value}
      className="stat-value"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
    >
      {value}
    </motion.div>
  </AnimatePresence>
);

const StatsPanel = ({ stats, onMine }) => {
  const [mining, setMining] = React.useState(false);

  if (!stats) return null;

  const handleMine = async () => {
    setMining(true);
    try {
      await onMine();
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="stats-panel card">
      <h2 className="panel-title">Blockchain stats</h2>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Chain length</div>
          <StatValue value={stats.chainLength} />
        </div>

        <div className="stat-item">
          <div className="stat-label">Pending transactions</div>
          <StatValue value={stats.pendingTransactions} />
        </div>

        <div className="stat-item">
          <div className="stat-label">Difficulty</div>
          <StatValue value={stats.difficulty} />
        </div>

        <div className="stat-item">
          <div className="stat-label">Mining reward</div>
          <StatValue value={stats.miningReward} />
        </div>

        <div className="stat-item status">
          <div className="stat-label">Chain status</div>
          <div
            className={`stat-value status-${stats.isValid ? "valid" : "invalid"}`}
          >
            {stats.isValid ? "Valid" : "Invalid"}
          </div>
        </div>
      </div>

      <motion.button
        className="btn-primary mine-button"
        onClick={handleMine}
        disabled={mining}
        whileTap={{ scale: 0.98 }}
      >
        {mining ? "Mining…" : "Mine block"}
      </motion.button>
    </div>
  );
};

export default StatsPanel;
