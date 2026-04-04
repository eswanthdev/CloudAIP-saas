'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlacementTracker from '@/components/career/PlacementTracker';

export default function PlacementsPage() {
  const placements = [
    {
      id: '1',
      stage: 'Interview' as const,
      company: 'TechCorp',
      role: 'Senior FinOps Engineer',
      salary: '$145,000',
      status: 'active' as const,
      date: 'Apr 10, 2024',
    },
    {
      id: '2',
      stage: 'Application' as const,
      company: 'CloudSys',
      role: 'FinOps Consultant',
      status: 'active' as const,
      date: 'Apr 08, 2024',
    },
  ];

  return (
    <ProtectedRoute requiredRole="student">
      <div className="container-max py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">Placement Tracker</h1>
          <p className="text-lg text-secondary-600">
            Track your job applications and interviews
          </p>
        </div>

        <PlacementTracker placements={placements} />
      </div>
    </ProtectedRoute>
  );
}
