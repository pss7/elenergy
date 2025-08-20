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

  const savedData = localStorage.getItem(STORAGE_KEY);
  const initialData: Controller[] = savedData ? JSON.parse(savedData) : controllerData;
  const [controllers, setControllers] = useState<Controller[]>(initialData);

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
  if (!context) {
    throw new Error('Context가 없습니다.');
  }
  return context;
}
