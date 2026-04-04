import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'disqualified';
}

interface LeadTableProps {
  leads: Lead[];
  onStatusChange?: (leadId: string, status: string) => void;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-green-100 text-green-700',
  disqualified: 'bg-red-100 text-red-700',
};

const LeadTable: React.FC<LeadTableProps> = ({ leads = [], onStatusChange }) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Company</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-secondary-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-secondary-500">
                  No leads yet
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 font-medium text-secondary-900">{lead.name}</td>
                  <td className="px-6 py-4 text-secondary-600">{lead.company}</td>
                  <td className="px-6 py-4 text-secondary-600 truncate">{lead.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange?.(lead.id, e.target.value)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border-0 outline-none ${statusColors[lead.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="disqualified">Disqualified</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-secondary-600 text-xs">{lead.submittedAt}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default LeadTable;
