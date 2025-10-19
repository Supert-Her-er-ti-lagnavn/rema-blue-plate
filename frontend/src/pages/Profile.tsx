import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Save, Leaf, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// All valid Edamam health labels
const HEALTH_LABELS = [
  { value: 'alcohol-cocktail', label: 'Alcohol-Cocktail' },
  { value: 'alcohol-free', label: 'Alcohol-Free' },
  { value: 'celery-free', label: 'Celery-Free' },
  { value: 'crustacean-free', label: 'Crustacean-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'DASH', label: 'DASH' },
  { value: 'egg-free', label: 'Egg-Free' },
  { value: 'fish-free', label: 'Fish-Free' },
  { value: 'fodmap-free', label: 'FODMAP-Free' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'immuno-supportive', label: 'Immuno-Supportive' },
  { value: 'keto-friendly', label: 'Keto-Friendly' },
  { value: 'kidney-friendly', label: 'Kidney-Friendly' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'low-potassium', label: 'Low Potassium' },
  { value: 'low-sugar', label: 'Low Sugar' },
  { value: 'lupine-free', label: 'Lupine-Free' },
  { value: 'Mediterranean', label: 'Mediterranean' },
  { value: 'mollusk-free', label: 'Mollusk-Free' },
  { value: 'mustard-free', label: 'Mustard-Free' },
  { value: 'no-oil-added', label: 'No Oil Added' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'peanut-free', label: 'Peanut-Free' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'pork-free', label: 'Pork-Free' },
  { value: 'red-meat-free', label: 'Red-Meat-Free' },
  { value: 'sesame-free', label: 'Sesame-Free' },
  { value: 'shellfish-free', label: 'Shellfish-Free' },
  { value: 'soy-free', label: 'Soy-Free' },
  { value: 'sugar-conscious', label: 'Sugar-Conscious' },
  { value: 'sulfite-free', label: 'Sulfite-Free' },
  { value: 'tree-nut-free', label: 'Tree-Nut-Free' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'wheat-free', label: 'Wheat-Free' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dietLabels: [] as string[],
    otherPreferences: '',
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        dietLabels: user.dietLabels || [],
        otherPreferences: user.customPreferences?.join(', ') || '',
      });
    }
  }, [user]);

  const toggleHealthLabel = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      dietLabels: prev.dietLabels.includes(value)
        ? prev.dietLabels.filter((l) => l !== value)
        : [...prev.dietLabels, value],
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Du må være logget inn');
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error('Navn og e-post er påkrevd');
      return;
    }

    setIsLoading(true);
    try {
      // Parse other preferences (comma-separated text to array)
      const customPreferences = formData.otherPreferences
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          dietLabels: formData.dietLabels,
          customPreferences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Kunne ikke oppdatere profil');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      toast.success('Profil oppdatert!');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Kunne ikke lagre endringer');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="flex items-center gap-3 text-amber-600">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Ikke logget inn</h3>
              <p className="text-sm text-gray-600">Du må logge inn for å se profilen din</p>
            </div>
          </div>
          <Button onClick={() => navigate('/login')} className="w-full mt-4">
            Gå til innlogging
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake
          </Button>
        </div>

        <Card className="p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Min Profil</h1>
              <p className="text-gray-600">Administrer kostholdsvalg og preferanser</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={16} />
                Navn *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ditt navn"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} />
                E-post *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="din@epost.no"
                disabled
                title="E-post kan ikke endres"
              />
              <p className="text-xs text-gray-500 mt-1">E-post kan ikke endres</p>
            </div>

            {/* Health Labels */}
            <div className="pt-4 border-t">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Leaf size={16} />
                Kostholdsvalg og restriksjoner
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Velg alle som gjelder for deg (kan velge flere)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
                {HEALTH_LABELS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-all text-sm ${
                      formData.dietLabels.includes(option.value)
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.dietLabels.includes(option.value)}
                      onChange={() => toggleHealthLabel(option.value)}
                      className="mr-2 rounded"
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Valgt: {formData.dietLabels.length} {formData.dietLabels.length === 1 ? 'alternativ' : 'alternativer'}
              </p>
            </div>

            {/* Other Preferences */}
            <div className="pt-4 border-t">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Leaf size={16} />
                Andre preferanser (valgfritt)
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Skriv andre preferanser eller allergier (kommaseparert). Dette sendes til AI-assistenten.
              </p>
              <textarea
                value={formData.otherPreferences}
                onChange={(e) => setFormData({ ...formData, otherPreferences: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="F.eks: liker ikke brokkoli, liker sterkt krydret, allergisk mot nøtter"
              />
              <p className="text-xs text-gray-500 mt-1">
                Eksempel: "liker ikke brokkoli, liker sterkt krydret, allergisk mot nøtter"
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Lagrer...' : 'Lagre endringer'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
