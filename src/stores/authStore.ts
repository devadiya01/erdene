import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  userRole: string | null;
  setUser: (user: any) => void;
  setUserRole: (role: string) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userRole: null,
  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ userRole: role }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: null });
  },
}));