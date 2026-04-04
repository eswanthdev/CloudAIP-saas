'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Link from 'next/link';

const SignupForm: React.FC = () => {
  const { signup, error, clearError } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (formData.email && !formData.email.includes('@')) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
      router.push('/dashboard');
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
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
        label="Full Name"
        type="text"
        name="name"
        placeholder="John Doe"
        value={formData.name}
        onChange={handleChange}
        error={formErrors.name}
        fullWidth
        required
      />

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
        placeholder="Create a strong password"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        fullWidth
        required
        helperText="At least 8 characters"
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={formErrors.confirmPassword}
        fullWidth
        required
      />

      <div className="flex items-start gap-2">
        <input type="checkbox" className="mt-1 rounded" required />
        <span className="text-sm text-secondary-600">
          I agree to the{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>
        </span>
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={loading}>
        Create Account
      </Button>

      <p className="text-center text-sm text-secondary-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary-600 hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
