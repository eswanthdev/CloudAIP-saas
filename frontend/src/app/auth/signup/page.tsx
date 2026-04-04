import React from 'react';
import SignupForm from '@/components/auth/SignupForm';
import Card from '@/components/common/Card';

export const metadata = {
  title: 'Sign Up | FinOps Academy',
  description: 'Create your FinOps Academy account and start learning',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Create Account</h1>
          <p className="text-secondary-600">Join thousands of FinOps professionals</p>
        </div>

        <Card>
          <div className="p-8">
            <SignupForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
