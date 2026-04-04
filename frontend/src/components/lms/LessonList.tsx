import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'lab' | 'quiz' | 'reading';
  duration: number;
  completed?: boolean;
  tier?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonListProps {
  modules: Module[];
  courseId: string;
  completedLessons?: string[];
}

const typeIcons = {
  video: '🎬',
  lab: '🧪',
  quiz: '✓',
  reading: '📖',
};

const typeLabels = {
  video: 'Video',
  lab: 'Lab',
  quiz: 'Quiz',
  reading: 'Reading',
};

const LessonList: React.FC<LessonListProps> = ({ modules, courseId, completedLessons = [] }) => {
  const pathname = usePathname();

  const isLessonActive = (lessonId: string) => {
    return pathname.includes(lessonId);
  };

  return (
    <div className="space-y-6">
      {modules.map((module) => {
        const completedCount = module.lessons.filter((l) => completedLessons.includes(l.id)).length;
        const totalCount = module.lessons.length;

        return (
          <div key={module.id}>
            <div className="mb-3">
              <h3 className="font-semibold text-secondary-900 text-sm mb-1">{module.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-secondary-200 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-secondary-500">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {module.lessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isActive = isLessonActive(lesson.id);

                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${courseId}/learn/${lesson.id}`}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-secondary-600 hover:bg-secondary-100'
                      }
                    `}
                  >
                    <span className="text-base">{typeIcons[lesson.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-secondary-500">{lesson.duration}m</p>
                    </div>
                    {isCompleted && (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LessonList;
