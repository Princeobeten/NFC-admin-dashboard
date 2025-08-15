"use client"

import { useState, useEffect } from 'react';
import { useStaff, AttendanceRecord } from '../context/StaffContext';
import { useSettings } from '@/hooks/useSettings';
import { format, subDays, isToday, parseISO, setHours, setMinutes } from 'date-fns';

export const useDashboard = () => {
  const { staff, attendanceRecords } = useStaff();
  const { attendanceRules, loading: settingsLoading } = useSettings();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [processedRecords, setProcessedRecords] = useState<AttendanceRecord[]>([]);

  // Get today's date
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');

  // Calculate date range based on selected timeframe
  const startDate = format(
    subDays(today, timeframe === 'week' ? 7 : 30),
    'yyyy-MM-dd'
  );

  // Process attendance records to determine late status based on settings
  useEffect(() => {
    if (!attendanceRules || settingsLoading) return;

    // console.log('Processing records with timeframe:', timeframe);
    // console.log('Attendance records count:', attendanceRecords.length);
    
    // Process attendance records to determine late status
    const processed = attendanceRecords.map(record => {
      // If record already has a status, keep it unless it's related to lateness
      if (record.status && record.status !== 'late' && record.status !== 'present') {
        return record;
      }

      // Check if check-in is late based on settings
      if (attendanceRules?.work_hours && record.timestamp) {
        const { start_hour, start_minute } = attendanceRules.work_hours;
        const lateMinutes = attendanceRules.thresholds?.late_minutes || 0;
        
        // Create the expected start time for the day
        const recordDate = parseISO(record.date);
        const expectedStartTime = setMinutes(
          setHours(recordDate, start_hour),
          start_minute
        );
        
        // Add the late threshold to get the cutoff time
        const lateThreshold = new Date(expectedStartTime.getTime() + lateMinutes * 60 * 1000);
        
        // Get the actual check-in time
        let checkInTime: Date;
        if (typeof record.timestamp.toDate === 'function') {
          // Firestore timestamp
          checkInTime = record.timestamp.toDate();
        } else if (typeof record.timestamp === 'string') {
          // ISO string
          checkInTime = new Date(record.timestamp);
        } else {
          // Date object
          checkInTime = record.timestamp;
        }
        
        // Update status based on check-in time
        if (checkInTime > lateThreshold) {
          return { ...record, status: 'late' };
        } else {
          return { ...record, status: 'present' };
        }
      }
      
      return record;
    });

    setProcessedRecords(processed);
  }, [attendanceRecords, attendanceRules, settingsLoading, timeframe]);

  // Filter attendance records for the selected timeframe
  const filteredRecords: AttendanceRecord[] = processedRecords.filter(
    (record) => record.date >= startDate && record.date <= formattedToday
  );

  // Count staff by status
  const activeStaffCount = staff.filter((member) => member.status === 'active').length;
  const inactiveStaffCount = staff.filter((member) => member.status === 'inactive').length;

  // Get today's attendance from processed records
  const todayAttendance = processedRecords.filter(
    (record) => record.date === formattedToday
  );

  // console.log('Today\'s attendance records:', todayAttendance);
  // console.log('Active staff count:', activeStaffCount);
  
  // Count unique users who are present today
  const presentUserIds = new Set(
    todayAttendance
      .filter(record => record.status === 'present')
      .map(record => record.user_id)
  );
  const presentToday = presentUserIds.size;

  // Count unique users who are late today
  const lateUserIds = new Set(
    todayAttendance
      .filter(record => record.status === 'late')
      .map(record => record.user_id)
  );
  const lateToday = lateUserIds.size;

  // Calculate absent as active staff minus those who checked in (present or late)
  const absentToday = Math.max(0, activeStaffCount - (presentToday + lateToday));

  const halfDayToday = todayAttendance.filter(
    (record) => record.status === 'half-day'
  ).length;

  // Calculate attendance statistics for the selected timeframe
  // Get unique dates in the filtered records
  const uniqueDates = Array.from(new Set(filteredRecords.map(record => record.date)));
  // console.log('Unique dates in timeframe:', uniqueDates);
  
  // Count unique users per status per day
  const userStatusMap = new Map();
  
  // Initialize counters
  let presentCount = 0;
  let lateCount = 0;
  let halfDayCount = 0;
  
  // Process each date
  uniqueDates.forEach(date => {
    const dateRecords = filteredRecords.filter(record => record.date === date);
    
    // Get unique users who are present on this date
    const presentUsers = new Set(
      dateRecords
        .filter(record => record.status === 'present')
        .map(record => record.user_id)
    );
    presentCount += presentUsers.size;
    
    // Get unique users who are late on this date
    const lateUsers = new Set(
      dateRecords
        .filter(record => record.status === 'late')
        .map(record => record.user_id)
    );
    lateCount += lateUsers.size;
    
    // Get unique users who are half-day on this date
    const halfDayUsers = new Set(
      dateRecords
        .filter(record => record.status === 'half-day')
        .map(record => record.user_id)
    );
    halfDayCount += halfDayUsers.size;
  });
  
  // Calculate total possible attendance (active staff × number of days)
  const totalPossibleAttendance = activeStaffCount * uniqueDates.length;
  
  // Calculate absent count
  const absentCount = Math.max(0, totalPossibleAttendance - (presentCount + lateCount));
  
  // console.log('Stats calculation:', { 
  //   presentCount, 
  //   lateCount, 
  //   absentCount, 
  //   halfDayCount, 
  //   totalPossibleAttendance 
  // });
  
  const attendanceStats = {
    present: presentCount,
    late: lateCount,
    absent: absentCount,
    halfDay: halfDayCount,
  };

  // Prepare data for attendance trend chart
  const prepareTrendData = () => {
    const dates: string[] = [];
    const presentData: number[] = [];
    const lateData: number[] = [];
    const absentData: number[] = [];

    // Get unique dates in the filtered records
    const uniqueDatesSet = new Set(filteredRecords.map((record) => record.date));
    const uniqueDates = Array.from(uniqueDatesSet).sort();

    uniqueDates.forEach((date) => {
      const dateRecords = filteredRecords.filter((record) => record.date === date);
      const totalStaff = dateRecords.length;
      
      const present = dateRecords.filter((record) => record.status === 'present').length;
      const late = dateRecords.filter((record) => record.status === 'late').length;
      const absent = dateRecords.filter((record) => record.status === 'absent').length;

      dates.push(format(parseISO(date), 'MMM dd'));
      presentData.push((present / totalStaff) * 100);
      lateData.push((late / totalStaff) * 100);
      absentData.push((absent / totalStaff) * 100);
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Present',
          data: presentData,
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Late',
          data: lateData,
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 1,
        },
        {
          label: 'Absent',
          data: absentData,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for today's attendance chart
  const todayAttendanceData = {
    labels: ['Present', 'Late', 'Absent', 'Half Day'],
    datasets: [
      {
        data: [presentToday, lateToday, absentToday, halfDayToday],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(79, 70, 229, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
          'rgb(79, 70, 229)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Get recent attendance records
  const recentAttendanceRecords = processedRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    staff,
    timeframe,
    setTimeframe,
    activeStaffCount,
    inactiveStaffCount,
    presentToday,
    lateToday,
    absentToday,
    halfDayToday,
    attendanceStats,
    prepareTrendData,
    todayAttendanceData,
    recentAttendanceRecords,
    attendanceRules
  };
};
