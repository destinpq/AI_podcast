import React from 'react';

export default function Community() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Community</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          New Post
        </button>
      </div>

      {/* Discussion Boards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Discussion Boards</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer">
              <h3 className="text-lg font-medium text-gray-900">Research Discussions</h3>
              <p className="mt-2 text-sm text-gray-500">
                Share and discuss research methodologies, findings, and best practices.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>0 topics</span>
                <span className="mx-2">•</span>
                <span>0 replies</span>
              </div>
            </div>
            <div className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer">
              <h3 className="text-lg font-medium text-gray-900">Podcast Creation</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tips, tricks, and discussions about podcast creation and production.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>0 topics</span>
                <span className="mx-2">•</span>
                <span>0 replies</span>
              </div>
            </div>
            <div className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer">
              <h3 className="text-lg font-medium text-gray-900">AI Tools</h3>
              <p className="mt-2 text-sm text-gray-500">
                Discuss AI tools, share experiences, and get help with features.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>0 topics</span>
                <span className="mx-2">•</span>
                <span>0 replies</span>
              </div>
            </div>
            <div className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer">
              <h3 className="text-lg font-medium text-gray-900">General Discussion</h3>
              <p className="mt-2 text-sm text-gray-500">
                General topics and community announcements.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>0 topics</span>
                <span className="mx-2">•</span>
                <span>0 replies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No recent community activity to show</p>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Community Members</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Topics</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Replies</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
    </div>
  );
} 