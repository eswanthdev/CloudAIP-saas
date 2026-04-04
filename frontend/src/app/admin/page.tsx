'use client';

import React from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import Card from '@/components/common/Card';

export default function AdminDashboard() {
  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Admin Dashboard</h1>
        <p className="text-secondary-600">Manage courses, students, and platform analytics</p>
      </div>

      {/* Stats */}
      <StatsCards
        stats={[
          { label: 'Total Courses', value: 5, icon: '📚', trend: { direction: 'up', percentage: 20 } },
          { label: 'Active Students', value: 2543, icon: '👥', trend: { direction: 'up', percentage: 45 } },
          { label: 'Total Enrollments', value: 8234, icon: '📊', trend: { direction: 'up', percentage: 32 } },
          { label: 'Revenue (This Month)', value: '$125K', icon: '💰', trend: { direction: 'up', percentage: 18 } },
        ]}
        columns={4}
      />

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/courses/new" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
              <p className="font-semibold text-secondary-900 mb-1">➕ Create Course</p>
              <p className="text-sm text-secondary-600">Add a new course to the platform</p>
            </a>
            <a href="/admin/leads" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
              <p className="font-semibold text-secondary-900 mb-1">📧 View Leads</p>
              <p className="text-sm text-secondary-600">Check new service requests</p>
            </a>
            <a href="/admin/enrollments" className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
              <p className="font-semibold text-secondary-900 mb-1">👥 View Enrollments</p>
              <p className="text-sm text-secondary-600">Track student enrollment data</p>
            </a>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Recent Enrollments</h3>
            <div className="space-y-3">
              {[
                { student: 'John Doe', course: 'FinOps Fundamentals', tier: 'Ignite', date: '2 hours ago' },
                { student: 'Jane Smith', course: 'Advanced Optimization', tier: 'Transformate', date: '5 hours ago' },
                { student: 'Mike Johnson', course: 'FinOps Fundamentals', tier: 'Ignite', date: '1 day ago' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-secondary-50 rounded">
                  <div>
                    <p className="font-medium text-secondary-900">{item.student}</p>
                    <p className="text-sm text-secondary-600">{item.course}</p>
                  </div>
                  <span className="text-xs text-secondary-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-secondary-900 mb-4">Popular Courses</h3>
            <div className="space-y-3">
              {[
                { name: 'FinOps Fundamentals', students: 1250, completion: 68 },
                { name: 'Cost Optimization', students: 890, completion: 72 },
                { name: 'Cloud Architecture', students: 650, completion: 55 },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-secondary-50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-secondary-900">{item.name}</p>
                    <span className="text-sm text-secondary-600">{item.students} students</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${item.completion}%` }}
                    />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">{item.completion}% completion</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
