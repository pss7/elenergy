import { createContext, useContext, useState, useEffect } from 'react';
import controllerData from '../data/Controllers';
import type { Controller } from '../data/Controllers';

type ControllerContextType = {
  controllers: Controller[];
  setControllers: React.Dispatch<React.SetStateAction<Controller[]>>;
};

const ControllerContext = createContext<ControllerContextType | null>(null);

const STORAGE_KEY = 'controllerData';

export function ControllerProvider({ children }: { children: React.ReactNode }) {
  
  const [controllers, setControllers] = useState<Controller[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : controllerData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(controllers));
  }, [controllers]);

  return (
    <ControllerContext.Provider value={{ controllers, setControllers }}>
      {children}
    </ControllerContext.Provider>
  );
}

export function useControllerData() {
  const context = useContext(ControllerContext);
  if (!context) throw new Error('ControllerContext가 없습니다.');
  return context;
}
