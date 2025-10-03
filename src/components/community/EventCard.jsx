import React from 'react';
import { Calendar, MapPin, Users, Video, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const EventCard = ({ event, onJoin }) => {
  const isUpcoming = event.status === 'upcoming';
  const userAttending = false; // TODO: Check if current user is attending

  const eventTypeColors = {
    book_club: 'bg-purple-100 text-purple-700',
    discussion: 'bg-blue-100 text-blue-700',
    challenge: 'bg-green-100 text-green-700',
    meetup: 'bg-yellow-100 text-yellow-700',
    ama: 'bg-red-100 text-red-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const statusColors = {
    upcoming: 'bg-green-100 text-green-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.eventType] || eventTypeColors.other}`}>
              {event.eventType.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
              {event.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
          <p className="text-gray-600 mb-4">{event.description}</p>
        </div>
      </div>

      {/* Book Details (if book club) */}
      {event.eventType === 'book_club' && event.bookDetails && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-semibold text-gray-900">{event.bookDetails.title}</p>
          {event.bookDetails.author && (
            <p className="text-sm text-gray-600">by {event.bookDetails.author}</p>
          )}
        </div>
      )}

      {/* Event Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar size={16} />
          <span>{new Date(event.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600">
          <Clock size={16} />
          <span>{new Date(event.startDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600">
          {event.location?.type === 'virtual' ? <Video size={16} /> : <MapPin size={16} />}
          <span className="capitalize">{event.location?.type || 'TBD'}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600">
          <Users size={16} />
          <span>{event.stats?.attendeeCount || 0} attending</span>
        </div>
      </div>

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {isUpcoming && !userAttending && (
        <div className="flex space-x-2">
          <button
            onClick={() => onJoin(event._id, 'going')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            I'm Going
          </button>
          <button
            onClick={() => onJoin(event._id, 'interested')}
            className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Interested
          </button>
        </div>
      )}

      {userAttending && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-700 font-medium"> You're attending this event</p>
        </div>
      )}
    </div>
  );
};

export default EventCard;
