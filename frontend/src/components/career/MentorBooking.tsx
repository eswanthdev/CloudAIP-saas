import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';

export interface Mentor {
  id: string;
  name: string;
  expertise: string;
  avatar?: string;
  rating: number;
  availability: string;
}

export interface MentorshipSession {
  id: string;
  mentor: string;
  date: string;
  time: string;
  topic: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface MentorBookingProps {
  mentors: Mentor[];
  sessions: MentorshipSession[];
  onBook?: (data: any) => void;
}

const MentorBooking: React.FC<MentorBookingProps> = ({ mentors = [], sessions = [], onBook }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    topic: '',
  });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMentor) {
      onBook?.({ ...formData, mentorId: selectedMentor.id });
      setFormData({ date: '', time: '', topic: '' });
      setSelectedMentor(null);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Mentors List */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Available Mentors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-secondary-900">{mentor.name}</h4>
                      <p className="text-sm text-secondary-600">{mentor.expertise}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <span>★</span>
                        <span className="font-medium">{mentor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-secondary-500 mb-3">Available: {mentor.availability}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setIsModalOpen(true);
                    }}
                  >
                    Book Session
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Your Mentorship Sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-secondary-500 text-center py-4">No sessions booked yet</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-secondary-900">{session.mentor}</h4>
                        <p className="text-sm text-secondary-600">{session.topic}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : session.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600">
                      {session.date} at {session.time} • {session.duration} mins
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMentor(null);
        }}
        title={`Book Session with ${selectedMentor?.name}`}
      >
        <form onSubmit={handleBooking} className="space-y-4">
          <Input
            label="Topic"
            type="text"
            placeholder="e.g., FinOps Career Path"
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
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedMentor(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Book Session
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MentorBooking;
