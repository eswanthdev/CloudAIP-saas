'use client';

import React from 'react';
import EnrollmentTable from '@/components/admin/EnrollmentTable';

export default function AdminEnrollmentsPage() {
  const enrollments = [
    {
      id: '1',
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      courseName: 'FinOps Fundamentals',
      tier: 'ignite',
      enrolledAt: '2024-03-15',
      progress: 65,
      status: 'active' as const,
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentEmail: 'jane@example.com',
      courseName: 'Advanced Optimization',
      tier: 'transformate',
      enrolledAt: '2024-02-20',
      progress: 100,
      status: 'completed' as const,
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      studentEmail: 'mike@example.com',
      courseName: 'FinOps Fundamentals',
      tier: 'ignite',
      enrolledAt: '2024-03-10',
      progress: 25,
      status: 'active' as const,
    },
    {
      id: '4',
      studentName: 'Sarah Williams',
      studentEmail: 'sarah@example.com',
      courseName: 'Cloud Architecture',
      tier: 'transformate',
      enrolledAt: '2024-02-01',
      progress: 0,
      status: 'dropped' as const,
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Student Enrollments</h1>
        <p className="text-secondary-600">Monitor student progress and engagement</p>
      </div>

      {/* Enrollments Table */}
      <EnrollmentTable enrollments={enrollments} />
    </div>
  );
}
