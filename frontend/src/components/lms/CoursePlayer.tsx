import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface CoursePlayerProps {
  lessonTitle: string;
  videoUrl?: string;
  labContent?: React.ReactNode;
  type: 'video' | 'lab' | 'quiz' | 'reading';
  duration: number;
  completed?: boolean;
  onMarkComplete?: () => void;
  nextLessonUrl?: string;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({
  lessonTitle,
  videoUrl,
  labContent,
  type,
  duration,
  completed = false,
  onMarkComplete,
  nextLessonUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      {/* Player Container */}
      <Card variant="elevated">
        {type === 'video' && videoUrl ? (
          <div className="bg-secondary-900 aspect-video flex items-center justify-center relative group">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full hover:bg-primary-700 transition group-hover:scale-110"
            >
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
            {!isPlaying && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <p className="text-white text-lg font-medium">Video Player</p>
              </div>
            )}
          </div>
        ) : type === 'lab' ? (
          <div className="p-6 bg-secondary-50 min-h-96 flex items-center justify-center">
            {labContent || (
              <div className="text-center text-secondary-600">
                <p className="text-lg font-medium mb-2">Lab Environment</p>
                <p className="text-sm">Interactive lab content will be displayed here</p>
              </div>
            )}
          </div>
        ) : type === 'quiz' ? (
          <div className="p-6 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-secondary-900 mb-2">Quiz</p>
              <p className="text-secondary-600 mb-4">Quiz content will be displayed here</p>
              <Button variant="primary">Start Quiz</Button>
            </div>
          </div>
        ) : (
          <div className="p-6 min-h-96 prose prose-sm max-w-none">
            <p className="text-secondary-600">Reading material will be displayed here</p>
          </div>
        )}
      </Card>

      {/* Lesson Info */}
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">{lessonTitle}</h2>
          <div className="flex items-center gap-4 mb-6 text-sm text-secondary-600">
            <span>Type: {type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span>Duration: {duration} minutes</span>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {!completed && (
              <Button
                variant="primary"
                onClick={onMarkComplete}
              >
                Mark as Complete
              </Button>
            )}
            {completed && (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Completed</span>
              </div>
            )}
            {nextLessonUrl && (
              <Button variant="outline" href={nextLessonUrl}>
                Next Lesson
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CoursePlayer;
