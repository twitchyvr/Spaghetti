
import React, { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { NavigationItems } from '../../navigation/NavigationItems';
import { UserProfile } from '../user/UserProfile';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <div className="app-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            display: isMobile ? 'block' : 'none'
          }}
        />
      )}
      
      {/* Sidebar - Using Theme System */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-primary)',
        borderRight: '1px solid var(--color-border-primary)',
        zIndex: 999,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--transition-base)',
        boxShadow: sidebarOpen ? 'var(--shadow-xl)' : 'none'
      }}>
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
        <nav style={{
          flex: 1,
          padding: '24px 16px',
          background: 'var(--color-bg-primary)',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0 // Critical for flexbox scrolling
        }}>
          <NavigationItems onNavigate={() => isMobile && setSidebarOpen(false)} />
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
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen && !isMobile ? '280px' : '0',
        transition: 'margin-left var(--transition-base)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main style={{
          flex: 1,
          padding: '24px',
          background: 'var(--color-bg-secondary)',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout;
