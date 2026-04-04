import React from 'react';
import Card from '@/components/common/Card';

export interface Placement {
  id: string;
  stage: 'Application' | 'Interview' | 'Offer' | 'Placed';
  company: string;
  role: string;
  salary?: string;
  status: 'active' | 'completed' | 'rejected';
  date: string;
}

interface PlacementTrackerProps {
  placements: Placement[];
}

const stageColors = {
  'Application': 'bg-blue-100 text-blue-700',
  'Interview': 'bg-yellow-100 text-yellow-700',
  'Offer': 'bg-green-100 text-green-700',
  'Placed': 'bg-green-100 text-green-700',
};

const statusIcons = {
  active: '🔄',
  completed: '✓',
  rejected: '✕',
};

const PlacementTracker: React.FC<PlacementTrackerProps> = ({ placements = [] }) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-6">Placement Tracker</h3>

        {placements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary-500">No placements tracked yet. Start your job search!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {placements.map((placement, index) => (
              <div key={placement.id} className="relative">
                {index !== placements.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-secondary-200" />
                )}

                <div className="flex gap-4">
                  <div className="flex-shrink-0 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-secondary-200 text-lg`}>
                      {statusIcons[placement.status]}
                    </div>
                  </div>

                  <div className="flex-1 pt-1 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-secondary-900">{placement.company}</h4>
                        <p className="text-sm text-secondary-600">{placement.role}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stageColors[placement.stage]}`}>
                        {placement.stage}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-500">{placement.date}</p>
                    {placement.salary && (
                      <p className="text-sm font-medium text-green-600 mt-1">{placement.salary}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlacementTracker;
