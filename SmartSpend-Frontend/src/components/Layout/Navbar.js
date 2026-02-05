import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { Wallet, BarChart3, LogOut, DollarSign, Target, Repeat, Settings } from 'lucide-react';

const Navbar = ({ isDarkTheme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: Wallet, label: 'Dashboard' },
    { path: '/expenses', icon: Wallet, label: 'Expenses' },
    { path: '/income', icon: DollarSign, label: 'Income' },
    { path: '/budget', icon: Target, label: 'Budget' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/recurring', icon: Repeat, label: 'Recurring' },
    { path: '/goals', icon: Target, label: 'Goals' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Wallet size={24} />
        <span>SmartSpend</span>
      </div>
      
      <div className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="nav-user">
        {/* Theme Toggle inside navbar */}
        <button 
          className="theme-toggle-nav"
          onClick={toggleTheme}
          title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkTheme ? '☀️' : '🌙'}
        </button>

        <Link to="/profile" className="nav-link profile-link" title="Profile Settings">
          <Settings size={18} />
        </Link>

        <span>Hello, {user.name}</span>
        <button onClick={handleLogout} className="logout-btn" title="Sign Out">
          <LogOut size={18} />
          <span className="logout-text">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;