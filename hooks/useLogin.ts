"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the validation schema with Zod
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Define the type based on the schema
export type LoginFormData = z.infer<typeof loginSchema>;

export const useLogin = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, authError, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  // Sync auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(data.email, data.password);
      if (success) {
        router.push('/dashboard');
      }
      // Error handling is now done via the authError in useAuth
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    error,
    isLoading: isLoading || authLoading,
    setError,
    user
  };
};
