import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Laptop, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="nav-brand">
          <Laptop size={24} style={{ color: 'var(--primary)' }} />
          <span>EA Directory</span>
        </NavLink>
        
        <ul className="nav-links">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/employees" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Employees</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/assets" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Laptop size={18} />
              <span>Assets</span>
            </NavLink>
          </li>
          <li style={{ marginLeft: '1rem' }}>
            <button 
              onClick={() => setIsLightMode(!isLightMode)} 
              className="theme-toggle-btn"
              title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
              aria-label="Toggle theme"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
