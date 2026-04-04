'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Link from 'next/link';

const LoginForm: React.FC = () => {
  const { login, error, clearError } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.email && !formData.email.includes('@')) errors.email = 'Invalid email format';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        error={formErrors.email}
        fullWidth
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        fullWidth
        required
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-secondary-600">Remember me</span>
        </label>
        <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={loading}>
        Sign In
      </Button>

      <p className="text-center text-sm text-secondary-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary-600 hover:underline font-semibold">
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
