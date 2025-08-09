"use client";

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Navigation from './Navigation';
import UserProfile from './UserProfile';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function MobileSidebar({ sidebarOpen, setSidebarOpen }: MobileSidebarProps) {
  if (!sidebarOpen) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75" 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">ACSS Admin</h1>
          </div>
          <Navigation mobile={true} />
        </div>
        
        <UserProfile mobile={true} />
      </div>
    </div>
  );
}
