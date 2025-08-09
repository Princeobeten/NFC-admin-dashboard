"use client";

import React from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface UserProfileProps {
  mobile?: boolean;
}

export default function UserProfile({ mobile = false }: UserProfileProps) {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0)}
          </div>
        </div>
        <div className="ml-3">
          <p className={`${mobile ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>{user.name}</p>
          <button
            onClick={logout}
            className={`${mobile ? 'text-sm' : 'text-xs'} font-medium text-red-500 hover:text-red-700 flex items-center`}
          >
            <ArrowRightOnRectangleIcon className="mr-1 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
