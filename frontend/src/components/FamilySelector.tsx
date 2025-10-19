import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../hooks/useFamily';
import { Button } from './ui/button';
import { Loader2, Users, Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface FamilySelectorProps {
  onSearch: (selectedUserIds: number[]) => void;
  isSearching?: boolean;
}

export function FamilySelector({ onSearch, isSearching = false }: FamilySelectorProps) {
  const { user } = useAuth();
  const { familyMembers, isLoading, addFamilyMember, removeFamilyMember } = useFamily();
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<number[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleToggleFamilyMember = (memberId: number) => {
    setSelectedFamilyIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSearch = () => {
    // Always include the current user + selected family members
    const userIds = user ? [user.id, ...selectedFamilyIds] : selectedFamilyIds;
    onSearch(userIds);
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    try {
      await addFamilyMember.mutateAsync(newMemberEmail.trim());
      setNewMemberEmail('');
      setShowAddDialog(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (confirm(`Remove ${memberName} from your family?`)) {
      try {
        await removeFamilyMember.mutateAsync(memberId);
        // Also remove from selected if they were selected
        setSelectedFamilyIds((prev) => prev.filter((id) => id !== memberId));
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-semibold text-gray-700 border-b pb-2">
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>Who's joining dinner?</span>
        </div>
        <button
          onClick={() => setShowAddDialog(!showAddDialog)}
          className="p-1 hover:bg-gray-100 rounded transition"
          title="Add family member"
        >
          <Plus size={16} className="text-blue-600" />
        </button>
      </div>

      {/* Add family member dialog */}
      {showAddDialog && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <p className="text-xs font-medium text-gray-700">Add family member by email:</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button size="sm" onClick={handleAddMember} disabled={addFamilyMember.isPending}>
              {addFamilyMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* Current user (always selected, disabled) */}
        {user && (
          <label className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-not-allowed">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="mr-3 w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-900">
              You ({user.name})
            </span>
          </label>
        )}

        {/* Family members */}
        {familyMembers.length === 0 ? (
          <p className="text-sm text-gray-500 p-3 text-center">
            No family members added yet
          </p>
        ) : (
          familyMembers.map((member) => (
            <div
              key={member.id}
              className={`flex items-center p-3 border rounded-lg transition group ${
                selectedFamilyIds.includes(member.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFamilyIds.includes(member.id)}
                onChange={() => handleToggleFamilyMember(member.id)}
                className="mr-3 w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="flex-1 text-sm font-medium text-gray-900">
                {member.name}
              </span>
              <button
                onClick={() => handleRemoveMember(member.id, member.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                title="Remove family member"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>

      <Button
        onClick={handleSearch}
        disabled={isSearching}
        className="w-full"
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Search Recipes
          </>
        )}
      </Button>

      {selectedFamilyIds.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Searching for {selectedFamilyIds.length + 1} {selectedFamilyIds.length === 0 ? 'person' : 'people'}
        </p>
      )}
    </div>
  );
}
