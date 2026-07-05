import { create } from 'zustand';

export const useStore = create((set) => ({
  view: 'VAULT_LOCK', // 'VAULT_LOCK' | 'TIMELINE' | 'EDITOR' | 'SEARCH'
  cryptoKey: null,
  user: null,
  selectedNoteId: null,

  setView: (view) => set({ view }),
  setCryptoKey: (cryptoKey) => set({ cryptoKey }),
  setUser: (user) => set({ user }),
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),

  // Clear sensitive data
  lockVault: () => set({ view: 'VAULT_LOCK', cryptoKey: null, selectedNoteId: null }),
}));
