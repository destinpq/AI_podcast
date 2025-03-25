import React from 'react';

export default function TeamsAndNotes() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teams & Notes</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            New Note
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Create Team
          </button>
        </div>
      </div>

      {/* Teams Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Teams</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No Teams Yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a team to collaborate with others.
            </p>
            <div className="mt-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Create Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Shared Notes</h2>
        </div>
        <div className="p-6">
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Search notes..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="all">All Notes</option>
              <option value="recent">Recently Updated</option>
              <option value="shared">Shared with Me</option>
            </select>
          </div>

          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No Notes Yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a note to start collaborating.
            </p>
            <div className="mt-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Create Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No recent activity to show</p>
          </div>
        </div>
      </div>
    </div>
  );
} 