import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Enterprise Docs</h1>
          <div className="text-sm text-muted-foreground">
            Logged in
          </div>
        </div>
      </nav>
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
}