import React, { useState } from 'react';
import { Bell, Leaf, User, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { dietaryPreference, setDietaryPreference } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            aria-label="Profile"
          >
            <User size={20} />
          </button>
          <Badge variant={badgeVariant as any} className="hidden sm:flex items-center gap-1 bg-white/10 text-white border-white/30">
            <Leaf size={12} /> {labelMap[dietaryPreference]}
          </Badge>
          
          <button 
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

        {/* Center - Optional breadcrumb or status */}
        <div className="hidden md:flex items-center text-white/90 text-sm font-medium">
          <span>Rema 1000</span>
        </div>

        {/* Right side - Rema 1000 Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="text-white text-right">
            <div className="font-bold text-xl tracking-tight">REMA 1000</div>
          </div>
          
          {/* Logo placeholder - you can replace this with actual Rema 1000 logo */}
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
    </header>
  );
};