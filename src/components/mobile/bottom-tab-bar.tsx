import * as React from "react";
import { Home, Calendar, ClipboardCheck, Grid3x3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type TabValue = 'dashboard' | 'leave' | 'approvals' | 'more' | 'profile';

interface BottomTabBarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  badges?: {
    leave?: number;
    approvals?: number;
  };
  userAvatar?: string;
  userName?: string;
}

interface TabConfig {
  id: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid?: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { id: 'more', label: 'More', icon: Grid3x3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomTabBar({
  activeTab,
  onTabChange,
  badges,
  userAvatar,
  userName = 'User',
}: BottomTabBarProps) {
  const handleTabClick = (tab: TabValue) => {
    // Optional haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onTabChange(tab);
  };

  const renderBadge = (tabId: TabValue) => {
    const count = badges?.[tabId as keyof typeof badges];
    if (!count || count === 0) return null;

    return (
      <div className="absolute -top-1 -right-1 h-[18px] min-w-[18px] px-1 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-semibold">
        {count > 9 ? '9+' : count}
      </div>
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      role="tablist"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-sm md:hidden"
      style={{
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full relative",
                "transition-all duration-150",
                "min-h-[44px]", // Minimum touch target
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              {/* Icon with Badge */}
              <div className="relative">
                {tab.id === 'profile' ? (
                  <Avatar className={cn(
                    "h-6 w-6 transition-transform duration-150",
                    isActive && "scale-110 ring-2 ring-primary ring-offset-2"
                  )}>
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon
                    className={cn(
                      "transition-all duration-150",
                      isActive ? "h-6 w-6 scale-110" : "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                )}
                {renderBadge(tab.id)}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[12px] transition-all duration-150",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground font-normal"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
