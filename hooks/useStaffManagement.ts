"use client"

import { useState } from 'react';
import { useStaff, Staff } from '@/context/StaffContext';

export interface NewStaffData {
  name: string;
  department: string;
  nfc_uid: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  email?: string;
  position?: string;
  phone?: string;
}

export function useStaffManagement() {
  const { staff, addStaff, removeStaff, toggleStaffStatus, isLoading, error } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState<NewStaffData>({
    name: '',
    department: '',
    nfc_uid: '',
    status: 'present',
    email: '',
    position: '',
    phone: ''
  });

  // Filter staff based on search term
  const filteredStaff = staff.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      (member.email?.toLowerCase().includes(searchLower) || false) ||
      (member.position?.toLowerCase().includes(searchLower) || false) ||
      member.department.toLowerCase().includes(searchLower) ||
      member.nfc_uid.toLowerCase().includes(searchLower)
    );
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStaff({ ...newStaff, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await addStaff(newStaff);
      setNewStaff({
        name: '',
        department: '',
        nfc_uid: '',
        status: 'present',
        email: '',
        position: '',
        phone: ''
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding staff:', err);
      setSubmitError('Failed to add staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle staff deletion
  const handleDelete = async () => {
    if (staffToDelete) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        await removeStaff(staffToDelete.id);
        setStaffToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (err) {
        console.error('Error removing staff:', err);
        setSubmitError('Failed to remove staff member');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (member: Staff) => {
    setStaffToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Handle status toggle (present/absent)
  const handleToggleStatus = async (id: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await toggleStaffStatus(id);
    } catch (err) {
      console.error('Error toggling staff status:', err);
      setSubmitError('Failed to update staff status');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    staff,
    filteredStaff,
    searchTerm,
    setSearchTerm,
    isAddModalOpen,
    setIsAddModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    staffToDelete,
    newStaff,
    handleInputChange,
    handleSubmit,
    handleDelete,
    openDeleteModal,
    toggleStaffStatus: handleToggleStatus,
    isLoading,
    isSubmitting,
    error,
    submitError
  };
}
