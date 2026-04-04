'use client';

import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

interface CourseFormProps {
  initialData?: any;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    tier: 'ignite',
    price: 0,
    instructor: '',
    duration: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.instructor) newErrors.instructor = 'Instructor is required';
    if (formData.price < 0) newErrors.price = 'Price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          {initialData ? 'Edit Course' : 'Create New Course'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Course Title"
            type="text"
            placeholder="e.g., FinOps Fundamentals"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            fullWidth
            required
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Description</label>
            <textarea
              placeholder="Course description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-lg border-2 border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ignite">Ignite</option>
                <option value="transformate">Transformate</option>
              </select>
            </div>

            <Input
              label="Price (USD)"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              error={errors.price}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instructor"
              type="text"
              placeholder="Instructor name"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              error={errors.instructor}
              required
            />

            <Input
              label="Duration (hours)"
              type="number"
              min="0"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {initialData ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default CourseForm;
