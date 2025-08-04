
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
    <div className="flex h-screen bg-gray-50">
      {/* FIXED SIDEBAR - Proper Scrolling */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <Logo />
        </div>
        
        {/* SCROLLABLE NAVIGATION - KEY FIX */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
          <NavigationItems />
        </nav>
        
        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200">
          <UserProfile />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-80">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout;
