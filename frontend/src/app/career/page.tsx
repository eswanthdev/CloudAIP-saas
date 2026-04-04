'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Link from 'next/link';

const careerItems = [
  {
    title: 'Mock Interviews',
    description: 'Practice real-world FinOps interview scenarios with mentors',
    icon: '🎤',
    href: '/career/mock-interviews',
    features: ['1-on-1 sessions', 'Real scenarios', 'Feedback & tips'],
  },
  {
    title: 'Resume Review',
    description: 'Get your resume optimized by industry experts',
    icon: '📄',
    href: '/career/resume',
    features: ['Expert review', 'Personalized tips', 'ATS optimization'],
  },
  {
    title: 'Placement Tracker',
    description: 'Track your job search and placements',
    icon: '📍',
    href: '/career/placements',
    features: ['Track applications', 'Interview status', 'Offer tracking'],
  },
  {
    title: 'Mentorship',
    description: 'Get guidance from FinOps career coaches',
    icon: '👥',
    href: '/career/mentorship',
    features: ['Career guidance', 'Personalized plan', 'Ongoing support'],
  },
];

export default function CareerPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-secondary-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container-max">
            <h1 className="text-4xl font-bold mb-4">Career Support Hub</h1>
            <p className="text-xl text-primary-100">
              Get job-ready with interviews, resume review, and mentorship
            </p>
          </div>
        </div>

        {/* Career Resources */}
        <div className="container-max py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {careerItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-8">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-2">{item.title}</h3>
                    <p className="text-secondary-600 mb-6">{item.description}</p>
                    <ul className="space-y-2 mb-6">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-secondary-700">
                          <span className="text-primary-600">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" fullWidth>
                      Get Started
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-8">Career Success Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-600 mb-2">92%</p>
                  <p className="text-secondary-600">Placement Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-600 mb-2">$95K</p>
                  <p className="text-secondary-600">Avg. Salary</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-600 mb-2">3.2</p>
                  <p className="text-secondary-600">Months to Job</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
