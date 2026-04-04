import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  price?: string;
  cta?: string;
  onCTA?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  features,
  price,
  cta = 'Learn More',
  onCTA,
}) => {
  return (
    <Card variant="elevated" className="h-full flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">{title}</h3>
        <p className="text-secondary-600 text-sm mb-4">{description}</p>

        {/* Features */}
        <div className="flex-1 mb-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-secondary-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price & CTA */}
        <div className="border-t border-secondary-200 pt-4">
          {price && <p className="text-2xl font-bold text-primary-600 mb-4">{price}</p>}
          <Button variant="primary" fullWidth onClick={onCTA}>
            {cta}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
