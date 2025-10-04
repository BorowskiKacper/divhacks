import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AnimalSighting {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  userId: string;
}

interface SightingsContextType {
  sightings: AnimalSighting[];
  addSighting: (sighting: Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>) => void;
  initializeDemoSightings: (latitude: number, longitude: number) => void;
}

const SightingsContext = createContext<SightingsContextType | undefined>(undefined);

export const useSightings = () => {
  const context = useContext(SightingsContext);
  if (!context) {
    throw new Error('useSightings must be used within a SightingsProvider');
  }
  return context;
};

interface SightingsProviderProps {
  children: ReactNode;
}

export const SightingsProvider: React.FC<SightingsProviderProps> = ({ children }) => {
  const [sightings, setSightings] = useState<AnimalSighting[]>([]);

  const addSighting = (newSighting: Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>) => {
    const sighting: AnimalSighting = {
      ...newSighting,
      id: Date.now().toString(),
      timestamp: new Date(),
      userId: 'you'
    };
    setSightings(prev => [sighting, ...prev]);
  };

  const initializeDemoSightings = (latitude: number, longitude: number) => {
    if (sightings.length === 0) {
      const demoSightings: AnimalSighting[] = [
        {
          id: '1',
          name: 'Red Cardinal',
          type: 'Bird',
          latitude: latitude + 0.002,
          longitude: longitude + 0.002,
          timestamp: new Date(Date.now() - 3600000),
          userId: 'demo'
        },
        {
          id: '2',
          name: 'Gray Squirrel',
          type: 'Mammal',
          latitude: latitude - 0.002,
          longitude: longitude - 0.002,
          timestamp: new Date(Date.now() - 7200000),
          userId: 'demo'
        }
      ];
      setSightings(demoSightings);
    }
  };

  return (
    <SightingsContext.Provider value={{ sightings, addSighting, initializeDemoSightings }}>
      {children}
    </SightingsContext.Provider>
  );
};