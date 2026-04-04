import React from 'react';
import { TIERS } from '@/lib/constants';

interface TierBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md' }) => {
  const tierInfo = TIERS[tier as keyof typeof TIERS];

  if (!tierInfo) {
    return null;
  }

  const bgColor = tierInfo.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100';
  const textColor = tierInfo.color === 'blue' ? 'text-blue-700' : 'text-purple-700';

  return (
    <span className={`font-semibold rounded-full ${bgColor} ${textColor} ${sizeStyles[size]}`}>
      {tierInfo.label}
    </span>
  );
};

export default TierBadge;
