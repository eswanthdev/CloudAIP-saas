'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setStep('code');
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setStep('reset');
    } catch (err) {
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      router.push('/auth/login');
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Reset Password</h1>
          <p className="text-secondary-600">Follow the steps to recover your account</p>
        </div>

        <Card>
          <div className="p-8">
            {/* Progress Steps */}
            <div className="flex gap-2 mb-8">
              {['email', 'code', 'reset'].map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full ${
                    ['email', 'code', 'reset'].indexOf(step) >= i
                      ? 'bg-primary-600'
                      : 'bg-secondary-200'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
                <p className="text-sm text-secondary-600">
                  Enter your email address and we'll send you a code to reset your password.
                </p>
                <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                  Send Reset Code
                </Button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  fullWidth
                  required
                />
                <p className="text-sm text-secondary-600">
                  Check your email for the verification code.
                </p>
                <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                  Verify Code
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                  Reset Password
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-primary-600 hover:underline text-sm">
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
