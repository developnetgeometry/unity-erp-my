import * as React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Modal } from './modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  default: {
    icon: Info,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    confirmVariant: 'default' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    confirmVariant: 'default' as const,
  },
  danger: {
    icon: AlertCircle,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-50',
    confirmVariant: 'destructive' as const,
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant={config.confirmVariant} onClick={handleConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={footer}
      dismissible={false}
      showCloseButton={false}
    >
      <div className="flex gap-4">
        <div className={cn('flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center', config.bgClass)}>
          <Icon className={cn('w-6 h-6', config.iconClass)} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
