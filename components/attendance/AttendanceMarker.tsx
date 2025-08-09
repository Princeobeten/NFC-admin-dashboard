"use client";

import React, { useState, useEffect } from 'react';
import { useStaff } from '../../context/StaffContext';
import { format } from 'date-fns';

export default function AttendanceMarker() {
  const { staff, markAttendance, attendanceRecords, isLoading } = useStaff();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [action, setAction] = useState<'check_in' | 'check_out'>('check_in');
  const [deviceId, setDeviceId] = useState<string>('web-portal');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Current time for display
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), 'HH:mm:ss'));
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get today's records
  const todayRecords = attendanceRecords.filter(record => {
    return record.date === format(new Date(), 'yyyy-MM-dd');
  });
  
  // Filter only present staff
  const presentStaff = staff.filter(member => member.status === 'present');

  // Get check-ins for a staff member today
  const getStaffCheckInsToday = (userId: string) => {
    return todayRecords.filter(record => {
      return record.user_id === userId && record.action === 'check_in';
    });
  };
  
  // Get check-outs for a staff member today
  const getStaffCheckOutsToday = (userId: string) => {
    return todayRecords.filter(record => {
      return record.user_id === userId && record.action === 'check_out';
    });
  };
  
  // Check if staff member has checked in today
  const hasCheckedInToday = (userId: string) => {
    return getStaffCheckInsToday(userId).length > 0;
  };
  
  // Check if staff member has checked out today
  const hasCheckedOutToday = (userId: string) => {
    return getStaffCheckOutsToday(userId).length > 0;
  };
  
  // Handle staff selection
  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStaffId(e.target.value);
    setErrorMessage('');
  };
  
  // Handle action selection (check-in or check-out)
  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAction(e.target.value as 'check_in' | 'check_out');
    setErrorMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaffId) {
      setErrorMessage('Please select a staff member');
      return;
    }
    
    // Validate based on action
    if (action === 'check_in' && hasCheckedInToday(selectedStaffId)) {
      setErrorMessage('This staff member has already checked in today');
      return;
    }
    
    if (action === 'check_out' && !hasCheckedInToday(selectedStaffId)) {
      setErrorMessage('This staff member has not checked in today');
      return;
    }
    
    if (action === 'check_out' && hasCheckedOutToday(selectedStaffId)) {
      setErrorMessage('This staff member has already checked out today');
      return;
    }
    
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Mark attendance with the selected action (check-in or check-out)
      await markAttendance(selectedStaffId, action, deviceId);
      
      setSuccessMessage(`${action === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setErrorMessage('Failed to record attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Mark Attendance</h3>
          <p className="mt-1 text-sm text-gray-500">
            Record check-ins and check-outs for staff members.
          </p>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              Current Date: {format(new Date(), 'MMMM d, yyyy')}
            </p>
            <p className="text-sm font-medium text-gray-700">
              Current Time: {currentTime}
            </p>
          </div>
          
          {successMessage && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">
                  Staff Member
                </label>
                <select
                  id="staff"
                  name="staff"
                  value={selectedStaffId}
                  onChange={handleStaffChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={submitting || isLoading}
                >
                  <option value="">Select a staff member</option>
                  {presentStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.department || 'No Department'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                  Action
                </label>
                <select
                  id="action"
                  name="action"
                  value={action}
                  onChange={handleActionChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={submitting}
                >
                  <option value="check_in">Check In</option>
                  <option value="check_out">Check Out</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
                  Device ID
                </label>
                <input
                  type="text"
                  id="deviceId"
                  name="deviceId"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={submitting}
                />
              </div>
            </div>
            
            {selectedStaffId && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Today's Attendance:</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p>
                    <span className="font-medium">Check-ins:</span> {getStaffCheckInsToday(selectedStaffId).length}
                    {getStaffCheckInsToday(selectedStaffId).map((record, idx) => (
                      <span key={record.id} className="ml-2 text-sm text-gray-500">
                        {format(new Date(record.timestamp), 'HH:mm:ss')}{idx < getStaffCheckInsToday(selectedStaffId).length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </p>
                  <p>
                    <span className="font-medium">Check-outs:</span> {getStaffCheckOutsToday(selectedStaffId).length}
                    {getStaffCheckOutsToday(selectedStaffId).map((record, idx) => (
                      <span key={record.id} className="ml-2 text-sm text-gray-500">
                        {format(new Date(record.timestamp), 'HH:mm:ss')}{idx < getStaffCheckOutsToday(selectedStaffId).length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={submitting || !selectedStaffId || isLoading}
              >
                {submitting ? 'Processing...' : 'Mark Attendance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
