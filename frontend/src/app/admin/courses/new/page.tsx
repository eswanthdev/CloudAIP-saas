'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      console.log('Create course:', data);
      router.push('/admin/courses');
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  return (
    <div className="flex-1 p-6">
      <CourseForm onSubmit={handleSubmit} />
    </div>
  );
}
