"use client";

import React from 'react';
import Navigation from './Navigation';
import UserProfile from './UserProfile';

export default function DesktopSidebar() {
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">ACSS Admin</h1>
          </div>
          <Navigation />
        </div>
        <UserProfile />
      </div>
    </div>
  );
}
