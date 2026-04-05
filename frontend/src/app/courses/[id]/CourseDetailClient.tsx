'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/store/AuthContext';
import { useCourseContext } from '@/store/CourseContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import { TIERS, MODULES } from '@/lib/constants';

export default function CourseDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { courses, enrollCourse, loading: courseLoading } = useCourseContext();
  const [selectedTier, setSelectedTier] = useState('ignite');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const course = courses.find((c) => c.id === params.id);
  const modules = MODULES;

  const handleEnroll = async () => {
    if (!user) {
      router.push('/auth/signup');
      return;
    }

    setIsEnrolling(true);
    try {
      await enrollCourse(params.id as string, selectedTier);
      router.push(`/courses/${params.id}/learn`);
    } catch (err) {
      console.error('Enrollment failed:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (courseLoading || !course) {
    return <Loading fullPage message="Loading course details..." />;
  }

  const tierInfo = TIERS[selectedTier as keyof typeof TIERS];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container-max py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold text-secondary-900 mb-4">{course.title}</h1>
              <p className="text-lg text-secondary-600 mb-6">{course.description}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-secondary-600">Instructor</p>
                  <p className="font-medium text-secondary-900">{course.instructor}</p>
                </div>
                <div>
                  <p className="text-secondary-600">Duration</p>
                  <p className="font-medium text-secondary-900">{course.duration} hours</p>
                </div>
                <div>
                  <p className="text-secondary-600">Rating</p>
                  <p className="font-medium text-secondary-900">⭐ {course.rating}/5</p>
                </div>
                <div>
                  <p className="text-secondary-600">Students</p>
                  <p className="font-medium text-secondary-900">{course.students.toLocaleString()}+</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Choose Your Tier</h3>

                <div className="space-y-3 mb-6">
                  {Object.entries(TIERS).map(([key, tier]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTier(key)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedTier === key
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-secondary-300 hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-secondary-900">{tier.name}</p>
                          <p className="text-sm text-secondary-600 mt-1">{tier.description}</p>
                        </div>
                        <p className="font-bold text-primary-600">${tier.price}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {tierInfo && (
                  <>
                    <ul className="space-y-2 mb-6 text-sm">
                      {tierInfo.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="text-secondary-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant="primary"
                      fullWidth
                      isLoading={isEnrolling}
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="container-max py-12">
        <h2 className="text-3xl font-bold text-secondary-900 mb-8">Curriculum</h2>
        <div className="space-y-4">
          {modules.map((module, idx) => (
            <Card key={module.id}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Module {idx + 1}: {module.title}
                </h3>
                <p className="text-secondary-600 mb-6">{module.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                      <span className="text-lg">
                        {lesson.type === 'video' && '🎬'}
                        {lesson.type === 'lab' && '🧪'}
                        {lesson.type === 'quiz' && '✓'}
                        {lesson.type === 'reading' && '📖'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{lesson.title}</p>
                        <p className="text-xs text-secondary-500">{lesson.duration}m • {lesson.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
