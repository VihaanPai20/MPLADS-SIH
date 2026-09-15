import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type GlobalHouseSelection = 'ALL' | 'LOK_SABHA' | 'RAJYA_SABHA';

interface HouseContextType {
  house: GlobalHouseSelection;
  setHouse: (house: GlobalHouseSelection) => void;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

export function HouseProvider({ children }: { children: ReactNode }) {
  const [house, setHouse] = useState<GlobalHouseSelection>('ALL');

  return (
    <HouseContext.Provider value={{ house, setHouse }}>
      {children}
    </HouseContext.Provider>
  );
}

export function useHouse() {
  const context = useContext(HouseContext);
  if (context === undefined) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
}
