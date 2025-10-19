import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

// Valid Edamam health labels
const DIET_OPTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'dairy-free', label: 'Dairy Free' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'wheat-free', label: 'Wheat Free' },
  { value: 'egg-free', label: 'Egg Free' },
  { value: 'peanut-free', label: 'Peanut Free' },
  { value: 'tree-nut-free', label: 'Tree Nut Free' },
  { value: 'soy-free', label: 'Soy Free' },
  { value: 'fish-free', label: 'Fish Free' },
  { value: 'shellfish-free', label: 'Shellfish Free' },
  { value: 'pork-free', label: 'Pork Free' },
  { value: 'red-meat-free', label: 'Red Meat Free' },
  { value: 'kosher', label: 'Kosher' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dietLabels: [] as string[],
    allergies: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleDietToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      dietLabels: prev.dietLabels.includes(value)
        ? prev.dietLabels.filter((d) => d !== value)
        : [...prev.dietLabels, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const customPreferences = formData.allergies
        ? formData.allergies.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

      await register({
        name: formData.name,
        email: formData.email,
        dietLabels: formData.dietLabels,
        customPreferences,
      });

      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Rema Blue Plate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Anna Hansen"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="anna@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Preferences & Restrictions
            </label>
            <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {DIET_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    formData.dietLabels.includes(option.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.dietLabels.includes(option.value)}
                    onChange={() => handleDietToggle(option.value)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
              Allergies & Exclusions
            </label>
            <input
              id="allergies"
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., peanuts, shellfish, gluten (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter ingredients to exclude, separated by commas
            </p>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
