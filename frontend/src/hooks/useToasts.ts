import { create } from 'zustand';

export type Toast = {
  id: string;
  message: string;
  kind?: 'success' | 'error' | 'info';
  createdAt: number;
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, kind?: Toast['kind']) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function nowId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, kind = 'info') => {
    const toast: Toast = { id: nowId(), message, kind, createdAt: Date.now() };
    set((state) => ({ toasts: [...state.toasts, toast].slice(-5) }));
    window.setTimeout(() => {
      get().remove(toast.id);
    }, 3000);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

