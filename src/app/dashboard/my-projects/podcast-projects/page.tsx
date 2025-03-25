import React from 'react';
import Link from 'next/link';

export default function PodcastProjects() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Podcast Projects</h1>
        <Link
          href="/dashboard/ai-tools/script-writer"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Podcast Project
        </Link>
      </div>

      {/* Project Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search podcasts..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="all">All Episodes</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty State */}
        <div className="col-span-full text-center py-12">
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-medium text-gray-900">No Podcast Projects Yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first podcast episode.
            </p>
            <div className="mt-4">
              <Link
                href="/dashboard/ai-tools/script-writer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Episode
              </Link>
            </div>
          </div>
        </div>

        {/* Project Card Template (commented out until needed) */}
        {/* <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Episode Title</h3>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Published
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Episode description goes here...
            </p>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Duration:</span>
                <span className="text-sm font-medium text-gray-900">15:30</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Last updated:</span>
                <span className="text-sm font-medium text-gray-900">2 days ago</span>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Previous
          </button>
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
            1
          </button>
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
            Next
          </button>
        </nav>
      </div>
    </div>
  );
} 