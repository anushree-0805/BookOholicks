import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import api from '../../config/api';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';

const CommunityEvents = ({ communityId, isMember }) => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Past' },
    { id: 'all', label: 'All' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [communityId, filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/community/${communityId}?status=${filter}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setShowCreateModal(false);
  };

  const handleJoinEvent = async (eventId, status = 'going') => {
    try {
      await api.post(`/events/${eventId}/join`, { status });
      fetchEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      alert(error.response?.data?.message || 'Failed to join event');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isMember && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onJoin={handleJoinEvent}
            />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No {filter} events</p>
          {isMember && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Create the first event
            </button>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          communityId={communityId}
          onClose={() => setShowCreateModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
};

export default CommunityEvents;
