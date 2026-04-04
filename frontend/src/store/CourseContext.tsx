'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface CourseContextType {
  courses: Course[];
  enrolledCourses: EnrolledCourse[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  enrollCourse: (courseId: string, tier: string) => Promise<void>;
  clearError: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
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
  };

  const fetchEnrolledCourses = async () => {
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
  };

  const enrollCourse = async (courseId: string, tier: string) => {
    setError(null);
    try {
      await courseApi.enrollCourse(courseId, tier);
      await fetchEnrolledCourses();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to enroll in course';
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        enrolledCourses,
        loading,
        error,
        fetchCourses,
        fetchEnrolledCourses,
        enrollCourse,
        clearError,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used within CourseProvider');
  }
  return context;
};

export default CourseContext;
