import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type RoleSelection = 'Ministry' | 'State Nodal Authority' | 'District Authority' | 'Member of Parliament' | 'Administrator';

interface RoleContextType {
  role: RoleSelection;
  setRole: (role: RoleSelection) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleSelection>('Ministry');

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
