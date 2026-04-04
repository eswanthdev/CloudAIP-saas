import React from 'react';
import Card from '@/components/common/Card';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { direction: 'up' | 'down'; percentage: number };
}

interface StatsCardsProps {
  stats: StatItem[];
  columns?: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, columns = 4 }) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  } as Record<number, string>;

  return (
    <div className={`grid ${colsClass[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <Card key={index} variant="elevated">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-secondary-600">{stat.label}</h3>
              {stat.icon && <div className="text-3xl opacity-20">{stat.icon}</div>}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                {stat.trend && (
                  <p className={`text-sm mt-2 font-medium ${
                    stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.percentage}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
