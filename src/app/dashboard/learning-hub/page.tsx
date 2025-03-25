import React from 'react';
import Link from 'next/link';

export default function LearningHub() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Learning Hub</h1>
        <div className="text-sm text-gray-500">
          Your Progress: 0% Complete
        </div>
      </div>

      {/* Featured Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Featured Content</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900">Getting Started Guide</h3>
              <p className="mt-2 text-sm text-blue-700">
                Learn the basics of using our AI tools for research and podcast creation.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/learning-hub/tutorials"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Learning
                </Link>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900">Upcoming Webinar</h3>
              <p className="mt-2 text-sm text-purple-700">
                Join our next webinar to learn advanced techniques for podcast creation.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/learning-hub/webinars"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Learning Paths</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Research Fundamentals</h3>
              <p className="mt-2 text-sm text-gray-500">
                Master the basics of AI-powered research.
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">0%</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Podcast Creation</h3>
              <p className="mt-2 text-sm text-gray-500">
                Learn to create engaging podcast content.
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">0%</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Advanced Techniques</h3>
              <p className="mt-2 text-sm text-gray-500">
                Take your skills to the next level.
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">0%</span>
                </div>
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
            <p className="text-sm text-gray-500">No recent learning activity to show</p>
          </div>
        </div>
      </div>
    </div>
  );
} 