import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, MoreVertical, Trash2, Pin } from 'lucide-react';
import PostEngagementBar from './PostEngagementBar';
import CommentSection from './CommentSection';
import api from '../../config/api';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const currentUserId = localStorage.getItem('userId'); // Assuming userId is stored

  const isOwnPost = post.userId === currentUserId;

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      onUpdate(response.data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/repost`);
      onUpdate(response.data);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${post._id}`);
        onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const renderContent = () => {
    switch (post.postType) {
      case 'review':
        return (
          <div className="space-y-3">
            {post.content.bookTitle && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{post.content.bookTitle}</h3>
                {post.content.bookAuthor && (
                  <p className="text-gray-600 text-sm">by {post.content.bookAuthor}</p>
                )}
                {post.content.rating && (
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < post.content.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {post.content.text && <p className="text-gray-800">{post.content.text}</p>}
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-blue-600 pl-4 py-2 bg-gray-50 rounded">
            <p className="text-lg italic text-gray-800">"{post.content.quote}"</p>
            {post.content.quoteAuthor && (
              <p className="text-gray-600 mt-2">— {post.content.quoteAuthor}</p>
            )}
          </div>
        );

      case 'streak':
        return (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
            <h3 className="text-xl font-bold">🔥 Streak Achievement!</h3>
            <p className="mt-2">{post.content.text}</p>
          </div>
        );

      case 'nft_flex':
        return (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg text-white">
            <h3 className="text-xl font-bold">🏆 NFT Badge Earned!</h3>
            <p className="mt-2">{post.content.text}</p>
          </div>
        );

      default:
        return <p className="text-gray-800">{post.content.text}</p>;
    }
  };

  const isLiked = post.likes?.some(like => like.userId === currentUserId);
  const isReposted = post.reposts?.some(repost => repost.userId === currentUserId);

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {post.user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.user?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-10">
              {isOwnPost && (
                <>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {renderContent()}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.media.map((item, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden">
                {item.mediaType === 'image' ? (
                  <img src={item.url} alt="" className="w-full h-48 object-cover" />
                ) : (
                  <video src={item.url} controls className="w-full h-48 object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.hashtags.map((tag, idx) => (
              <span key={idx} className="text-blue-600 text-sm hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {post.links && post.links.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline text-sm"
              >
                🔗 {link.platform || 'Link'}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-b flex items-center justify-between text-sm text-gray-600">
        <span>{post.stats?.likeCount || 0} likes</span>
        <div className="flex space-x-4">
          <span>{post.stats?.commentCount || 0} comments</span>
          <span>{post.stats?.repostCount || 0} reposts</span>
        </div>
      </div>

      {/* Engagement Actions */}
      <PostEngagementBar
        isLiked={isLiked}
        isReposted={isReposted}
        onLike={handleLike}
        onComment={() => setShowComments(!showComments)}
        onRepost={handleRepost}
        onShare={handleShare}
      />

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments || []}
          onCommentAdded={(updatedPost) => onUpdate(updatedPost)}
        />
      )}
    </div>
  );
};

export default PostCard;
