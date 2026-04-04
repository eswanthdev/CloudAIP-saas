'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MentorBooking from '@/components/career/MentorBooking';

export default function MentorshipPage() {
  const mentors = [
    {
      id: '1',
      name: 'Sarah Chen',
      expertise: 'Cloud Architecture & Cost Optimization',
      rating: 4.9,
      availability: 'Mon, Wed, Fri 2-6 PM',
    },
    {
      id: '2',
      name: 'Mike Johnson',
      expertise: 'FinOps Strategy & Implementation',
      rating: 4.8,
      availability: 'Tue, Thu, Sat 10 AM-2 PM',
    },
    {
      id: '3',
      name: 'Priya Patel',
      expertise: 'Career Development & Leadership',
      rating: 4.9,
      availability: 'Mon-Fri 1-5 PM',
    },
    {
      id: '4',
      name: 'David Lee',
      expertise: 'Cloud Tools & Automation',
      rating: 4.7,
      availability: 'Wed, Thu, Fri 3-7 PM',
    },
  ];

  const sessions = [
    {
      id: '1',
      mentor: 'Sarah Chen',
      date: '2024-04-20',
      time: '2:00 PM',
      topic: 'Cost Optimization Strategy',
      duration: 60,
      status: 'scheduled' as const,
    },
  ];

  return (
    <ProtectedRoute requiredRole="student">
      <div className="container-max py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">Mentorship</h1>
          <p className="text-lg text-secondary-600">
            Get 1-on-1 guidance from FinOps experts
          </p>
        </div>

        <MentorBooking
          mentors={mentors}
          sessions={sessions}
          onBook={(data) => {
            console.log('Book mentorship:', data);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
