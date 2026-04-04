'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ResumeUploader from '@/components/career/ResumeUploader';
import Card from '@/components/common/Card';

export default function ResumePage() {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="container-max py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">Resume Review</h1>
          <p className="text-lg text-secondary-600">
            Get expert feedback on your FinOps resume
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ResumeUploader
              onUpload={(file) => {
                console.log('Upload resume:', file);
              }}
            />
          </div>

          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Tips for FinOps Resume</h3>
                <ul className="space-y-3 text-sm text-secondary-700">
                  <li className="flex gap-2">
                    <span className="text-primary-600">•</span>
                    <span>Highlight cloud cost optimization results</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary-600">•</span>
                    <span>Include relevant tools and platforms</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary-600">•</span>
                    <span>Quantify your achievements with metrics</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary-600">•</span>
                    <span>List FinOps certifications prominently</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary-600">•</span>
                    <span>Use ATS-friendly formatting</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
