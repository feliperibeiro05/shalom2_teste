// src/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Navbar } from '../components/dashboard/Navbar';

export const DashboardLayout: React.FC = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    // Removido 'min-h-screen' e 'flex' para permitir a rolagem nativa do corpo da página
    <div className="bg-gray-900"> 
      <div className="flex">
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          onToggle={() => setSidebarExpanded(!isSidebarExpanded)} 
        />
        <div className="flex-1 flex flex-col">
          <Navbar />
          {/* Removido 'overflow-auto' e 'flex-1' para permitir a rolagem completa do corpo */}
          <main className="p-6"> 
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};