import React from 'react';
import Link from 'next/link';
import Card from '@/components/common/Card';
import { TIERS } from '@/lib/constants';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  tier: string;
  progress?: number;
  rating?: number;
  students?: number;
  instructor?: string;
  enrolled?: boolean;
  href?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  tier,
  progress,
  rating,
  students,
  instructor,
  enrolled = false,
  href = `/courses/${id}`,
}) => {
  const tierInfo = TIERS[tier as keyof typeof TIERS];
  const tierColor = tierInfo?.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        <div className="p-6">
          {/* Header with Badge */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex-1">{title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${tierColor}`}>
              {tierInfo?.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{description}</p>

          {/* Metadata */}
          {instructor && (
            <div className="flex items-center gap-2 mb-4 text-sm text-secondary-500">
              <span>Instructor: {instructor}</span>
            </div>
          )}

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-secondary-600 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-4 text-xs text-secondary-500">
            {rating && <span>Rating: {rating}/5</span>}
            {students && <span>{students} students</span>}
          </div>

          {/* Enrolled Badge */}
          {enrolled && (
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Enrolled
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default CourseCard;
