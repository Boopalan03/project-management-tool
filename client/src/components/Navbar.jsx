import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiCheckSquare,
  FiLogOut,
  FiUser,
  FiTrello,
  FiCalendar,
  FiBarChart2,
  FiBell,
  FiMenu,
  FiX
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="saas-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand-section">
          <div className="brand-logo-icon">
            <FiCheckSquare size={20} />
          </div>
          <span className="brand-title">Codec Flow</span>
        </div>

        {/* Desktop Navigation Links */}
        {user && (
          <div className="navbar-links-desktop">
            <button
              className={`nav-tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => handleNavClick('kanban')}
            >
              <FiTrello size={16} />
              <span>Kanban</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'gantt' ? 'active' : ''}`}
              onClick={() => handleNavClick('gantt')}
            >
              <FiCalendar size={16} />
              <span>Gantt Chart</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleNavClick('analytics')}
            >
              <FiBarChart2 size={16} />
              <span>Analytics</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleNavClick('notifications')}
            >
              <FiBell size={16} />
              <span>Notifications</span>
            </button>
          </div>
        )}

        {/* User Profile & Actions */}
        <div className="navbar-user-actions">
          {user ? (
            <>
              <div className="user-profile-badge">
                <span className="role-tag">{user.role}</span>
                <div className="user-info">
                  <FiUser className="user-icon" />
                  <span className="user-name">{user.name}</span>
                </div>
              </div>

              <button className="logout-btn" onClick={logout} title="Sign Out">
                <FiLogOut size={15} />
                <span className="logout-text">Logout</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                className="mobile-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </>
          ) : (
            <span className="guest-badge">Guest</span>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {user && mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <button
            className={`mobile-tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
            onClick={() => handleNavClick('kanban')}
          >
            <FiTrello size={18} />
            <span>Kanban Board</span>
          </button>

          <button
            className={`mobile-tab-btn ${activeTab === 'gantt' ? 'active' : ''}`}
            onClick={() => handleNavClick('gantt')}
          >
            <FiCalendar size={18} />
            <span>Gantt Chart</span>
          </button>

          <button
            className={`mobile-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
          >
            <FiBarChart2 size={18} />
            <span>Analytics</span>
          </button>

          <button
            className={`mobile-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleNavClick('notifications')}
          >
            <FiBell size={18} />
            <span>Notifications</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
