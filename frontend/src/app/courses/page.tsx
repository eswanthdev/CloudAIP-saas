'use client';

import React, { useState } from 'react';
import { useCourseContext } from '@/store/CourseContext';
import { useAuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/dashboard/CourseCard';
import Loading from '@/components/common/Loading';
import Card from '@/components/common/Card';

export default function CoursesPage() {
  const { courses, loading } = useCourseContext();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<'all' | 'ignite' | 'transformate'>('all');

  const filteredCourses = selectedTier === 'all'
    ? courses
    : courses.filter((c) => c.tier === selectedTier);

  if (loading) {
    return <Loading fullPage message="Loading courses..." />;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container-max py-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">FinOps Courses</h1>
          <p className="text-lg text-secondary-600">
            Learn cloud financial management from industry experts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container-max py-8">
        <div className="flex gap-4 mb-8">
          {(['all', 'ignite', 'transformate'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTier === tier
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
              }`}
            >
              {tier === 'all' ? 'All Courses' : tier === 'ignite' ? 'Ignite' : 'Transformate'}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <p className="text-lg text-secondary-600 mb-4">No courses found in this category.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                tier={course.tier}
                rating={course.rating}
                students={course.students}
                instructor={course.instructor}
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/auth/signup');
                  } else {
                    router.push(`/courses/${course.id}`);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
