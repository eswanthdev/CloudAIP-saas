export const TIER_IGNITE = 'ignite';
export const TIER_TRANSFORMATE = 'transformate';

export const TIERS = {
  [TIER_IGNITE]: {
    name: 'Ignite',
    label: 'Ignite',
    description: 'Self-paced learning with core FinOps concepts',
    price: 499,
    currency: 'USD',
    color: 'blue',
    features: [
      'Core FinOps modules (4 weeks)',
      'Video lectures',
      'Hands-on labs',
      'Industry case studies',
      'Community forum access',
    ],
  },
  [TIER_TRANSFORMATE]: {
    name: 'Transformate',
    label: 'Transformate',
    description: 'Complete program with career support & mentorship',
    price: 1299,
    currency: 'USD',
    color: 'purple',
    features: [
      'Everything in Ignite',
      'Advanced modules (8 weeks total)',
      'Live mentorship sessions',
      'Mock interviews',
      'Resume review & optimization',
      'Job placement assistance',
      '1-on-1 career coaching',
      'Lifetime community access',
    ],
  },
};

export const LESSON_TYPES = {
  video: 'video',
  lab: 'lab',
  quiz: 'quiz',
  reading: 'reading',
};

export const USER_ROLES = {
  student: 'student',
  mentor: 'mentor',
  admin: 'admin',
};

export const MODULES = [
  {
    id: 'module-1',
    title: 'FinOps Fundamentals',
    description: 'Learn the basics of cloud financial management',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'What is FinOps?',
        type: 'video',
        duration: 45,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-1-2',
        title: 'Cloud Cost Drivers',
        type: 'video',
        duration: 60,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-1-3',
        title: 'AWS Cost Explorer Lab',
        type: 'lab',
        duration: 90,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-1-4',
        title: 'FinOps Governance',
        type: 'video',
        duration: 50,
        tier: TIER_TRANSFORMATE,
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Cloud Optimization Strategies',
    description: 'Master techniques to reduce cloud costs',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Reserved Instances & Savings Plans',
        type: 'video',
        duration: 55,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-2-2',
        title: 'Spot Instance Strategy',
        type: 'video',
        duration: 45,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-2-3',
        title: 'Optimization Lab: Build a Strategy',
        type: 'lab',
        duration: 120,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-2-4',
        title: 'Multi-Cloud Optimization',
        type: 'video',
        duration: 70,
        tier: TIER_TRANSFORMATE,
      },
    ],
  },
  {
    id: 'module-3',
    title: 'FinOps Tools & Platforms',
    description: 'Deep dive into industry tools',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Intro to CloudHealth',
        type: 'video',
        duration: 50,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-3-2',
        title: 'Hands-on: Implement Automation',
        type: 'lab',
        duration: 100,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-3-3',
        title: 'Advanced Tool Integration',
        type: 'video',
        duration: 65,
        tier: TIER_TRANSFORMATE,
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Case Studies & Real-World Scenarios',
    description: 'Learn from industry implementations',
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Scaling SaaS: Cost Optimization',
        type: 'reading',
        duration: 30,
        tier: TIER_IGNITE,
      },
      {
        id: 'lesson-4-2',
        title: 'Case Study Quiz',
        type: 'quiz',
        duration: 20,
        tier: TIER_IGNITE,
      },
    ],
  },
];

export const SERVICES = [
  {
    id: 'service-1',
    title: 'Cloud Cost Audit',
    description: 'Comprehensive analysis of your cloud spending',
    features: [
      'Detailed cost breakdown',
      'Waste identification',
      'Optimization recommendations',
    ],
  },
  {
    id: 'service-2',
    title: 'FinOps Implementation',
    description: 'Build and establish FinOps practices in your organization',
    features: [
      'Process design',
      'Tool selection & setup',
      'Team training',
      'Ongoing support',
    ],
  },
  {
    id: 'service-3',
    title: 'Cloud Optimization',
    description: 'Strategic optimization for maximum efficiency',
    features: [
      'Architecture review',
      'Resource right-sizing',
      'Reserved instance planning',
      'ROI analysis',
    ],
  },
];

export const PAYMENT_METHODS = {
  razorpay: 'razorpay',
  credit_card: 'credit_card',
  upi: 'upi',
};
