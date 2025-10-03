import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../config/api';

const CreateEventModal = ({ communityId, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'book_club',
    startDate: '',
    startTime: '',
    locationType: 'virtual',
    meetingLink: '',
    venue: '',
    bookTitle: '',
    bookAuthor: '',
    maxAttendees: ''
  });
  const [loading, setLoading] = useState(false);

  const eventTypes = [
    { id: 'book_club', label: 'Book Club' },
    { id: 'discussion', label: 'Discussion' },
    { id: 'challenge', label: 'Challenge' },
    { id: 'meetup', label: 'Meetup' },
    { id: 'ama', label: 'AMA' },
    { id: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);

      const payload = {
        communityId,
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startDate: startDateTime.toISOString(),
        location: {
          type: formData.locationType,
          meetingLink: formData.locationType === 'virtual' ? formData.meetingLink : undefined,
          venue: formData.locationType !== 'virtual' ? formData.venue : undefined
        },
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
      };

      // Add book details if book club
      if (formData.eventType === 'book_club' && formData.bookTitle) {
        payload.bookDetails = {
          title: formData.bookTitle,
          author: formData.bookAuthor
        };
      }

      const response = await api.post('/events', payload);
      onEventCreated(response.data);
      alert('Event created successfully! <‰');
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Harry Potter Book Club"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's this event about?"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location Type *</label>
            <select
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="virtual">Virtual</option>
              <option value="physical">Physical</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Meeting Link or Venue */}
          {formData.locationType === 'virtual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link</label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {formData.locationType !== 'virtual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Address or location"
              />
            </div>
          )}

          {/* Book Details (if book club) */}
          {formData.eventType === 'book_club' && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900">Book Details</h3>
              <input
                type="text"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Book Title"
              />
              <input
                type="text"
                name="bookAuthor"
                value={formData.bookAuthor}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author"
              />
            </div>
          )}

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Attendees (optional)
            </label>
            <input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for unlimited"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
