import * as React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: (id: string) => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgClass: "bg-green-50",
    borderClass: "border-green-500",
    textClass: "text-green-800",
    iconClass: "text-green-600",
  },
  error: {
    icon: XCircle,
    bgClass: "bg-red-50",
    borderClass: "border-red-500",
    textClass: "text-red-800",
    iconClass: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-amber-50",
    borderClass: "border-amber-500",
    textClass: "text-amber-800",
    iconClass: "text-amber-600",
  },
  info: {
    icon: Info,
    bgClass: "bg-blue-50",
    borderClass: "border-blue-500",
    textClass: "text-blue-800",
    iconClass: "text-blue-600",
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  action,
  onDismiss,
}) => {
  const [isPaused, setIsPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const timerRef = React.useRef<NodeJS.Timeout>();
  const startTimeRef = React.useRef<number>(Date.now());
  const remainingTimeRef = React.useRef<number>(duration);

  const config = typeConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (duration === 0) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismiss(id);
      }, remainingTimeRef.current);
    };

    if (!isPaused) {
      startTimer();

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(newProgress);
      }, 16);

      return () => {
        clearTimeout(timerRef.current);
        clearInterval(progressInterval);
      };
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    }
  }, [isPaused, duration, id, onDismiss]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        "w-full md:max-w-[400px] min-h-[64px] rounded-lg border-2 shadow-md",
        "p-4 animate-slide-in-right",
        config.bgClass,
        config.borderClass
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex gap-3 items-start">
        <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconClass)} />
        
        <div className="flex-1 min-w-0">
          <div className={cn("font-semibold text-sm", config.textClass)}>
            {title}
          </div>
          {description && (
            <div className={cn("text-sm mt-1", config.textClass)}>
              {description}
            </div>
          )}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onDismiss(id);
              }}
              className={cn(
                "text-sm font-medium mt-2 underline hover:no-underline",
                config.textClass
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(id)}
          aria-label="Close notification"
          className={cn(
            "shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity",
            config.iconClass
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {duration > 0 && (
        <div className="mt-2 h-1 bg-black/10 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all", config.borderClass.replace('border-', 'bg-'))}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
