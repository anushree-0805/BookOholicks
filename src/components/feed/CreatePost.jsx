import React, { useState } from 'react';
import { Image, Video, Link2, Hash, Star, Quote, BookOpen, X } from 'lucide-react';
import api from '../../config/api';

const CreatePost = ({ onPostCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState({
    text: '',
    bookTitle: '',
    bookAuthor: '',
    rating: 0,
    quote: '',
    quoteAuthor: ''
  });
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [links, setLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [linkPlatform, setLinkPlatform] = useState('other');
  const [loading, setLoading] = useState(false);

  const postTypes = [
    { id: 'text', label: 'Text', icon: BookOpen },
    { id: 'review', label: 'Review', icon: Star },
    { id: 'quote', label: 'Quote', icon: Quote }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean content based on post type
      let cleanContent = {};
      if (postType === 'text') {
        cleanContent = { text: content.text };
      } else if (postType === 'review') {
        cleanContent = {
          text: content.text,
          bookTitle: content.bookTitle,
          bookAuthor: content.bookAuthor,
          rating: content.rating
        };
      } else if (postType === 'quote') {
        cleanContent = {
          text: content.text,
          quote: content.quote,
          quoteAuthor: content.quoteAuthor
        };
      }

      const postData = {
        postType,
        content: cleanContent,
        hashtags: hashtags.filter(tag => tag.trim()),
        links: links.filter(link => link.url && link.url.trim()),
        isPublic: true
      };

      const response = await api.post('/posts', postData);

      onPostCreated(response.data);
      resetForm();
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to create post: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent({
      text: '',
      bookTitle: '',
      bookAuthor: '',
      rating: 0,
      quote: '',
      quoteAuthor: ''
    });
    setHashtags([]);
    setLinks([]);
    setHashtagInput('');
    setLinkInput('');
    setIsExpanded(false);
    setPostType('text');
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const addLink = () => {
    if (linkInput.trim()) {
      setLinks([...links, { url: linkInput.trim(), platform: linkPlatform }]);
      setLinkInput('');
      setLinkPlatform('other');
    }
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="p-4">
        {/* Post Type Selector */}
        {isExpanded && (
          <div className="flex space-x-2 mb-4">
            {postTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setPostType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    postType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Input Area */}
        <textarea
          placeholder="What's on your mind? Share a book, review, or thought..."
          value={content.text}
          onChange={(e) => setContent({ ...content, text: e.target.value })}
          onFocus={() => setIsExpanded(true)}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={isExpanded ? 4 : 2}
        />

        {/* Additional Fields Based on Post Type */}
        {isExpanded && postType === 'review' && (
          <div className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="text"
              placeholder="Book Title"
              value={content.bookTitle}
              onChange={(e) => setContent({ ...content, bookTitle: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Author"
              value={content.bookAuthor}
              onChange={(e) => setContent({ ...content, bookAuthor: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setContent({ ...content, rating: star })}
                  className={`text-2xl ${star <= content.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        {isExpanded && postType === 'quote' && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
            <textarea
              placeholder="Enter the quote..."
              value={content.quote}
              onChange={(e) => setContent({ ...content, quote: e.target.value })}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <input
              type="text"
              placeholder="Quote Author"
              value={content.quoteAuthor}
              onChange={(e) => setContent({ ...content, quoteAuthor: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Hashtags */}
        {isExpanded && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add hashtag (without #)"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Hash size={18} />
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                    <span>#{tag}</span>
                    <button onClick={() => removeHashtag(tag)} className="hover:text-blue-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Links */}
        {isExpanded && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Add link (Amazon, Goodreads, etc.)"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={linkPlatform}
                onChange={(e) => setLinkPlatform(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="amazon">Amazon</option>
                <option value="goodreads">Goodreads</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Link2 size={18} />
              </button>
            </div>
            {links.length > 0 && (
              <div className="space-y-2 mt-2">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-blue-600 truncate flex-1">{link.url}</span>
                    <span className="text-xs text-gray-500 mx-2">({link.platform})</span>
                    <button onClick={() => removeLink(idx)} className="text-red-500 hover:text-red-700">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isExpanded && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Add Image">
                <Image size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Add Video">
                <Video size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || (!content.text && !content.quote)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
