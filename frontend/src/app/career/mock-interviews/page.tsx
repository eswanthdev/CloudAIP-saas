'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MockInterviewScheduler from '@/components/career/MockInterviewScheduler';

export default function MockInterviewsPage() {
  const mockInterviews = [
    {
      id: '1',
      date: '2024-04-15',
      time: '2:00 PM',
      mentor: 'Sarah Chen',
      topic: 'Cost Optimization Strategy',
      status: 'scheduled' as const,
    },
  ];

  return (
    <ProtectedRoute requiredRole="student">
      <div className="container-max py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">Mock Interviews</h1>
          <p className="text-lg text-secondary-600">
            Practice real-world FinOps scenarios and get feedback from mentors
          </p>
        </div>

        <MockInterviewScheduler
          interviews={mockInterviews}
          onSchedule={(data) => {
            console.log('Schedule mock interview:', data);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
