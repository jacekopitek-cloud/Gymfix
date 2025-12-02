import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewState } from '../types';

interface NavigationContextType {
  currentView: ViewState;
  viewParams: Record<string, string>;
  navigate: (view: ViewState, params?: Record<string, string>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [viewParams, setViewParams] = useState<Record<string, string>>({});

  const navigate = (view: ViewState, params: Record<string, string> = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <NavigationContext.Provider value={{ currentView, viewParams, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};