'use client';

import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

interface LeadFormProps {
  title?: string;
  onSubmit?: (data: any) => void;
}

const LeadForm: React.FC<LeadFormProps> = ({
  title = 'Get a Free Consultation',
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !formData.email.includes('@')) newErrors.email = 'Invalid email';
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      onSubmit?.(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', role: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <div className="p-8 text-center">
          <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Thank you!</h3>
          <p className="text-secondary-600">We'll be in touch shortly with your consultation.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">{title}</h2>
        <p className="text-secondary-600 mb-6">
          Tell us about your cloud optimization goals and we'll provide tailored recommendations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              type="text"
              placeholder="Your Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              error={errors.company}
              required
            />
            <Input
              label="Job Title"
              type="text"
              placeholder="e.g., Cloud Architect"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              error={errors.role}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
              Tell us about your needs
            </label>
            <textarea
              placeholder="What are your cloud optimization goals?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-secondary-400"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Request Consultation
          </Button>

          <p className="text-xs text-secondary-500 text-center">
            We respect your privacy. Your information will never be shared.
          </p>
        </form>
      </div>
    </Card>
  );
};

export default LeadForm;
