import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseService, EnhancedAnimalSighting } from '../services/supabaseService';
import { AnimalDetectionResult } from '../services/geminiService';
import { useAuth } from './AuthContext';

export interface AnimalSighting {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  userId: string;
  // AI Analysis data
  confidence?: number;
  description?: string;
  species?: string;
  creatureType?: string;
  keyCharacteristics?: string;
  rarity?: string;
  isAnimal?: boolean;
  imageUri?: string;
}

interface SightingsContextType {
  sightings: AnimalSighting[];
  addSighting: (sighting: Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>, aiResult?: AnimalDetectionResult, imageUri?: string) => Promise<void>;
  updateSighting: (sightingId: string, updates: Partial<Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>>) => Promise<void>;
  deleteSighting: (sightingId: string) => Promise<void>;
  getSightingById: (sightingId: string) => AnimalSighting | undefined;
  initializeDemoSightings: (latitude: number, longitude: number) => void;
  refreshSightings: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const addSighting = async (
    newSighting: Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>,
    aiResult?: AnimalDetectionResult,
    imageUri?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the actual logged-in user's ID, fallback to 'you' if no user
      const userId = user?.id || 'you';
      
      const enhancedSighting = await supabaseService.createSighting(
        {
          ...newSighting,
          userId: userId,
          confidence: newSighting.confidence || 0,
          isAnimal: newSighting.isAnimal || false,
        },
        aiResult,
        imageUri
      );
      
      setSightings(prev => [enhancedSighting, ...prev]);
    } catch (err) {
      console.error('Error adding sighting:', err);
      setError(err instanceof Error ? err.message : 'Failed to add sighting');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSighting = async (
    sightingId: string,
    updates: Partial<Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedSighting = await supabaseService.updateSighting(sightingId, updates);
      
      setSightings(prev => 
        prev.map(sighting => 
          sighting.id === sightingId ? updatedSighting : sighting
        )
      );
    } catch (err) {
      console.error('Error updating sighting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update sighting');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSighting = async (sightingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await supabaseService.deleteSighting(sightingId);
      
      setSightings(prev => prev.filter(sighting => sighting.id !== sightingId));
    } catch (err) {
      console.error('Error deleting sighting:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sighting');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSightingById = (sightingId: string): AnimalSighting | undefined => {
    return sightings.find(sighting => sighting.id === sightingId);
  };

  const refreshSightings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the actual logged-in user's ID, fallback to 'you' if no user
      const userId = user?.id || 'you';
      const userSightings = await supabaseService.getSightingsByUser(userId);
      setSightings(userSightings);
    } catch (err) {
      console.error('Error refreshing sightings:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh sightings');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDemoSightings = (latitude: number, longitude: number) => {
    // This function is kept for backward compatibility but now relies on Supabase
    // Demo sightings should be created in the database instead
    console.log('Demo sightings initialization - now handled by Supabase');
  };

  // Load sightings on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshSightings();
    }
  }, [user]);

  return (
    <SightingsContext.Provider value={{ 
      sightings, 
      addSighting, 
      updateSighting,
      deleteSighting,
      getSightingById,
      initializeDemoSightings, 
      refreshSightings,
      isLoading,
      error
    }}>
      {children}
    </SightingsContext.Provider>
  );
};