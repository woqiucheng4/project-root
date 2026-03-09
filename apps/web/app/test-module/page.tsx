import React from 'react';

export default function TestModulePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">TestModule Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your testmodule settings and records here.</p>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
        <div className="text-gray-500 text-sm">
          A list of testModule items will appear here once loaded from the API.
        </div>
      </div>
    </div>
  );
}
