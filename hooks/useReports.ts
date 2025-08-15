"use client"

import { useState, useMemo } from 'react';
import { useStaff, AttendanceRecord, Staff } from '@/context/StaffContext';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, subDays, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';

export const useReports = () => {
  const { staff, getStaffAttendance, getAllAttendance, isLoading, error } = useStaff();
  
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<string>('today');
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to today
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState<string>(() => {
    // Default to today
    return format(new Date(), 'yyyy-MM-dd');
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);

  // Get attendance records based on filters
  const getFilteredAttendance = (): AttendanceRecord[] => {
    if (selectedStaff === 'all') {
      return getAllAttendance(startDate, endDate);
    } else {
      return getStaffAttendance(selectedStaff, startDate, endDate);
    }
  };

  const filteredAttendance = getFilteredAttendance();

  // Calculate attendance statistics based on records with timestamp (check-in) and checkout_timestamp/check_out_time (check-out)
  const calculateStats = () => {
    const totalDays = new Set(filteredAttendance.map(record => record.date)).size;
    const totalRecords = filteredAttendance.length;
    
    // Group by user_id and date to count unique check-ins
    const userDateMap = new Map<string, Set<string>>();
    filteredAttendance.forEach(record => {
      if (record.timestamp) { // Check if there's a check-in timestamp
        const key = `${record.user_id}-${record.date}`;
        if (!userDateMap.has(key)) {
          userDateMap.set(key, new Set());
        }
        userDateMap.get(key)?.add(record.date);
      }
    });
    
    const presentCount = userDateMap.size;
    const absentCount = staff.length * totalDays - presentCount;
    
    const presentPercentage = totalDays > 0 && staff.length > 0 ? 
      (presentCount / (staff.length * totalDays)) * 100 : 0;
    const absentPercentage = totalDays > 0 && staff.length > 0 ? 
      (absentCount / (staff.length * totalDays)) * 100 : 0;
    
    return {
      totalDays,
      totalRecords,
      presentCount,
      lateCount: 0, // Not tracked in new structure
      absentCount,
      halfDayCount: 0, // Not tracked in new structure
      presentPercentage,
      latePercentage: 0, // Not tracked in new structure
      absentPercentage,
      halfDayPercentage: 0, // Not tracked in new structure
    };
  };

  const stats = calculateStats();

  // Prepare data for attendance chart
  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        label: 'Attendance Distribution',
        data: [stats.presentCount, stats.absentCount],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for staff comparison chart (if all staff selected)
  const prepareStaffComparisonData = () => {
    if (selectedStaff !== 'all') return null;

    // Track check-ins and check-outs by staff member
    const staffData: Record<string, { checkIns: number; checkOuts: number; dates: Set<string> }> = {};
    
    // Initialize data for each staff member
    staff.forEach(member => {
      staffData[member.id] = { checkIns: 0, checkOuts: 0, dates: new Set() };
    });
    
    // Count check-ins and check-outs for each staff member
    filteredAttendance.forEach(record => {
      if (staffData[record.user_id]) {
        if (record.timestamp) {
          staffData[record.user_id].checkIns++;
          staffData[record.user_id].dates.add(record.date);
        }
        // Check for checkout_timestamp or check_out_time
        if (record.checkout_timestamp || record.check_out_time) {
          staffData[record.user_id].checkOuts++;
        }
      }
    });
    
    // Prepare chart data
    const labels = staff.map(member => member.name.split(' ')[0]); // Use first name only for brevity
    
    const checkInData = staff.map(member => staffData[member.id]?.checkIns || 0);
    const checkOutData = staff.map(member => staffData[member.id]?.checkOuts || 0);
    const uniqueDatesData = staff.map(member => staffData[member.id]?.dates.size || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Total Check-ins',
          data: checkInData,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Total Check-outs',
          data: checkOutData,
          backgroundColor: 'rgba(234, 88, 12, 0.6)',
          borderColor: 'rgb(234, 88, 12)',
          borderWidth: 1,
        },
        {
          label: 'Days Present',
          data: uniqueDatesData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        }
      ],
    };
  };

  const staffComparisonData = prepareStaffComparisonData();

  // Group attendance records by date for the detailed table
  const attendanceByDate = filteredAttendance.reduce<Record<string, AttendanceRecord[]>>(
    (acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = [];
      }
      acc[record.date].push(record);
      return acc;
    },
    {}
  );
  
  // Get staff member name by ID
  const getStaffName = (userId: string): string => {
    const member = staff.find(s => s.id === userId);
    return member ? member.name : 'Unknown';
  };

  // Sort dates in descending order
  const sortedDates = Object.keys(attendanceByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Pagination logic
  const totalDates = sortedDates.length;
  const totalPages = Math.ceil(totalDates / recordsPerPage);
  
  // Get paginated dates and records
  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return sortedDates.slice(startIndex, endIndex);
  }, [sortedDates, currentPage, recordsPerPage]);
  
  // Get paginated records for the detailed table
  const paginatedRecords = useMemo(() => {
    const records: AttendanceRecord[] = [];
    paginatedDates.forEach(date => {
      records.push(...attendanceByDate[date]);
    });
    return records;
  }, [paginatedDates, attendanceByDate]);
  
  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
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

  // Apply preset date filters
  const applyPresetFilter = (preset: string) => {
    setSelectedPreset(preset);
    const today = new Date();
    let start, end;
    
    switch (preset) {
      case 'today':
        start = end = format(today, 'yyyy-MM-dd');
        break;
      case 'yesterday':
        start = end = format(subDays(today, 1), 'yyyy-MM-dd');
        break;
      case 'thisWeek':
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        end = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'thisYear':
        start = format(startOfYear(today), 'yyyy-MM-dd');
        end = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      case 'custom':
        // Don't change dates for custom
        return;
      default:
        start = end = format(today, 'yyyy-MM-dd');
    }
    
    setStartDate(start);
    setEndDate(end);
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  // Handle custom date changes
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    // When manually changing dates, switch to custom preset
    setSelectedPreset('custom');
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  // Export data to CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = [
      'Date',
      'Staff Name',
      'Department',
      'Status',
      'Check-In Time',
      'Check-Out Time',
      'Check-In Device',
      'Check-Out Device'
    ];

    // Process records for CSV
    const rows = filteredAttendance.map(record => {
      // Format timestamps
      let checkInTime = '-';
      let checkOutTime = '-';
      
      // Format check-in timestamp
      if (record.timestamp) {
        try {
          if (typeof record.timestamp.toDate === 'function') {
            checkInTime = format(record.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss');
          } else if (record.timestamp instanceof Date) {
            checkInTime = format(record.timestamp, 'yyyy-MM-dd HH:mm:ss');
          } else if (typeof record.timestamp === 'string') {
            const date = parseISO(record.timestamp);
            checkInTime = format(date, 'yyyy-MM-dd HH:mm:ss');
          }
        } catch (e) {
          checkInTime = String(record.timestamp);
        }
      }
      
      // Format check-out timestamp (check for both checkout_timestamp and check_out_time)
      const checkoutTime = record.checkout_timestamp || record.check_out_time;
      if (checkoutTime) {
        try {
          if (typeof checkoutTime.toDate === 'function') {
            checkOutTime = format(checkoutTime.toDate(), 'yyyy-MM-dd HH:mm:ss');
          } else if (checkoutTime instanceof Date) {
            checkOutTime = format(checkoutTime, 'yyyy-MM-dd HH:mm:ss');
          } else if (typeof checkoutTime === 'string') {
            const date = parseISO(checkoutTime);
            checkOutTime = format(date, 'yyyy-MM-dd HH:mm:ss');
          }
        } catch (e) {
          checkOutTime = String(checkoutTime);
        }
      }

      // Find staff member
      const staffMember = staff.find(s => s.id === record.user_id);
      
      // Determine status based on timestamps
      let status = 'No Data';
      const hasCheckout = record.checkout_timestamp || record.check_out_time;
      if (record.timestamp && hasCheckout) {
        status = 'Complete';
      } else if (record.timestamp) {
        status = 'Checked In';
      } else if (hasCheckout) {
        status = 'Checked Out';
      }
      
      return [
        record.date,
        record.name || (staffMember?.name || 'Unknown'),
        record.department || (staffMember?.department || 'Unknown'),
        status,
        checkInTime,
        checkOutTime,
        record.device_id || '-',
        record.checkout_device_id || '-'
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    staff,
    selectedStaff,
    setSelectedStaff,
    startDate,
    setStartDate: (date: string) => handleDateChange('start', date),
    endDate,
    setEndDate: (date: string) => handleDateChange('end', date),
    selectedPreset,
    applyPresetFilter,
    filteredAttendance,
    stats,
    chartData,
    staffComparisonData,
    attendanceByDate,
    sortedDates,
    paginatedDates,
    paginatedRecords,
    totalPages,
    currentPage,
    setCurrentPage,
    goToPage,
    nextPage,
    prevPage,
    recordsPerPage,
    setRecordsPerPage,
    exportToCSV,
    isLoading,
    error
  };
};
