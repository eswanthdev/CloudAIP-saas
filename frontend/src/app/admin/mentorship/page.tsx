'use client';

import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function AdminMentorshipPage() {
  const sessions = [
    {
      id: '1',
      studentName: 'John Doe',
      mentorName: 'Sarah Chen',
      date: '2024-04-15',
      time: '2:00 PM',
      duration: 60,
      topic: 'Cost Optimization Strategy',
      status: 'scheduled',
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      mentorName: 'Mike Johnson',
      date: '2024-04-18',
      time: '1:00 PM',
      duration: 45,
      topic: 'Career Path Discussion',
      status: 'scheduled',
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      mentorName: 'Priya Patel',
      date: '2024-04-10',
      time: '3:00 PM',
      duration: 60,
      topic: 'FinOps Implementation',
      status: 'completed',
    },
  ];

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Mentorship Sessions</h1>
        <p className="text-secondary-600">Manage mentoring sessions and mentors</p>
      </div>

      {/* Sessions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Student</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Mentor</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Topic</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Date & Time</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Duration</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 font-medium text-secondary-900">{session.studentName}</td>
                  <td className="px-6 py-4 text-secondary-600">{session.mentorName}</td>
                  <td className="px-6 py-4 text-secondary-600">{session.topic}</td>
                  <td className="px-6 py-4 text-secondary-600">
                    {session.date} at {session.time}
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{session.duration} min</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[session.status as keyof typeof statusColors]}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mentors List */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Available Mentors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Sarah Chen', expertise: 'Cloud Architecture', sessions: 25 },
              { name: 'Mike Johnson', expertise: 'FinOps Strategy', sessions: 18 },
              { name: 'Priya Patel', expertise: 'Career Development', sessions: 21 },
            ].map((mentor, idx) => (
              <div key={idx} className="p-4 border border-secondary-200 rounded-lg">
                <p className="font-semibold text-secondary-900">{mentor.name}</p>
                <p className="text-sm text-secondary-600 mb-2">{mentor.expertise}</p>
                <p className="text-xs text-secondary-500">{mentor.sessions} sessions completed</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
