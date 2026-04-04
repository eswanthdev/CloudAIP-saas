'use client';

import { useEffect, useState, useCallback } from 'react';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

export interface CourseProgress {
  courseId: string;
  lessons: LessonProgress[];
  overallProgress: number;
  lastAccessedAt: string;
}

export interface UseProgressReturn {
  progress: CourseProgress | null;
  loading: boolean;
  error: string | null;
  markLessonComplete: (lessonId: string) => void;
  markLessonIncomplete: (lessonId: string) => void;
  isLessonComplete: (lessonId: string) => boolean;
  getOverallProgress: () => number;
  getCompletedLessons: () => string[];
}

export const useProgress = (courseId: string): UseProgressReturn => {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`progress-${courseId}`);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        localStorage.removeItem(`progress-${courseId}`);
      }
    }
    setLoading(false);
  }, [courseId]);

  const saveProgress = useCallback((updatedProgress: CourseProgress) => {
    localStorage.setItem(`progress-${courseId}`, JSON.stringify(updatedProgress));
    setProgress(updatedProgress);
  }, [courseId]);

  const markLessonComplete = useCallback((lessonId: string) => {
    if (!progress) return;

    const updated = { ...progress };
    let lesson = updated.lessons.find((l) => l.lessonId === lessonId);

    if (!lesson) {
      lesson = { lessonId, completed: true, completedAt: new Date().toISOString() };
      updated.lessons.push(lesson);
    } else {
      lesson.completed = true;
      lesson.completedAt = new Date().toISOString();
    }

    updated.overallProgress = Math.round(
      (updated.lessons.filter((l) => l.completed).length / updated.lessons.length) * 100
    );
    updated.lastAccessedAt = new Date().toISOString();

    saveProgress(updated);
  }, [progress, saveProgress]);

  const markLessonIncomplete = useCallback((lessonId: string) => {
    if (!progress) return;

    const lesson = progress.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) return;

    const updated = { ...progress };
    lesson.completed = false;
    updated.overallProgress = Math.round(
      (updated.lessons.filter((l) => l.completed).length / updated.lessons.length) * 100
    );
    updated.lastAccessedAt = new Date().toISOString();

    saveProgress(updated);
  }, [progress, saveProgress]);

  const isLessonComplete = useCallback(
    (lessonId: string): boolean => {
      if (!progress) return false;
      return progress.lessons.some((l) => l.lessonId === lessonId && l.completed);
    },
    [progress]
  );

  const getOverallProgress = useCallback((): number => {
    return progress?.overallProgress || 0;
  }, [progress]);

  const getCompletedLessons = useCallback((): string[] => {
    if (!progress) return [];
    return progress.lessons.filter((l) => l.completed).map((l) => l.lessonId);
  }, [progress]);

  return {
    progress,
    loading,
    error,
    markLessonComplete,
    markLessonIncomplete,
    isLessonComplete,
    getOverallProgress,
    getCompletedLessons,
  };
};

export default useProgress;
