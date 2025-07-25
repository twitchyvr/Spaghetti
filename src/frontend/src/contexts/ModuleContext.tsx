import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Module, ModuleConfig } from '../types';
import { moduleService } from '../services/moduleService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ModuleState {
  modules: Module[];
  availableModules: Module[];
  activeModules: Module[];
  isLoading: boolean;
  currentModule: Module | null;
  moduleConfigs: Record<string, ModuleConfig>;
}

interface ModuleContextType extends ModuleState {
  loadModules: () => Promise<void>;
  activateModule: (moduleId: string) => Promise<void>;
  deactivateModule: (moduleId: string) => Promise<void>;
  updateModuleConfig: (moduleId: string, config: Partial<ModuleConfig>) => Promise<void>;
  setCurrentModule: (module: Module | null) => void;
  getModuleConfig: (moduleId: string) => ModuleConfig | null;
  isModuleActive: (moduleId: string) => boolean;
  refreshModules: () => Promise<void>;
}

type ModuleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MODULES'; payload: Module[] }
  | { type: 'SET_AVAILABLE_MODULES'; payload: Module[] }
  | { type: 'SET_ACTIVE_MODULES'; payload: Module[] }
  | { type: 'SET_CURRENT_MODULE'; payload: Module | null }
  | { type: 'UPDATE_MODULE_CONFIG'; payload: { moduleId: string; config: ModuleConfig } }
  | { type: 'ACTIVATE_MODULE'; payload: string }
  | { type: 'DEACTIVATE_MODULE'; payload: string };

const initialState: ModuleState = {
  modules: [],
  availableModules: [],
  activeModules: [],
  isLoading: false,
  currentModule: null,
  moduleConfigs: {},
};

function moduleReducer(state: ModuleState, action: ModuleAction): ModuleState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_MODULES':
      return { ...state, modules: action.payload };
    
    case 'SET_AVAILABLE_MODULES':
      return { ...state, availableModules: action.payload };
    
    case 'SET_ACTIVE_MODULES':
      return { ...state, activeModules: action.payload };
    
    case 'SET_CURRENT_MODULE':
      return { ...state, currentModule: action.payload };
    
    case 'UPDATE_MODULE_CONFIG':
      return {
        ...state,
        moduleConfigs: {
          ...state.moduleConfigs,
          [action.payload.moduleId]: action.payload.config,
        },
      };
    
    case 'ACTIVATE_MODULE':
      const moduleToActivate = state.availableModules.find(m => m.id === action.payload);
      if (moduleToActivate && !state.activeModules.find(m => m.id === action.payload)) {
        return {
          ...state,
          activeModules: [...state.activeModules, moduleToActivate],
        };
      }
      return state;
    
    case 'DEACTIVATE_MODULE':
      return {
        ...state,
        activeModules: state.activeModules.filter(m => m.id !== action.payload),
        currentModule: state.currentModule?.id === action.payload ? null : state.currentModule,
      };
    
    default:
      return state;
  }
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(moduleReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  const loadModules = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [available, active, configs] = await Promise.all([
        moduleService.getAvailableModules(),
        moduleService.getActiveModules(),
        moduleService.getModuleConfigs(),
      ]);
      
      dispatch({ type: 'SET_AVAILABLE_MODULES', payload: available });
      dispatch({ type: 'SET_ACTIVE_MODULES', payload: active });
      dispatch({ type: 'SET_MODULES', payload: [...available] });
      
      // Set module configs
      configs.forEach(config => {
        dispatch({
          type: 'UPDATE_MODULE_CONFIG',
          payload: { moduleId: config.moduleId, config },
        });
      });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load modules';
      toast.error(message);
      console.error('Failed to load modules:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  const activateModule = useCallback(async (moduleId: string) => {
    try {
      await moduleService.activateModule(moduleId);
      dispatch({ type: 'ACTIVATE_MODULE', payload: moduleId });
      
      const module = state.availableModules.find(m => m.id === moduleId);
      toast.success(`${module?.name || 'Module'} activated successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate module';
      toast.error(message);
      throw error;
    }
  }, [state.availableModules]);

  const deactivateModule = useCallback(async (moduleId: string) => {
    try {
      await moduleService.deactivateModule(moduleId);
      dispatch({ type: 'DEACTIVATE_MODULE', payload: moduleId });
      
      const module = state.activeModules.find(m => m.id === moduleId);
      toast.success(`${module?.name || 'Module'} deactivated successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate module';
      toast.error(message);
      throw error;
    }
  }, [state.activeModules]);

  const updateModuleConfig = useCallback(async (moduleId: string, config: Partial<ModuleConfig>) => {
    try {
      const updatedConfig = await moduleService.updateModuleConfig(moduleId, config);
      dispatch({
        type: 'UPDATE_MODULE_CONFIG',
        payload: { moduleId, config: updatedConfig },
      });
      
      toast.success('Module configuration updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update module configuration';
      toast.error(message);
      throw error;
    }
  }, []);

  const setCurrentModule = useCallback((module: Module | null) => {
    dispatch({ type: 'SET_CURRENT_MODULE', payload: module });
  }, []);

  const getModuleConfig = useCallback((moduleId: string): ModuleConfig | null => {
    return state.moduleConfigs[moduleId] || null;
  }, [state.moduleConfigs]);

  const isModuleActive = useCallback((moduleId: string): boolean => {
    return state.activeModules.some(m => m.id === moduleId);
  }, [state.activeModules]);

  const refreshModules = useCallback(async () => {
    await loadModules();
  }, [loadModules]);

  // Load modules when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadModules();
    }
  }, [isAuthenticated, user, loadModules]);

  const value: ModuleContextType = {
    ...state,
    loadModules,
    activateModule,
    deactivateModule,
    updateModuleConfig,
    setCurrentModule,
    getModuleConfig,
    isModuleActive,
    refreshModules,
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules(): ModuleContextType {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
}