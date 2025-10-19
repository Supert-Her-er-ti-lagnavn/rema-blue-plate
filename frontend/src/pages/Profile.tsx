import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Leaf, Wallet, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePreferences } from '@/contexts/PreferencesContext';
import type { DietaryPreference } from '@/contexts/PreferencesContext';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  monthlyBudget: number;
  profilePicture?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { dietaryPreference, setDietaryPreference } = usePreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    monthlyBudget: 5000,
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    window.dispatchEvent(new Event('profileUpdated'));
    toast.success('Profil lagret!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Bildet er for stort. Maksimal størrelse er 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const dietaryOptions: { value: DietaryPreference; label: string; icon: string }[] = [
    { value: 'omnivore', label: 'Omnivore', icon: '🍖' },
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'eco', label: 'Miljøvennlig', icon: '🌍' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>

        <Card className="p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profilbilde" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-white" size={32} />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                aria-label="Last opp profilbilde"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Min Profil</h1>
              <p className="text-gray-600">Administrer din personlige informasjon</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={16} />
                Navn
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Skriv inn ditt navn"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} />
                E-post
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="din@epost.no"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} />
                Telefon
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+47 123 45 678"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} />
                Adresse
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Gateadresse, postnummer, sted"
              />
            </div>

            <div className="pt-4 border-t">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Leaf size={16} />
                Kostholdsvalg
              </label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDietaryPreference(option.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      dietaryPreference === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Wallet size={16} />
                Månedsbudsjett
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ønsket budsjett per måned</span>
                  <span className="text-lg font-bold text-blue-600">{profile.monthlyBudget} kr</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={profile.monthlyBudget}
                  onChange={(e) => setProfile({ ...profile, monthlyBudget: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((profile.monthlyBudget - 1000) / 19000) * 100}%, #e5e7eb ${((profile.monthlyBudget - 1000) / 19000) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 000 kr</span>
                  <span>20 000 kr</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Save className="mr-2 h-4 w-4" />
              Lagre endringer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
