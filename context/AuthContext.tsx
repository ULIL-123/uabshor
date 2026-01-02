
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (username: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default credentials
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin123' });

  useEffect(() => {
    // Check login status
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    // Load stored credentials if they exist
    const storedCreds = localStorage.getItem('adminCredentials');
    if (storedCreds) {
      setCredentials(JSON.parse(storedCreds));
    }

    setIsLoading(false);
  }, []);

  const login = (username: string, password: string) => {
    if (username === credentials.username && password === credentials.password) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    // 1. Remove auth token
    localStorage.removeItem('isAdminAuthenticated');
    
    // 2. Update state
    setIsAuthenticated(false);

    // 3. Force a hard reload to clear all in-memory states (like routes/forms)
    // This ensures the user is sent back to the Login component cleanly.
    window.location.reload();
  };

  const updateCredentials = (username: string, password: string) => {
    const newCreds = { username, password };
    setCredentials(newCreds);
    localStorage.setItem('adminCredentials', JSON.stringify(newCreds));
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
