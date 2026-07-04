import React from 'react';
import './Header.css';

const Header = ({ connectionStatus }) => {
  const statusLabel = {
    connected: 'Connected',
    reconnecting: 'Reconnecting…',
    offline: 'Offline',
  }[connectionStatus] || 'Connected';

  const statusClass = connectionStatus || 'connected';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="header-title">Blockchain Explorer</h1>
          <p className="header-subtitle">Wallet, transactions, and chain visualization</p>
        </div>
        <div className={`connection-status ${statusClass}`}>
          <span className="status-dot" />
          {statusLabel}
        </div>
      </div>
    </header>
  );
};

export default Header;
