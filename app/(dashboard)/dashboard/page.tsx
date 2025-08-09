"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
// Removed AttendanceMarker import
import { useDashboard } from '../../../hooks/useDashboard';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const {
    staff,
    timeframe,
    setTimeframe,
    activeStaffCount,
    presentToday,
    lateToday,
    absentToday,
    halfDayToday,
    prepareTrendData,
    todayAttendanceData,
    recentAttendanceRecords
  } = useDashboard();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="mt-3 sm:mt-0">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeframe === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTimeframe('week')}
            >
              Last Week
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeframe === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTimeframe('month')}
            >
              Last Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Staff
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {staff.length}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Present Today
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {presentToday}
                  </div>
                  <div className="ml-2 text-sm text-green-600">
                    {activeStaffCount > 0 ? Math.round((presentToday / activeStaffCount) * 100) : 0}%
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Late Today
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {lateToday}
                  </div>
                  <div className="ml-2 text-sm text-yellow-600">
                    {activeStaffCount > 0 ? Math.round((lateToday / activeStaffCount) * 100) : 0}%
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Absent Today
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {absentToday}
                  </div>
                  <div className="ml-2 text-sm text-red-600">
                    {activeStaffCount > 0 ? Math.round((absentToday / activeStaffCount) * 100) : 0}%
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Attendance Trend Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Attendance Trend ({timeframe === 'week' ? 'Last 7 Days' : 'Last 30 Days'})
            </h3>
            <div className="mt-4 h-64">
              <Bar
                data={prepareTrendData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Today's Attendance Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Today's Attendance
            </h3>
            <div className="mt-4 h-64 flex items-center justify-center">
              <div className="w-64">
                <Doughnut
                  data={todayAttendanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Attendance Section removed */}

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Attendance Activity
            </h3>
          </div>
          {recentAttendanceRecords && recentAttendanceRecords.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentAttendanceRecords.map((record) => {
                  // Use record.user_id instead of record.staffId to find the staff member
                  const staffMember = staff.find((s) => s.id === record.user_id);
                  // Use record.name directly if staffMember is not found
                  const displayName = staffMember?.name || record.name || 'Unknown Staff';
                  const displayInitial = displayName.charAt(0) || '?';
                  
                  return (
                    <li key={record.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {displayInitial}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {displayName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {staffMember?.position || ''} {staffMember?.department || record.department ? `• ${staffMember?.department || record.department}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm text-gray-500">
                              {record.date ? format(parseISO(record.date), 'MMM dd, yyyy') : 'Unknown date'}
                            </div>
                            {/* <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : record.status === 'half-day'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown'}
                            </span> */}
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            {record.action === 'check_in' && (
                              <div className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Check-in: {record.timestamp ? format(record.timestamp.toDate(), 'HH:mm:ss') : 'N/A'}
                              </div>
                            )}
                            {record.action === 'check_out' && (
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Check-out: {record.timestamp ? format(record.timestamp.toDate(), 'HH:mm:ss') : 'N/A'}
                              </div>
                            )}
                          </div>
                        </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No recent attendance activity found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
