'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function AdminCoursesPage() {
  const courses = [
    {
      id: '1',
      title: 'FinOps Fundamentals',
      instructor: 'Sarah Chen',
      students: 1250,
      tier: 'Ignite',
      status: 'active',
    },
    {
      id: '2',
      title: 'Advanced Optimization',
      instructor: 'Mike Johnson',
      students: 890,
      tier: 'Transformate',
      status: 'active',
    },
    {
      id: '3',
      title: 'Cloud Architecture',
      instructor: 'Priya Patel',
      students: 650,
      tier: 'Ignite',
      status: 'active',
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Manage Courses</h1>
          <p className="text-secondary-600">Create and edit courses</p>
        </div>
        <Link href="/admin/courses/new">
          <Button variant="primary">+ Create Course</Button>
        </Link>
      </div>

      {/* Courses List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Course</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Instructor</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Tier</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Students</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-secondary-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-secondary-900">{course.title}</p>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{course.instructor}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      course.tier === 'Transformate'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {course.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{course.students}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
