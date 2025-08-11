"use client";

import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
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
import { Bar } from 'react-chartjs-2';
import { useReports } from '@/hooks/useReports';

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

// Helper function to format Firestore timestamps
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '-';
  
  try {
    // Handle Firestore timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return format(date, 'h:mm a');
    }
    
    // Handle ISO strings
    if (typeof timestamp === 'string') {
      const date = parseISO(timestamp);
      if (isValid(date)) {
        return format(date, 'h:mm a');
      }
    }
    
    // Handle date objects
    if (timestamp instanceof Date) {
      return format(timestamp, 'h:mm a');
    }
    
    return '-';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '-';
  }
};

export default function ReportsPage() {
  const {
    staff,
    selectedStaff,
    setSelectedStaff,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedPreset,
    applyPresetFilter,
    stats,
    chartData,
    staffComparisonData,
    attendanceByDate,
    sortedDates,
    paginatedDates,
    // Pagination
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    recordsPerPage,
    setRecordsPerPage,
    // Export
    exportToCSV,
    // Loading state
    isLoading,
    error,
    filteredAttendance
  } = useReports();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Attendance Report Filters</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select staff member and date range to generate attendance reports.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
              {/* Staff Member Filter */}
              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">
                  Staff Member
                </label>
                <select
                  id="staff"
                  name="staff"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="mt-1 block w-full px-2 py-2 text-base text-gray-700 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Staff</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetFilter('today')}
                    className={`px-3 py-1 text-sm rounded-md ${selectedPreset === 'today' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFilter('yesterday')}
                    className={`px-3 py-1 text-sm rounded-md ${selectedPreset === 'yesterday' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFilter('thisWeek')}
                    className={`px-3 py-1 text-sm rounded-md ${selectedPreset === 'thisWeek' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFilter('thisMonth')}
                    className={`px-3 py-1 text-sm rounded-md ${selectedPreset === 'thisMonth' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetFilter('thisYear')}
                    className={`px-3 py-1 text-sm rounded-md ${selectedPreset === 'thisYear' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    This Year
                  </button>
                </div>
              </div>
              
              {/* Custom Date Range */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md text-gray-700 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md text-gray-700 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={exportToCSV}
                  disabled={filteredAttendance.length === 0 || isLoading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${filteredAttendance.length === 0 || isLoading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-8 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-700">Loading attendance data...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredAttendance.length === 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No attendance records found for the selected date range and staff member.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Try adjusting your filters or selecting a different date range.
          </p>
        </div>
      )}

      {/* Summary Stats - Only show when data is available */}
      {!isLoading && !error && filteredAttendance.length > 0 && (
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Days</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalDays}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Present Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {stats.presentPercentage.toFixed(1)}%
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Late Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.latePercentage.toFixed(1)}%
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Absent Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              {stats.absentPercentage.toFixed(1)}%
            </dd>
          </div>
        </div>
      </div>
      )}

      {/* Charts - Only show when data is available */}
      {!isLoading && !error && filteredAttendance.length > 0 && (
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Attendance Distribution Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Attendance Distribution
            </h3>
            <div className="mt-4 h-64">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Staff Comparison Chart (only shown when "All Staff" is selected) */}
        {selectedStaff === 'all' && staffComparisonData && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Staff Comparison
              </h3>
              <div className="mt-4 h-64">
                <Bar
                  data={staffComparisonData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: false,
                      },
                      y: {
                        stacked: false,
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
        )}
      </div>
      )}

      {/* Detailed Report Table - Only show when data is available */}
      {!isLoading && !error && filteredAttendance.length > 0 && (
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Detailed Attendance Report
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {selectedStaff === 'all'
                ? 'Showing attendance for all staff'
                : `Showing attendance for ${
                    staff.find((s) => s.id === selectedStaff)?.name
                  }`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  {selectedStaff === 'all' && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Staff
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check In
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check In Device
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check Out
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check Out Device
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDates.map((date) => (
                  <React.Fragment key={date}>
                    {attendanceByDate[date].map((record, idx) => {
                      const staffMember = staff.find((s) => s.id === record.user_id);
                      return (
                        <tr key={`${date}-${record.user_id}`}>
                          {idx === 0 && (
                            <td
                              rowSpan={attendanceByDate[date].length}
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                            >
                              {format(parseISO(date), 'MMM dd, yyyy')}
                            </td>
                          )}
                          {selectedStaff === 'all' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {staffMember?.name}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              // Determine status based on timestamps
                              let status = 'No Data';
                              let colorClasses = 'bg-gray-100 text-gray-800';
                              
                              if (record.timestamp && record.checkout_timestamp) {
                                status = 'Complete';
                                colorClasses = 'bg-green-100 text-green-800';
                              } else if (record.timestamp) {
                                status = 'Checked In';
                                colorClasses = 'bg-blue-100 text-blue-800';
                              } else if (record.checkout_timestamp) {
                                status = 'Checked Out';
                                colorClasses = 'bg-yellow-100 text-yellow-800';
                              }
                              
                              return (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
                                  {status}
                                </span>
                              );
                            })()} 
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimestamp(record.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.device_id || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimestamp(record.checkout_timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkout_device_id || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              {/* Records per page selector */}
              <div className="flex items-center">
                <label htmlFor="recordsPerPage" className="mr-2 text-sm text-gray-700">
                  Records per page:
                </label>
                <select
                  id="recordsPerPage"
                  value={recordsPerPage}
                  onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                  className="block w-20 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>
              
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * recordsPerPage, sortedDates.length)}
                    </span>{' '}
                    of <span className="font-medium">{sortedDates.length}</span> dates
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
)}

    </div>

  )
}
