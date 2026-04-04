import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';

interface MockInterview {
  id: string;
  date: string;
  time: string;
  mentor: string;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface MockInterviewSchedulerProps {
  interviews: MockInterview[];
  onSchedule?: (data: any) => void;
}

const MockInterviewScheduler: React.FC<MockInterviewSchedulerProps> = ({ interviews = [], onSchedule }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    topic: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule?.(formData);
    setFormData({ date: '', time: '', topic: '' });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <>
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">Mock Interviews</h3>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Schedule Interview
            </Button>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-500">No mock interviews scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div key={interview.id} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-secondary-900">{interview.topic}</h4>
                      <p className="text-sm text-secondary-500">Mentor: {interview.mentor}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(interview.status)}`}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600">
                    {interview.date} at {interview.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Mock Interview">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Interview Topic"
            type="text"
            placeholder="e.g., FinOps Strategy Interview"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="Preferred Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            required
          />
          <Input
            label="Preferred Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            fullWidth
            required
          />
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MockInterviewScheduler;
