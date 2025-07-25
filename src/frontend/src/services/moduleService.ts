import { Module, ModuleConfig } from '../types';
import { config } from '../config';

class ModuleService {
  private baseUrl = config.apiBaseUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAvailableModules(): Promise<Module[]> {
    const response = await fetch(`${this.baseUrl}/modules/available`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available modules');
    }

    return response.json();
  }

  async getActiveModules(): Promise<Module[]> {
    const response = await fetch(`${this.baseUrl}/modules/active`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active modules');
    }

    return response.json();
  }

  async getModuleConfigs(): Promise<ModuleConfig[]> {
    const response = await fetch(`${this.baseUrl}/modules/configs`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch module configurations');
    }

    return response.json();
  }

  async activateModule(moduleId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/activate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to activate module' }));
      throw new Error(error.message || 'Failed to activate module');
    }
  }

  async deactivateModule(moduleId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/deactivate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to deactivate module' }));
      throw new Error(error.message || 'Failed to deactivate module');
    }
  }

  async updateModuleConfig(moduleId: string, config: Partial<ModuleConfig>): Promise<ModuleConfig> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/config`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update module configuration' }));
      throw new Error(error.message || 'Failed to update module configuration');
    }

    return response.json();
  }

  async getModuleStatus(moduleId: string): Promise<{ isActive: boolean; health: string }> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/status`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get module status');
    }

    return response.json();
  }

  async installModule(moduleId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/install`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to install module' }));
      throw new Error(error.message || 'Failed to install module');
    }
  }

  async uninstallModule(moduleId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/uninstall`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to uninstall module' }));
      throw new Error(error.message || 'Failed to uninstall module');
    }
  }
}

export const moduleService = new ModuleService();