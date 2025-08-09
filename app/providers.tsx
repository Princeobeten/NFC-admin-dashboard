"use client";

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { StaffProvider } from '../context/StaffContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StaffProvider>
        {children}
      </StaffProvider>
    </AuthProvider>
  );
}
