import * as React from "react";
import { createPortal } from "react-dom";
import { Toast, ToastProps } from "./toast";
import { useToastStore } from "@/lib/toast-api";

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  // Only render visible toasts (max 3)
  const visibleToasts = toasts.slice(0, 3);

  return createPortal(
    <div
      className="fixed z-50 flex flex-col gap-3 pointer-events-none"
      style={{
        top: "1rem",
        right: "1rem",
        // Mobile: bottom positioning (above tab bar if present)
        bottom: "auto",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .toast-container {
            top: auto !important;
            bottom: 5rem !important;
            left: 1rem !important;
            right: 1rem !important;
          }
        }
      `}</style>
      <div className="toast-container flex flex-col gap-3">
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};
