import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const toastStore = create<ToastState>()(
  persist(
    (set) => ({
      toasts: [],
      showToast: (message, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 2500);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'toast-storage', partialize: () => ({}) }
  )
);

export const useToastStore = toastStore;
export const useToastActions = () => toastStore((state) => ({
  showToast: state.showToast,
  removeToast: state.removeToast,
}));
export const showToast = (message: string, type?: ToastType) => 
  toastStore.getState().showToast(message, type);
