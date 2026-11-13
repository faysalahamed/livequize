'use client';

import React from 'react';
import EduSidebar from './EduSidebar';
import EduTopHeader from './EduTopHeader';

export default function EduDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F0F5FA] font-sans antialiased text-slate-800">
      {/* Fixed Left Sidebar */}
      <EduSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <EduTopHeader />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
