import React from 'react';
import { TIER_TRANSFORMATE } from '@/lib/constants';
import TierBadge from './TierBadge';

interface TierGateProps {
  requiredTier: string;
  userTier?: string;
  children: React.ReactNode;
}

const TierGate: React.FC<TierGateProps> = ({ requiredTier, userTier, children }) => {
  const hasAccess =
    !requiredTier ||
    requiredTier === 'ignite' ||
    (userTier === TIER_TRANSFORMATE && requiredTier === TIER_TRANSFORMATE);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <svg className="w-16 h-16 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Exclusive Content</h3>
      <p className="text-secondary-600 mb-4">This content is available in the</p>
      <TierBadge tier={requiredTier} size="lg" />
      <p className="text-secondary-500 text-sm mt-4">Upgrade your plan to unlock this lesson.</p>
    </div>
  );
};

export default TierGate;
