import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  checkAuthStatus: () => void;
  refreshAuthToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_TOKEN'; payload: { token: string; refreshToken?: string } };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: localStorage.getItem('auth_token'),
  refreshToken: localStorage.getItem('refresh_token'),
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        token: null,
        refreshToken: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.login(email, password);
      
      // Store tokens in localStorage
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });
      
      toast.success('Welcome back!');
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.register(userData);
      
      // Store tokens in localStorage
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });
      
      toast.success('Account created successfully!');
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (!state.token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: state.token,
          refreshToken: state.refreshToken || '',
        },
      });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  }, [state.token, state.refreshToken]);

  const refreshAuthToken = useCallback(async () => {
    if (!state.refreshToken) {
      logout();
      return;
    }

    try {
      const response = await authService.refreshToken(state.refreshToken);
      
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      
      dispatch({
        type: 'SET_TOKEN',
        payload: {
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      logout();
    }
  }, [state.refreshToken, logout]);

  const updateUser = useCallback((userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!state.token) return;

    const tokenRefreshInterval = setInterval(() => {
      refreshAuthToken();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(tokenRefreshInterval);
  }, [state.token, refreshAuthToken]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    checkAuthStatus,
    refreshAuthToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}