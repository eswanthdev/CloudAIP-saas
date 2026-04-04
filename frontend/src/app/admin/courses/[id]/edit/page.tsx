'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseForm from '@/components/admin/CourseForm';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function EditCoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'course' | 'modules'>('course');

  const courseData = {
    title: 'FinOps Fundamentals',
    description: 'Learn the basics of cloud financial management',
    tier: 'ignite',
    price: 499,
    instructor: 'Sarah Chen',
    duration: 40,
  };

  const handleSubmit = async (data: any) => {
    try {
      console.log('Update course:', data);
      router.push('/admin/courses');
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('course')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'course'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Course Details
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'modules'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Modules & Lessons
        </button>
      </div>

      {/* Content */}
      {activeTab === 'course' && (
        <CourseForm initialData={courseData} onSubmit={handleSubmit} />
      )}

      {activeTab === 'modules' && (
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Manage Modules & Lessons</h2>
            <p className="text-secondary-600 mb-4">
              Add, edit, or remove modules and lessons for this course.
            </p>
            <Button variant="primary">+ Add Module</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
