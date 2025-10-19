import { create } from 'zustand';
import type { ConfirmDialogProps } from '@/components/overlay/confirmation-dialog';

interface ModalState {
  confirmDialog: Omit<ConfirmDialogProps, 'isOpen'> | null;
  showConfirm: (props: Omit<ConfirmDialogProps, 'isOpen' | 'onConfirm' | 'onCancel'>) => Promise<boolean>;
  closeConfirm: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  confirmDialog: null,
  showConfirm: (props) => {
    return new Promise<boolean>((resolve) => {
      set({
        confirmDialog: {
          ...props,
          onConfirm: () => {
            resolve(true);
            set({ confirmDialog: null });
          },
          onCancel: () => {
            resolve(false);
            set({ confirmDialog: null });
          },
        },
      });
    });
  },
  closeConfirm: () => set({ confirmDialog: null }),
}));

class ModalAPI {
  async confirm(props: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'warning' | 'danger';
  }): Promise<boolean> {
    return useModalStore.getState().showConfirm(props);
  }
}

export const modal = new ModalAPI();
