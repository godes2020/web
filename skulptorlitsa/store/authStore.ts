'use client';

import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: (jwt, user) => {
    if (typeof window !== 'undefined') localStorage.setItem('jwt', jwt);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('jwt');
    set({ user: null, isAuthenticated: false });
  },

  setLoading: (v) => set({ isLoading: v }),

  initFromStorage: () => {
    if (typeof window === 'undefined') { set({ isLoading: false }); return; }
    const token = localStorage.getItem('jwt');
    if (!token) { set({ isLoading: false }); return; }
    // In real app: verify token via GET /api/me
    // For demo: use stored user data
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
