import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type RoleSelection = 'Ministry' | 'State Nodal Authority' | 'District Authority' | 'Member of Parliament' | 'Administrator';

interface RoleContextType {
  role: RoleSelection;
  setRole: (role: RoleSelection) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function getInitialRole(): RoleSelection {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'ministry') return 'Ministry';
      if (payload.role === 'state_nodal_authority') return 'State Nodal Authority';
      if (payload.role === 'district_authority') return 'District Authority';
      if (payload.role === 'member_of_parliament') return 'Member of Parliament';
      if (payload.role === 'administrator') return 'Administrator';
    }
  } catch (e) {
    // Ignore decode errors
  }
  return 'Ministry';
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleSelection>(getInitialRole);

  useEffect(() => {
    // Sync role if token changes (e.g. login/logout)
    const handleStorage = () => {
      setRole(getInitialRole());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
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
