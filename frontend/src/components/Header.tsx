import React, { useState, useEffect, useRef } from 'react';
import { Bell, Leaf, User, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dietaryPreference } = usePreferences();
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const loadProfilePicture = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setProfilePicture(profile.profilePicture || null);
      }
    };

    loadProfilePicture();
    window.addEventListener('storage', loadProfilePicture);
    window.addEventListener('profileUpdated', loadProfilePicture);
    return () => {
      window.removeEventListener('storage', loadProfilePicture);
      window.removeEventListener('profileUpdated', loadProfilePicture);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  // Don't show header on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Don't show profile actions if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const labelMap: Record<typeof dietaryPreference, string> = {
    omnivore: 'Omnivore',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    eco: 'Eco',
  };

  const badgeVariant =
    dietaryPreference === 'vegan'
      ? 'destructive'
      : dietaryPreference === 'vegetarian'
      ? 'secondary'
      : dietaryPreference === 'eco'
      ? 'outline'
      : 'default';

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left side - Profile and Notifications */}
        <div className="flex items-center gap-3 relative">
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 overflow-hidden"
              aria-label="Profile"
            >
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 top-12 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                >
                  <Settings size={16} />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </div>
          </button>
        </div>

        {/* Right side - Rema 1000 Logo and Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 transition-all duration-200 hover:scale-105 cursor-pointer"
          aria-label="Go to home page"
        >
          <div className="text-white text-right">
            <div className="font-bold text-xl tracking-tight">REMA 1000</div>
          </div>

          {/* Logo placeholder - you can replace this with actual Rema 1000 logo */}
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
          </div>
        </button>
      </div>

      {/* Bottom border accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
    </header>
  );
};