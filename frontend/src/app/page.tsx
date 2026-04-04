'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import StatsCards from '@/components/dashboard/StatsCards';
import { TIERS, MODULES } from '@/lib/constants';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 pt-20 pb-24">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
                Master Cloud <span className="text-gradient">Financial Management</span>
              </h1>
              <p className="text-xl text-secondary-600 leading-relaxed">
                Learn FinOps from industry experts. Optimize your cloud costs, improve organizational efficiency, and advance your career with our comprehensive training programs.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" onClick={() => router.push('/courses')}>
                  Explore Courses
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/services')}>
                  Learn More
                </Button>
              </div>
              <div className="flex gap-8 pt-8">
                <div>
                  <p className="text-2xl font-bold text-primary-600">2,500+</p>
                  <p className="text-secondary-600">Students Trained</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">98%</p>
                  <p className="text-secondary-600">Satisfaction Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">50+</p>
                  <p className="text-secondary-600">Expert Instructors</p>
                </div>
              </div>
            </div>

            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                ☁️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Tiers Comparison */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Choose Your Learning Path</h2>
            <p className="text-xl text-secondary-600">Two tiers designed for different learning goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(TIERS).map(([key, tier]) => (
              <Card
                key={key}
                variant={key === 'transformate' ? 'elevated' : 'default'}
                className={key === 'transformate' ? 'ring-2 ring-primary-600 relative' : ''}
              >
                {key === 'transformate' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-secondary-900 mb-2">{tier.name}</h3>
                  <p className="text-secondary-600 mb-4">{tier.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-primary-600">${tier.price}</span>
                      <span className="text-secondary-600">/USD</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-secondary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={key === 'transformate' ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => router.push('/courses')}
                  >
                    Get Started
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Highlights */}
      <section className="section-padding bg-secondary-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">What You'll Learn</h2>
            <p className="text-xl text-secondary-600">Comprehensive curriculum covering all aspects of FinOps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODULES.slice(0, 4).map((module) => (
              <Card key={module.id} className="p-6">
                <h4 className="text-lg font-semibold text-secondary-900 mb-2">{module.title}</h4>
                <p className="text-secondary-600 text-sm mb-4">{module.description}</p>
                <div className="flex flex-wrap gap-2">
                  {module.lessons.slice(0, 3).map((lesson) => (
                    <span key={lesson.id} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {lesson.title}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses" className="text-primary-600 hover:text-primary-700 font-semibold">
              View Full Curriculum →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <StatsCards
            stats={[
              { label: 'Total Courses', value: '5+', icon: '📚' },
              { label: 'Video Hours', value: '40+', icon: '🎬' },
              { label: 'Hands-on Labs', value: '15+', icon: '🧪' },
              { label: 'Success Rate', value: '92%', icon: '✓' },
            ]}
            columns={4}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary-900 text-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Student Success Stories</h2>
            <p className="text-xl text-secondary-300">Hear from our graduates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Cloud Architect',
                company: 'Tech Corp',
                testimonial: 'The FinOps training transformed my career. I now manage a $2M cloud budget and have helped reduce costs by 35%.',
              },
              {
                name: 'Mike Johnson',
                role: 'DevOps Engineer',
                company: 'StartUp Inc',
                testimonial: 'Excellent hands-on labs and real-world scenarios. The mentorship was invaluable in securing my promotion.',
              },
              {
                name: 'Priya Patel',
                role: 'Cloud Finance Manager',
                company: 'Global Solutions',
                testimonial: 'The Transformate program gave me both technical skills and career support. Now leading a FinOps team of 5.',
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-secondary-800 border-secondary-700 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <p className="text-secondary-200 mb-4">{testimonial.testimonial}</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-secondary-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Master FinOps?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Start your journey today and join thousands of successful graduates
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-secondary-50"
              onClick={() => router.push('/auth/signup')}
            >
              Sign Up Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-primary-700"
              onClick={() => router.push('/courses')}
            >
              Explore Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
