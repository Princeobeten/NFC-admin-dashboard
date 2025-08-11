"use client"

import { useState } from 'react';
import { useStaff } from '@/context/StaffContext';
import { AttendanceRecord, AttendanceDay } from '@/context/StaffContext';
import { format, parseISO, isToday, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  halfDay: number;
  presentRate: number;
  lateRate: number;
  absentRate: number;
  halfDayRate: number;
  // Additional properties for UI display
  presentCount: number;
  absentCount: number;
  totalDays: number;
}

export const useAttendance = () => {
  const { staff, attendanceDays, attendanceRecords, markAttendance, isLoading, error } = useStaff();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [action, setAction] = useState<'check_in' | 'check_out'>('check_in');
  const [deviceId, setDeviceId] = useState<string>('web-portal');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Filter present staff
  const presentStaff = staff.filter((s: { status: string; }) => s.status === 'present');

  // Get today's attendance records
  const todayRecords = attendanceRecords.filter((record: { date: string; }) => {
    return isToday(parseISO(record.date));
  });

  // Get records for the selected date and staff
  const selectedDateRecords = attendanceRecords.filter((record: { date: string; user_id: string; }) => {
    const dateMatches = record.date === format(selectedDate, 'yyyy-MM-dd');
    const staffMatches = selectedStaffId === 'all' || record.user_id === selectedStaffId;
    return dateMatches && staffMatches;
  });
  
  // Get the attendance day for the selected date
  const selectedAttendanceDay = attendanceDays.find((day: { date: string; }) => {
    return day.date === format(selectedDate, 'yyyy-MM-dd');
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = selectedDateRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(selectedDateRecords.length / recordsPerPage);
  
  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate attendance statistics
  const calculateStats = (records: AttendanceRecord[]): AttendanceStats => {
    // Get unique staff IDs that have attendance records (either check-in or check-out)
    const uniqueStaffIds = new Set(records.map(record => record.user_id));
    
    // Get unique dates in the records to determine total days
    const uniqueDates = new Set(records.map(record => record.date));
    const totalDays = uniqueDates.size || 1; // Ensure at least 1 to avoid division by zero
    
    const attendanceSummary = {
      present: uniqueStaffIds.size,
      absent: staff.length - uniqueStaffIds.size,
      total: staff.length
    };

    return {
      total: attendanceSummary.total,
      present: attendanceSummary.present,
      late: 0,
      absent: attendanceSummary.absent,
      halfDay: 0,
      presentRate: attendanceSummary.total > 0 ? (attendanceSummary.present / attendanceSummary.total) * 100 : 0,
      lateRate: 0,
      absentRate: attendanceSummary.total > 0 ? (attendanceSummary.absent / attendanceSummary.total) * 100 : 0,
      halfDayRate: 0,
      // Add the missing properties
      presentCount: attendanceSummary.present,
      absentCount: attendanceSummary.absent,
      totalDays: totalDays
    };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedStaffId) {
      setSubmitError('Please select a staff member');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Mark attendance with the selected action (check-in or check-out)
      await markAttendance(selectedStaffId, action, deviceId);
      
      // Reset form (but keep the selected staff for convenience)
      setAction('check_in'); // Reset to check-in for next submission
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setSubmitError('Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle month navigation
  const previousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };

  const nextMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, -1));
  };

  // Get staff attendance for the selected date
  const getStaffAttendanceForDate = (userId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return attendanceRecords.filter((record: { user_id: string; date: string; }) => {
      return record.user_id === userId && record.date === dateStr;
    });
  };
  
  // Get monthly records
  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  
  const monthlyRecords = attendanceRecords.filter((record: { date: string; }) => {
    return record.date >= startDate && record.date <= endDate;
  });
  
  // Calculate monthly stats
  const monthlyStats = calculateStats(monthlyRecords);
  
  // Handle page navigation
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    staff,
    presentStaff,
    selectedDate,
    setSelectedDate,
    selectedStaffId,
    setSelectedStaffId,
    action,
    setAction,
    deviceId,
    setDeviceId,
    currentMonth,
    setCurrentMonth,
    previousMonth,
    nextMonth,
    todayRecords,
    selectedDateRecords,
    selectedAttendanceDay,
    monthlyRecords,
    monthlyStats,
    // Pagination
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    currentRecords,
    recordsPerPage,
    setRecordsPerPage,
    // Loading states
    isLoading,
    error,
    submitting,
    submitError,
    // Attendance submission
    handleSubmit,
    getStaffAttendanceForDate
  };
}
