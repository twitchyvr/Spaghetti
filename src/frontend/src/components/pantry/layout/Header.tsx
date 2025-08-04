import React from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="app-header" style={{
      background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-light) 100%)',
      borderBottom: '1px solid var(--color-border-primary)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="flex-1 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{
              color: 'var(--color-text-tertiary)'
            }} />
            <input
              type="text"
              placeholder="Search documents, projects, users..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border text-base" style={{
                background: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-primary)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4 ml-6">
          <button className="p-3 rounded-lg transition-all hover:scale-105" style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-secondary)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Bell className="w-5 h-5" />
          </button>
          
          <button className="p-3 rounded-lg transition-all hover:scale-105" style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-secondary)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Settings className="w-5 h-5" />
          </button>
          
          <button className="p-3 rounded-lg transition-all hover:scale-105" style={{
            background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
            border: 'none',
            color: 'white',
            boxShadow: 'var(--shadow-md)'
          }}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};