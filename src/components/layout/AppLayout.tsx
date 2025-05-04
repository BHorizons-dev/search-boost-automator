
import React, { useState } from 'react';
import { SideNav } from './SideNav';
import { TopNav } from './TopNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SideNav open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
