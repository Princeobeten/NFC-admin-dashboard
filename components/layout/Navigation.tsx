"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentChartBarIcon, 
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

export const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Staff Management', href: '/staff', icon: UserGroupIcon },
  { name: 'Attendance', href: '/attendance', icon: ClipboardDocumentCheckIcon },
  { name: 'Reports & Analytics', href: '/reports', icon: DocumentChartBarIcon },
];

interface NavigationProps {
  mobile?: boolean;
}

export default function Navigation({ mobile = false }: NavigationProps) {
  const pathname = usePathname();
  
  return (
    <nav className={`${mobile ? 'mt-5 px-2 space-y-1' : 'mt-5 flex-1 px-2 bg-white space-y-1'}`}>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`
            group flex items-center px-2 py-2 ${mobile ? 'text-base' : 'text-sm'} font-medium rounded-md
            ${pathname === item.href
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
          `}
        >
          <item.icon
            className={`
              ${mobile ? 'mr-4' : 'mr-3'} flex-shrink-0 h-6 w-6
              ${pathname === item.href
                ? 'text-blue-600'
                : 'text-gray-400 group-hover:text-gray-500'}
            `}
            aria-hidden="true"
          />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
