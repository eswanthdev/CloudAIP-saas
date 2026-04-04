import React from 'react';
import Card from '@/components/common/Card';
import { format } from 'date-fns';

export interface UpcomingSession {
  id: string;
  title: string;
  type: 'mentorship' | 'live-class' | 'mock-interview';
  date: Date;
  time: string;
  instructor?: string;
  duration: number;
}

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  maxShow?: number;
}

const typeColors = {
  mentorship: 'bg-blue-100 text-blue-700',
  'live-class': 'bg-green-100 text-green-700',
  'mock-interview': 'bg-purple-100 text-purple-700',
};

const typeLabels = {
  mentorship: 'Mentorship',
  'live-class': 'Live Class',
  'mock-interview': 'Mock Interview',
};

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ sessions, maxShow = 3 }) => {
  const upcomingSessions = sessions.slice(0, maxShow);

  if (upcomingSessions.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Upcoming Sessions</h3>
          <p className="text-secondary-500 text-center py-8">No upcoming sessions scheduled</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Upcoming Sessions</h3>
        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="border-l-4 border-primary-600 pl-4 py-2">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-secondary-900">{session.title}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColors[session.type]}`}>
                  {typeLabels[session.type]}
                </span>
              </div>
              <p className="text-sm text-secondary-500 mb-1">
                {format(session.date, 'MMM dd, yyyy')} at {session.time}
              </p>
              {session.instructor && (
                <p className="text-sm text-secondary-500">With {session.instructor}</p>
              )}
              <p className="text-xs text-secondary-400 mt-1">{session.duration} minutes</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default UpcomingSessions;
