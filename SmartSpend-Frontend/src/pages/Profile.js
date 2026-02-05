import React, { useState, useEffect } from 'react';
import { User, Save, Bell, DollarSign, Palette, Calendar, LogOut } from 'lucide-react';
import { extendedAuthAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    profile: {
      phone: '',
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy',
      theme: 'light'
    },
    notifications: {
      emailAlerts: true,
      budgetAlerts: true,
      weeklyReports: false
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError('');
      const profile = await extendedAuthAPI.getProfile();
      setProfileData({
        name: profile.name || '',
        profile: {
          phone: profile.profile?.phone || '',
          currency: profile.profile?.currency || 'USD',
          dateFormat: profile.profile?.dateFormat || 'MM/dd/yyyy',
          theme: profile.profile?.theme || 'light'
        },
        notifications: {
          emailAlerts: profile.notifications?.emailAlerts ?? true,
          budgetAlerts: profile.notifications?.budgetAlerts ?? true,
          weeklyReports: profile.notifications?.weeklyReports ?? false
        }
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const updatedProfile = await extendedAuthAPI.updateProfile(profileData);
      updateUser({ ...user, name: updatedProfile.user.name });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error && !message) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadProfile}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><User size={28} /> Profile Settings</h1>
      </div>

      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-alert">{error}</div>}
          {message && <div className="success-alert">{message}</div>}

          {/* Personal Information */}
          <div className="profile-section">
            <h2><User size={20} /> Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
                <small style={{ color: '#666' }}>Email cannot be changed</small>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={profileData.profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="profile-section">
            <h2><Palette size={20} /> Preferences</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency"><DollarSign size={16} /> Currency</label>
                <select
                  id="currency"
                  value={profileData.profile.currency}
                  onChange={(e) => handleProfileChange('currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="PKR">PKR (₨)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dateFormat"><Calendar size={16} /> Date Format</label>
                <select
                  id="dateFormat"
                  value={profileData.profile.dateFormat}
                  onChange={(e) => handleProfileChange('dateFormat', e.target.value)}
                >
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  <option value="dd-MM-yyyy">DD-MM-YYYY</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={profileData.profile.theme}
                onChange={(e) => handleProfileChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="profile-section">
            <h2><Bell size={20} /> Notifications</h2>
            <div className="notification-settings">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profileData.notifications.emailAlerts}
                  onChange={(e) => handleNotificationChange('emailAlerts', e.target.checked)}
                />
                <span className="checkmark"></span>
                Email alerts for important account activity
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profileData.notifications.budgetAlerts}
                  onChange={(e) => handleNotificationChange('budgetAlerts', e.target.checked)}
                />
                <span className="checkmark"></span>
                Budget exceeded alerts
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profileData.notifications.weeklyReports}
                  onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                />
                <span className="checkmark"></span>
                Weekly financial summary reports
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Account Actions */}
        <div className="profile-section account-actions">
          <h2>Account Actions</h2>
          <div className="account-actions-grid">
            <button 
              type="button" 
              className="btn-danger account-action-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  logout();
                }
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;