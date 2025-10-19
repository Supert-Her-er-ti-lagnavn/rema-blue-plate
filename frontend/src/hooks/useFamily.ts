import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface FamilyMember {
  id: number;
  name: string;
}

export function useFamily() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: familyMembers, isLoading, error } = useQuery<FamilyMember[]>({
    queryKey: ['family', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${user.id}/family`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch family members');
      }

      return response.json();
    },
    enabled: !!user?.id,
  });

  // Add family member by email
  const addFamilyMember = useMutation({
    mutationFn: async (email: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${user.id}/family/${encodeURIComponent(email)}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add family member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', user?.id] });
      toast.success('Family member added!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add family member');
    },
  });

  // Remove family member
  const removeFamilyMember = useMutation({
    mutationFn: async (memberId: number) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${user.id}/family/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to remove family member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', user?.id] });
      toast.success('Family member removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove family member');
    },
  });

  return {
    familyMembers: familyMembers || [],
    isLoading,
    error,
    addFamilyMember,
    removeFamilyMember,
  };
}
