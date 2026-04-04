import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const dashboardItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'My Courses', href: '/dashboard/courses', icon: '📚' },
  { label: 'Progress', href: '/dashboard/progress', icon: '📈' },
  { label: 'Career', href: '/career', icon: '🎯' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export const metadata = {
  title: 'Dashboard | FinOps Academy',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex gap-0 min-h-[calc(100vh-64px)]">
        <Sidebar items={dashboardItems} title="Dashboard" />
        <main className="flex-1 md:ml-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
