'use client';

import React from 'react';
import LeadTable from '@/components/admin/LeadTable';

export default function AdminLeadsPage() {
  const leads = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@techcorp.com',
      company: 'TechCorp',
      role: 'CTO',
      message: 'Interested in FinOps implementation for our AWS environment',
      submittedAt: '2 days ago',
      status: 'new' as const,
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@cloudglobal.com',
      company: 'CloudGlobal',
      role: 'Finance Manager',
      message: 'Looking for cost optimization consulting',
      submittedAt: '5 days ago',
      status: 'contacted' as const,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@startup.io',
      company: 'StartupXYZ',
      role: 'DevOps Lead',
      message: 'Need help with cloud cost management',
      submittedAt: '1 week ago',
      status: 'qualified' as const,
    },
  ];

  const handleStatusChange = (leadId: string, status: string) => {
    console.log(`Update lead ${leadId} status to ${status}`);
  };

  return (
    <div className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Service Leads</h1>
        <p className="text-secondary-600">Manage incoming service requests</p>
      </div>

      {/* Leads Table */}
      <LeadTable leads={leads} onStatusChange={handleStatusChange} />
    </div>
  );
}
