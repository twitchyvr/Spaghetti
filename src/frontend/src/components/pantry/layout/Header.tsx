import React from 'react';
import { Bell, Search, Settings, User, Menu, X } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-brand-light) 100%)',
      borderBottom: '1px solid var(--color-border-primary)',
      boxShadow: 'var(--shadow-sm)',
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 997
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            padding: '12px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-secondary)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-brand-light)';
            e.currentTarget.style.color = 'var(--color-brand-primary)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-primary)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {sidebarOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
        </button>
        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{
              width: '20px',
              height: '20px',
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)'
            }} />
            <input
              type="text"
              placeholder="Search documents, projects, users..."
              style={{
                width: '100%',
                paddingLeft: '44px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-primary)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-base)',
                transition: 'all var(--transition-base)',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-brand-primary)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Header Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button 
            onClick={() => console.log('Notifications clicked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.color = 'var(--color-brand-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <Bell style={{ width: '20px', height: '20px' }} />
          </button>
          
          <button 
            onClick={() => console.log('Settings clicked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              color: 'var(--color-text-secondary)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.color = 'var(--color-brand-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <Settings style={{ width: '20px', height: '20px' }} />
          </button>
          
          <button 
            onClick={() => console.log('Profile clicked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
              border: 'none',
              color: 'white',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <User style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </header>
  );
};