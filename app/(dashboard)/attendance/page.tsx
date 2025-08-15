"use client";

import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAttendance } from '@/hooks/useAttendance';
import { Staff } from '@/context/StaffContext';
import { FirebaseError } from 'firebase/app';

export default function AttendancePage() {
  const {
    staff,
    presentStaff,
    selectedStaffId,
    setSelectedStaffId,
    selectedDate,
    setSelectedDate,
    currentMonth,
    previousMonth,
    nextMonth,
    selectedDateRecords,
    monthlyRecords,
    monthlyStats,
    // Pagination
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    recordsPerPage: defaultRecordsPerPage,
    setRecordsPerPage: setAttendanceRecordsPerPage
  } = useAttendance();
  
  // Local state for view settings
  const [viewMode] = React.useState('view-only');
  const [recordsPerPage, setRecordsPerPage] = React.useState(defaultRecordsPerPage || 10);
  const [hasShownRecords, setHasShownRecords] = React.useState(false);
  
  // Handle records per page change
  const handleRecordsPerPageChange = (value: number) => {
    setRecordsPerPage(value);
    setAttendanceRecordsPerPage(value);
  };

  // Find most recent date with records to display by default
  useEffect(() => {
    if (selectedDateRecords.length === 0 && !hasShownRecords && monthlyRecords.length > 0) {
      // Get unique dates from monthly records in descending order (most recent first)
      const allDates = monthlyRecords.map(record => record.date);
      const uniqueDates = allDates.filter((date, index) => allDates.indexOf(date) === index).sort().reverse();
      
      if (uniqueDates.length > 0) {
        // Select the most recent date that has records
        const mostRecentDate = parseISO(uniqueDates[0]);
        setSelectedDate(mostRecentDate);
        setHasShownRecords(true);
      }
    } else if (selectedDateRecords.length > 0 && !hasShownRecords) {
      setHasShownRecords(true);
    }
  }, [selectedDateRecords, monthlyRecords, hasShownRecords]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
        <div className="mt-3 sm:mt-0">
          
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Attendance Filters</h3>
            <p className="mt-1 text-sm text-gray-500">
              Filter attendance records by staff member and month.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">
                  Staff Member
                </label>
                <select
                  id="staff"
                  name="staff"
                  className="mt-1 block w-full px-2 border pr-10 py-2 text-gray-600 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="all">All Staff</option>
                  {staff.map((staffMember: Staff) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    &larr;
                  </button>
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-gray-700 text-sm">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Summary</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-green-800 truncate">Present Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-900">
                  {monthlyStats.presentRate.toFixed(1)}%
                </dd>
                <dd className="mt-1 text-sm text-green-700">
                  {monthlyStats.presentCount} out of {monthlyStats.totalDays} days
                </dd>
              </div>
            </div>
            <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-yellow-800 truncate">Check-ins</dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-900">
                  {monthlyRecords.filter((r: any) => r.timestamp).length}
                </dd>
                <dd className="mt-1 text-sm text-yellow-700">
                  Total check-ins this month
                </dd>
              </div>
            </div>
            <div className="bg-red-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-red-800 truncate">Absent Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-red-900">
                  {monthlyStats.absentRate.toFixed(1)}%
                </dd>
                <dd className="mt-1 text-sm text-red-700">
                  {monthlyStats.absentCount} out of {monthlyStats.totalDays} days
                </dd>
              </div>
            </div>
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-blue-800 truncate">Check-outs</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-900">
                  {monthlyRecords.filter((r: any) => r.check_out_time || r.checkout_timestamp).length}
                </dd>
                <dd className="mt-1 text-sm text-blue-700">
                  Total check-outs this month
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Attendance Records
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {selectedStaffId === 'all' 
                ? 'Showing all staff attendance records' 
                : `Showing attendance records for ${staff.find((s: { id: string; }) => s.id === selectedStaffId)?.name || 'Selected Staff'}`}
            </p>
          </div>
          {(selectedDateRecords.length > 0 || staff.length > 0) ? (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {/* Records per page selector */}
              <div className="flex justify-end mb-4">
                <div className="flex items-center">
                  <label htmlFor="recordsPerPage" className="mr-2 text-sm text-gray-700">
                    Records per page:
                  </label>
                  <select
                    id="recordsPerPage"
                    value={recordsPerPage}
                    onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                    className="block w-20 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Selected Date Records
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        // Define the structure of a paired record
                        interface PairedRecord {
                          id: string;
                          user_id: string;
                          name: string;
                          department: string;
                          checkInTimestamp?: any;
                          checkOutTimestamp?: any;
                        }
                        
                        // Create paired records directly from the selectedDateRecords
                        // Since each record contains both check-in and check-out data
                        const pairedRecords: PairedRecord[] = [];
                        const addedUserIds = new Set<string>();
                        
                        // Process existing records first
                        selectedDateRecords.forEach((record: any) => {
                          // Add to our tracking set to avoid duplicates
                          addedUserIds.add(record.user_id);
                          
                          // Create a paired record for this user
                          pairedRecords.push({
                            id: record.id,
                            user_id: record.user_id,
                            name: record.name,
                            department: record.department,
                            // Use timestamp for check-in and check_out_time for check-out from the same record
                            checkInTimestamp: record.timestamp,
                            checkOutTimestamp: record.check_out_time || record.checkout_timestamp
                          });
                        });
                        
                        // If showing all staff, add entries for staff members without records
                        if (selectedStaffId === 'all') {
                          // Add missing staff members
                          staff.forEach((staffMember: Staff) => {
                            if (!addedUserIds.has(staffMember.id)) {
                              pairedRecords.push({
                                id: `missing-${staffMember.id}`,
                                user_id: staffMember.id,
                                name: staffMember.name,
                                department: staffMember.department || '',
                                checkInTimestamp: null,
                                checkOutTimestamp: null
                              });
                            }
                          });
                        }
                        
                        return pairedRecords;
                      })().map((pairedRecord) => {
                        const staffMember = staff.find((s: { id: any; }) => s.id === pairedRecord.user_id);
                        
                        // Format timestamp safely
                        const formatTimestamp = (timestamp: any) => {
                          if (!timestamp) return 'N/A';
                          try {
                            // Handle Firestore timestamp objects
                            if (timestamp && typeof timestamp.toDate === 'function') {
                              return format(timestamp.toDate(), 'HH:mm:ss');
                            }
                            // Handle string or number timestamps
                            return format(new Date(timestamp), 'HH:mm:ss');
                          } catch (e) {
                            console.error('Error formatting timestamp:', e);
                            return 'Invalid time';
                          }
                        };
                        
                        // Determine status based on check-in/check-out
                        const getStatusStyle = () => {
                          if (pairedRecord.checkInTimestamp && pairedRecord.checkOutTimestamp) {
                            return 'bg-green-100 text-green-800'; // Complete attendance
                          } else if (pairedRecord.checkInTimestamp) {
                            return 'bg-blue-100 text-blue-800'; // Only checked in
                          } else if (pairedRecord.checkOutTimestamp) {
                            return 'bg-orange-100 text-orange-800'; // Only checked out
                          } else {
                            return 'bg-gray-100 text-gray-800'; // No data
                          }
                        };
                        
                        // Format status text for display
                        const getStatusText = () => {
                          if (pairedRecord.checkInTimestamp && pairedRecord.checkOutTimestamp) {
                            return 'Complete';
                          } else if (pairedRecord.checkInTimestamp) {
                            return 'Checked In';
                          } else if (pairedRecord.checkOutTimestamp) {
                            return 'Checked Out';
                          } else {
                            return 'No Data';
                          }
                        };
                        
                        return (
                          <tr key={pairedRecord.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                  {staffMember?.name ? staffMember.name.charAt(0) : '?'}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {staffMember?.name || 'Unknown Staff'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {staffMember?.position || staffMember?.department || 'No position'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle()}`}>
                                {getStatusText()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimestamp(pairedRecord.checkInTimestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatTimestamp(pairedRecord.checkOutTimestamp)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
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
                          {Math.min(currentPage * recordsPerPage, selectedDateRecords.length)}
                        </span>{' '}
                        of <span className="font-medium">{selectedDateRecords.length}</span> records
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
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No attendance records found for the selected criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
