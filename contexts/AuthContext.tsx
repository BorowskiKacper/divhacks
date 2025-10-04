import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  joinDate: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      email,
      username: email.split('@')[0],
      joinDate: new Date(),
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    
    // Mock registration delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock user creation
    const mockUser: User = {
      id: Math.random().toString(),
      email,
      username,
      joinDate: new Date(),
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    
    // Mock sign out delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};