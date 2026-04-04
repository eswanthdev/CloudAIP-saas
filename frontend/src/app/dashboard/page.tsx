'use client';

import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/store/AuthContext';
import { useCourseContext } from '@/store/CourseContext';
import StatsCards from '@/components/dashboard/StatsCards';
import CourseCard from '@/components/dashboard/CourseCard';
import UpcomingSessions from '@/components/dashboard/UpcomingSessions';
import ProgressBar from '@/components/dashboard/ProgressBar';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { enrolledCourses, loading } = useCourseContext();
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    setUpcomingSessions([
      {
        id: '1',
        title: 'FinOps Strategy Mentorship',
        type: 'mentorship' as const,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: '2:00 PM',
        instructor: 'Sarah Chen',
        duration: 60,
      },
      {
        id: '2',
        title: 'Advanced Cost Optimization Live Class',
        type: 'live-class' as const,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '1:00 PM',
        instructor: 'Mike Johnson',
        duration: 90,
      },
      {
        id: '3',
        title: 'Mock Interview - FinOps Scenarios',
        type: 'mock-interview' as const,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '3:30 PM',
        instructor: 'Priya Patel',
        duration: 45,
      },
    ]);
  }, []);

  if (loading) {
    return <Loading fullPage message="Loading your dashboard..." />;
  }

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-primary-100">
          {enrolledCourses.length === 0
            ? 'Ready to start your FinOps journey? Browse our courses to get started.'
            : `Keep up the great work! You're ${avgProgress}% through your courses on average.`}
        </p>
      </div>

      {/* Stats */}
      <StatsCards
        stats={[
          { label: 'Courses Enrolled', value: enrolledCourses.length, icon: '📚', trend: { direction: 'up', percentage: 25 } },
          { label: 'Average Progress', value: `${avgProgress}%`, icon: '📈', trend: { direction: 'up', percentage: 15 } },
          { label: 'Hours Completed', value: Math.floor((avgProgress / 100) * 40), icon: '⏱️', trend: { direction: 'up', percentage: 32 } },
          { label: 'Certificates Earned', value: 0, icon: '🏆' },
        ]}
        columns={4}
      />

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">My Courses</h2>
        {enrolledCourses.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <p className="text-lg text-secondary-600 mb-4">You haven't enrolled in any courses yet.</p>
              <a href="/courses" className="text-primary-600 hover:text-primary-700 font-semibold">
                Browse courses →
              </a>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                tier={course.tier}
                progress={course.progress}
                rating={course.rating}
                students={course.students}
                instructor={course.instructor}
                enrolled
                href={`/courses/${course.id}/learn`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingSessions sessions={upcomingSessions} />
        </div>

        {/* Quick Stats Card */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-6">Your Stats</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-700 font-medium">Overall Progress</span>
                  <span className="text-2xl font-bold text-primary-600">{avgProgress}%</span>
                </div>
                <ProgressBar progress={avgProgress} showPercentage={false} />
              </div>

              <div>
                <p className="text-secondary-600 text-sm mb-3">Current Streak</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-600">12</span>
                  <span className="text-secondary-600">days 🔥</span>
                </div>
              </div>

              <div>
                <p className="text-secondary-600 text-sm mb-3">Tier Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  user?.tier === 'transformate'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user?.tier === 'transformate' ? 'Transformate' : 'Ignite'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
