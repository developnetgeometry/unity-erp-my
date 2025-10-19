import * as React from 'react';
import { ConfirmDialog } from './confirmation-dialog';
import { useModalStore } from '@/lib/modal-api';

export const ModalContainer: React.FC = () => {
  const confirmDialog = useModalStore((state) => state.confirmDialog);

  return (
    <>
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          {...confirmDialog}
        />
      )}
    </>
  );
};
