
import React from 'react';
import { Logo } from '../Logo';
import { NavigationItems } from '../navigation/NavigationItems';
import { UserProfile } from '../user/UserProfile';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebarOpen }) => {
  return (
    <div className="app-layout">
      {/* Sidebar - Using Theme System */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header - Fixed */}
        <div className="sidebar-header flex-shrink-0 p-6 border-b" style={{
          borderColor: 'var(--color-border-primary)',
          background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)'
        }}>
          <div className="text-white">
            <Logo />
          </div>
        </div>
        
        {/* SCROLLABLE NAVIGATION */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto" style={{
          background: 'var(--color-bg-primary)',
          borderRight: '1px solid var(--color-border-primary)'
        }}>
          <NavigationItems />
        </nav>
        
        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t" style={{
          borderColor: 'var(--color-border-primary)',
          background: 'var(--color-bg-secondary)'
        }}>
          <UserProfile />
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-main">
        <Header />
        <main className="app-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout;
