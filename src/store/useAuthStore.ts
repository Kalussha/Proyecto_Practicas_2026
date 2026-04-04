import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Ventas' | 'Soporte' | 'Alta directiva';

interface AuthStore {
  role: UserRole;
  userName: string;
  setAuth: (role: UserRole, userName: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      role: 'Soporte',
      userName: 'Soporte Admin',
      setAuth: (role, userName) => set({ role, userName }),
    }),
    {
      name: 'sgfg-auth-storage',
    }
  )
);
