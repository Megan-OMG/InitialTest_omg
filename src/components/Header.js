import React from "react";
import { motion } from "framer-motion";
import "./Header.css";

const Header = () => {
  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="header-content">
        <div className="header-title-row">
          <span className="live-dot" aria-hidden="true" />
          <h1 className="header-title">Blockchain Explorer</h1>
        </div>
        <p className="header-subtitle">
          Live view of your chain, wallets, and transactions
        </p>
      </div>
    </motion.header>
  );
};

export default Header;
