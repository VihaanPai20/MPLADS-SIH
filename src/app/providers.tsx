import type { ReactNode } from 'react';
import { HouseProvider } from '../contexts/HouseContext';
import { RoleProvider } from '../contexts/RoleContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HouseProvider>
      <RoleProvider>
        {children}
      </RoleProvider>
    </HouseProvider>
  );
}
