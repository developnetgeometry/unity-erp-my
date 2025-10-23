import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

type ActiveRole = 'super_admin' | 'employee';

interface RoleContextType {
  activeRole: ActiveRole;
  availableRoles: string[];
  switchRole: (role: ActiveRole) => void;
  canAccessAdminFeatures: boolean;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_KEY = 'erp_one_active_role';

const ADMIN_ROLES = ['super_admin', 'company_admin', 'hr_manager', 'finance_manager'];

export function RoleProvider({ children }: { children: ReactNode }) {
  const { data: userRoles, isLoading } = useUserRoles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeRole, setActiveRole] = useState<ActiveRole>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as ActiveRole) || 'super_admin';
  });

  // Extract available roles from user_roles data
  const availableRoles = useMemo(() => {
    return userRoles?.map(r => r.role) || [];
  }, [userRoles]);

  // Check if user can access admin features
  const canAccessAdminFeatures = useMemo(() => {
    return availableRoles.some(role => ADMIN_ROLES.includes(role));
  }, [availableRoles]);

  // Validate and set initial role on mount
  useEffect(() => {
    if (!userRoles || userRoles.length === 0) return;

    const savedRole = localStorage.getItem(STORAGE_KEY) as ActiveRole;
    
    // If user has admin roles, allow admin view
    if (canAccessAdminFeatures) {
      // If saved role is valid, use it; otherwise default to super_admin
      if (savedRole && (savedRole === 'super_admin' || savedRole === 'employee')) {
        setActiveRole(savedRole);
      } else {
        setActiveRole('super_admin');
        localStorage.setItem(STORAGE_KEY, 'super_admin');
      }
    } else {
      // User only has employee role, force employee view
      setActiveRole('employee');
      localStorage.setItem(STORAGE_KEY, 'employee');
    }
  }, [userRoles, canAccessAdminFeatures]);

  const switchRole = (role: ActiveRole) => {
    // Only allow switching to admin view if user has admin roles
    if (role === 'super_admin' && !canAccessAdminFeatures) {
      console.warn('User does not have admin privileges');
      return;
    }

    setActiveRole(role);
    localStorage.setItem(STORAGE_KEY, role);
    
    // Invalidate queries that might be role-dependent
    queryClient.invalidateQueries({ queryKey: ['sidebar-modules'] });
    
    // Navigate to appropriate dashboard
    navigate(role === 'employee' ? '/dashboard' : '/hr/dashboard');
  };

  const value: RoleContextType = {
    activeRole,
    availableRoles,
    switchRole,
    canAccessAdminFeatures,
    loading: isLoading,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
