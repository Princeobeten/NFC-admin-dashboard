"use client"

import { useState } from 'react';
import { useStaff, AttendanceRecord } from '../context/StaffContext';
import { format, subDays, isToday, parseISO } from 'date-fns';

export const useDashboard = () => {
  const { staff, attendanceRecords } = useStaff();
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  // Get today's date
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');

  // Calculate date range based on selected timeframe
  const startDate = format(
    subDays(today, timeframe === 'week' ? 7 : 30),
    'yyyy-MM-dd'
  );

  // Filter attendance records for the selected timeframe
  const filteredRecords: AttendanceRecord[] = attendanceRecords.filter(
    (record) => record.date >= startDate && record.date <= formattedToday
  );

  // Count staff by status
  const activeStaffCount = staff.filter((member) => member.status === 'active').length;
  const inactiveStaffCount = staff.filter((member) => member.status === 'inactive').length;

  // Get today's attendance
  const todayAttendance = attendanceRecords.filter(
    (record) => record.date === formattedToday
  );

  const presentToday = todayAttendance.filter(
    (record) => record.status === 'present'
  ).length;

  const lateToday = todayAttendance.filter(
    (record) => record.status === 'late'
  ).length;

  const absentToday = todayAttendance.filter(
    (record) => record.status === 'absent'
  ).length;

  const halfDayToday = todayAttendance.filter(
    (record) => record.status === 'half-day'
  ).length;

  // Calculate attendance statistics for the selected timeframe
  const attendanceStats = {
    present: filteredRecords.filter((record) => record.status === 'present').length,
    late: filteredRecords.filter((record) => record.status === 'late').length,
    absent: filteredRecords.filter((record) => record.status === 'absent').length,
    halfDay: filteredRecords.filter((record) => record.status === 'half-day').length,
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
  const recentAttendanceRecords = attendanceRecords
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
    recentAttendanceRecords
  };
};
