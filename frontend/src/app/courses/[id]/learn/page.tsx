'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LessonList from '@/components/lms/LessonList';
import CoursePlayer from '@/components/lms/CoursePlayer';
import ProgressBar from '@/components/dashboard/ProgressBar';
import Card from '@/components/common/Card';
import { MODULES } from '@/lib/constants';
import { useProgress } from '@/hooks/useProgress';

export default function LearnPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const { markLessonComplete, getCompletedLessons, getOverallProgress } = useProgress(courseId);

  const completedLessons = getCompletedLessons();
  const overallProgress = getOverallProgress();

  const selectedLesson = MODULES.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId);
  const firstLesson = MODULES[0]?.lessons[0];

  const currentLesson = selectedLesson || firstLesson;

  if (!currentLesson) {
    return <div>No lessons available</div>;
  }

  const handleMarkComplete = () => {
    if (currentLesson) {
      markLessonComplete(currentLesson.id);
    }
  };

  const nextLessonId = MODULES.flatMap((m) => m.lessons)
    .findIndex((l) => l.id === currentLesson.id) + 1;

  return (
    <ProtectedRoute>
      <div className="flex gap-6 min-h-[calc(100vh-80px)] p-6 bg-secondary-50">
        {/* Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <Card className="sticky top-6 h-fit">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Course Progress</h3>
              <ProgressBar progress={overallProgress} label="Overall Progress" size="lg" />

              <h4 className="text-sm font-semibold text-secondary-900 mt-8 mb-4">Modules & Lessons</h4>
              <LessonList
                modules={MODULES}
                courseId={courseId}
                completedLessons={completedLessons}
              />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">{currentLesson.title}</h2>
          </div>

          <CoursePlayer
            lessonTitle={currentLesson.title}
            type={currentLesson.type}
            duration={currentLesson.duration}
            completed={completedLessons.includes(currentLesson.id)}
            onMarkComplete={handleMarkComplete}
          />

          {/* Mobile Sidebar */}
          <div className="lg:hidden mt-8">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Course Progress</h3>
                <ProgressBar progress={overallProgress} label="Overall Progress" size="lg" />

                <h4 className="text-sm font-semibold text-secondary-900 mt-8 mb-4">Modules & Lessons</h4>
                <LessonList
                  modules={MODULES}
                  courseId={courseId}
                  completedLessons={completedLessons}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
