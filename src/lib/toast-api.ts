import { create } from 'zustand';
import type { ToastProps } from '@/components/feedback/toast';

interface ToastStore {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => string;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [{ ...toast, id, onDismiss: () => {} }, ...state.toasts],
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastAPI {
  private addToast = useToastStore.getState().addToast;

  success(title: string, options?: ToastOptions): string {
    return this.addToast({
      type: 'success',
      title,
      ...options,
    });
  }

  error(title: string, options?: ToastOptions): string {
    return this.addToast({
      type: 'error',
      title,
      duration: options?.duration ?? 0, // Errors don't auto-dismiss
      ...options,
    });
  }

  warning(title: string, options?: ToastOptions): string {
    return this.addToast({
      type: 'warning',
      title,
      duration: options?.duration ?? 6000,
      ...options,
    });
  }

  info(title: string, options?: ToastOptions): string {
    return this.addToast({
      type: 'info',
      title,
      ...options,
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> {
    const loadingId = this.info(messages.loading, { duration: 0 });

    return promise
      .then((data) => {
        useToastStore.getState().removeToast(loadingId);
        this.success(messages.success);
        return data;
      })
      .catch((error) => {
        useToastStore.getState().removeToast(loadingId);
        this.error(messages.error);
        throw error;
      });
  }
}

export const toast = new ToastAPI();
