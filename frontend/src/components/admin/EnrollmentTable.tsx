import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  tier: string;
  enrolledAt: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
}

interface EnrollmentTableProps {
  enrollments: Enrollment[];
}

const statusColors = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  dropped: 'bg-red-100 text-red-700',
};

const tierColors = {
  ignite: 'bg-blue-100 text-blue-700',
  transformate: 'bg-purple-100 text-purple-700',
};

const EnrollmentTable: React.FC<EnrollmentTableProps> = ({ enrollments = [] }) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Student</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Course</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Tier</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Progress</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-secondary-500">
                  No enrollments yet
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-secondary-900">{enrollment.studentName}</p>
                      <p className="text-xs text-secondary-500">{enrollment.studentEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{enrollment.courseName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tierColors[enrollment.tier as keyof typeof tierColors]}`}>
                      {enrollment.tier.charAt(0).toUpperCase() + enrollment.tier.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[enrollment.status as keyof typeof statusColors]}`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600 text-xs">{enrollment.enrolledAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default EnrollmentTable;
