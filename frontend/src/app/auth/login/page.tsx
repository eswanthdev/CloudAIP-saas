import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Card from '@/components/common/Card';

export const metadata = {
  title: 'Login | FinOps Academy',
  description: 'Sign in to your FinOps Academy account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Welcome Back</h1>
          <p className="text-secondary-600">Sign in to continue your learning journey</p>
        </div>

        <Card>
          <div className="p-8">
            <LoginForm />
          </div>
        </Card>

        <p className="text-center text-secondary-600 text-sm mt-6">
          Having trouble?{' '}
          <a href="/auth/forgot-password" className="text-primary-600 hover:underline font-semibold">
            Reset your password
          </a>
        </p>
      </div>
    </div>
  );
}
