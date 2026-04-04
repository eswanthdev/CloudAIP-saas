'use client';

import { useEffect, useState, useCallback } from 'react';
import { courseApi } from '@/lib/api';

export interface Course {
  id: string;
  title: string;
  description: string;
  tier: string;
  price: number;
  instructor: string;
  rating: number;
  students: number;
  duration: number;
  modules: any[];
}

export interface EnrolledCourse extends Course {
  enrolledAt: string;
  progress: number;
}

export interface UseCourseReturn {
  courses: Course[];
  enrolledCourses: EnrolledCourse[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  getCourseById: (id: string) => Promise<void>;
  enrollCourse: (courseId: string, tier: string) => Promise<void>;
  getProgress: (courseId: string) => Promise<any>;
  updateProgress: (courseId: string, lessonId: string, completed: boolean) => Promise<void>;
}

export const useCourses = (): UseCourseReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseApi.getAllCourses();
      setCourses(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch courses';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEnrolledCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseApi.getEnrolledCourses();
      setEnrolledCourses(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch enrolled courses';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseApi.getCourseById(id);
      setSelectedCourse(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch course';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const enrollCourse = useCallback(async (courseId: string, tier: string) => {
    setLoading(true);
    setError(null);
    try {
      await courseApi.enrollCourse(courseId, tier);
      await fetchEnrolledCourses();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to enroll in course';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEnrolledCourses]);

  const getProgress = useCallback(async (courseId: string) => {
    try {
      const response = await courseApi.getProgress(courseId);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch progress';
      setError(message);
      return null;
    }
  }, []);

  const updateProgress = useCallback(async (courseId: string, lessonId: string, completed: boolean) => {
    try {
      await courseApi.updateProgress(courseId, lessonId, completed);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update progress';
      setError(message);
      throw err;
    }
  }, []);

  return {
    courses,
    enrolledCourses,
    selectedCourse,
    loading,
    error,
    fetchCourses,
    fetchEnrolledCourses,
    getCourseById,
    enrollCourse,
    getProgress,
    updateProgress,
  };
};

export default useCourses;
