import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const adminItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Leads', href: '/admin/leads', icon: '📝', badge: '12' },
  { label: 'Enrollments', href: '/admin/enrollments', icon: '👥' },
  { label: 'Mentorship', href: '/admin/mentorship', icon: '👨‍🏫' },
];

export const metadata = {
  title: 'Admin Dashboard | FinOps Academy',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex gap-0 min-h-[calc(100vh-64px)]">
        <Sidebar items={adminItems} title="Admin" />
        <main className="flex-1 md:ml-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
