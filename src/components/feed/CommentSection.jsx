import React, { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../config/api';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ postId, comments, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(
        `/posts/${postId}/comment`,
        { text: commentText }
      );

      onCommentAdded(response.data);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t bg-gray-50 p-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !commentText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map((comment, idx) => (
          <div key={idx} className="flex space-x-3 bg-white p-3 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              U
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">User</span>
                <span className="text-xs text-gray-500">
                  {comment.timestamp && formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-800 mt-1">{comment.text}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
