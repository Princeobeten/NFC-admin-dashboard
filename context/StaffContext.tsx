"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/hooks/firebase';

// Define types for our context based on actual Firebase structure
export type Staff = {
  id: string;
  name: string;
  department: string;
  nfc_uid: string;
  status: string; // Changed to string to handle all possible status values
  timestamp?: any; // Firestore timestamp
  email?: string;
  position?: string;
  phone?: string;
};

export type AttendanceRecord = {
  id: string;
  user_id: string; // References registration document ID
  name: string;
  department: string;
  date: string;
  action: string; // 'check_in' | 'check_out' or other status values
  nfc_uid: string;
  timestamp: any; // Firestore timestamp for check-in
  device_id: string; // Device ID for check-in
  checkout_timestamp?: any; // Firestore timestamp for check-out
  checkout_device_id?: string; // Device ID for check-out
  // Optional fields for UI display
  staffId?: string;
  status?: string;
  checkIn?: React.JSX.Element;
  checkOut?: React.JSX.Element;
};

export type AttendanceDay = {
  id: string; // The date string used as document ID
  date: string;
  count: number;
  records?: AttendanceRecord[];
};

type StaffContextType = {
  staff: Staff[]; // From registration collection
  attendanceDays: AttendanceDay[];
  attendanceRecords: AttendanceRecord[];
  addStaff: (staff: Omit<Staff, 'id' | 'timestamp'>) => Promise<string>;
  removeStaff: (id: string) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;
  markAttendance: (userId: string, action: 'check_in' | 'check_out', deviceId?: string) => Promise<void>;
  getStaffAttendance: (userId: string, startDate?: string, endDate?: string) => AttendanceRecord[];
  getAllAttendance: (startDate?: string, endDate?: string) => AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
};

// Create the context with default values
const StaffContext = createContext<StaffContextType>({
  staff: [],
  attendanceDays: [],
  attendanceRecords: [],
  addStaff: async () => '',
  removeStaff: async () => {},
  toggleStaffStatus: async () => {},
  markAttendance: async () => {},
  getStaffAttendance: () => [],
  getAllAttendance: () => [],
  isLoading: false,
  error: null
});





// Staff provider component
export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch staff and attendance data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch staff data from registration collection
        await fetchStaff();
        
        // Fetch attendance data
        await fetchAttendanceDays();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch staff from registration collection
  const fetchStaff = async () => {
    try {
      const registrationSnapshot = await getDocs(collection(db, 'registration'));
      const staffData: Staff[] = [];
      
      registrationSnapshot.forEach((doc) => {
        const data = doc.data();
        staffData.push({
          id: doc.id,
          name: data.name,
          department: data.department || '',
          nfc_uid: data.nfc_uid || '',
          status: data.status || 'present',
          timestamp: data.timestamp,
          // Optional fields
          email: data.email || '',
          position: data.position || '',
          phone: data.phone || ''
        });
      });
      
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff from registration:', error);
      throw error;
    }
  };
  
  // Fetch attendance days from Firestore
  const fetchAttendanceDays = async () => {
    try {
      const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
      const days: AttendanceDay[] = [];
      const allRecords: AttendanceRecord[] = [];
      
      // First get all attendance day documents
      attendanceSnapshot.forEach((doc) => {
        const data = doc.data();
        days.push({
          id: doc.id,
          date: data.date,
          count: data.count || 0
        });
      });
      
      // Then fetch records for each day
      for (const day of days) {
        const recordsSnapshot = await getDocs(collection(db, 'attendance', day.id, 'records'));
        const dayRecords: AttendanceRecord[] = [];
        
        recordsSnapshot.forEach((doc) => {
          const data = doc.data();
          const record: AttendanceRecord = {
            id: doc.id,
            user_id: data.user_id,
            name: data.name,
            department: data.department,
            date: data.date,
            action: data.action,
            nfc_uid: data.nfc_uid || '',
            timestamp: data.timestamp,
            device_id: data.device_id || 'unknown'
          };
          
          dayRecords.push(record);
          allRecords.push(record);
        });
        
        // Update day with its records
        day.records = dayRecords;
      }

      
      setAttendanceDays(days);
      setAttendanceRecords(allRecords);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  };
  


  // Add new staff member to registration collection
  const addStaff = async (newStaff: Omit<Staff, 'id' | 'timestamp'>) => {
    try {
      const docRef = await addDoc(collection(db, 'registration'), {
        ...newStaff,
        timestamp: serverTimestamp()
      });
      
      const newStaffWithId: Staff = {
        ...newStaff,
        id: docRef.id,
        timestamp: serverTimestamp()
      };
      
      setStaff([...staff, newStaffWithId]);
      return docRef.id;
    } catch (error) {
      console.error('Error adding staff to registration:', error);
      setError('Failed to add staff member');
      throw error;
    }
  };

  // Remove staff member from registration
  const removeStaff = async (id: string) => {
    try {
      // Delete registration document
      await deleteDoc(doc(db, 'registration', id));
      
      // Update local state
      setStaff(staff.filter(member => member.id !== id));
      
      // We don't delete attendance records as they are historical data
    } catch (error) {
      console.error('Error removing staff:', error);
      setError('Failed to remove staff member');
      throw error;
    }
  };

  // Toggle staff status (present/absent)
  const toggleStaffStatus = async (id: string) => {
    try {
      // Find the staff member
      const staffMember = staff.find(member => member.id === id);
      if (!staffMember) throw new Error('Staff member not found');
      
      // Determine new status - toggle between present and absent
      const newStatus = staffMember.status === 'present' ? 'absent' : 'present';
      
      // Update in Firestore
      const staffRef = doc(db, 'registration', id);
      await updateDoc(staffRef, { 
        status: newStatus,
        timestamp: serverTimestamp()
      });
      
      // Update local state
      setStaff(staff.map(member => {
        if (member.id === id) {
          return { ...member, status: newStatus };
        }
        return member;
      }));
    } catch (error) {
      console.error('Error toggling staff status:', error);
      setError('Failed to update staff status');
      throw error;
    }
  };

  // Mark attendance for a staff member (check in or check out)
  const markAttendance = async (userId: string, action: 'check_in' | 'check_out', deviceId: string = 'web-portal') => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Find the staff member
      const staffMember = staff.find(member => member.id === userId);
      if (!staffMember) throw new Error('Staff member not found');
      
      // Check if attendance document for today exists
      const attendanceRef = doc(db, 'attendance', today);
      const attendanceDoc = await getDoc(attendanceRef);
      
      // If attendance document doesn't exist for today, create it
      if (!attendanceDoc.exists()) {
        await setDoc(attendanceRef, {
          date: today,
          count: 1,
          createdAt: serverTimestamp()
        });
      } else {
        // Increment count
        await updateDoc(attendanceRef, {
          count: attendanceDoc.data().count + 1
        });
      }
      
      // Add record to the records subcollection
      const recordData = {
        user_id: userId,
        name: staffMember.name,
        department: staffMember.department,
        date: today,
        action: action,
        nfc_uid: staffMember.nfc_uid,
        timestamp: serverTimestamp(),
        device_id: deviceId
      };
      
      const recordRef = await addDoc(collection(db, 'attendance', today, 'records'), recordData);
      
      // Update local state
      const newRecord: AttendanceRecord = {
        id: recordRef.id,
        ...recordData
      };
      
      setAttendanceRecords([...attendanceRecords, newRecord]);
      
      // Update the attendance days
      const updatedDays = [...attendanceDays];
      const dayIndex = updatedDays.findIndex(day => day.id === today);
      
      if (dayIndex >= 0) {
        // Update existing day
        updatedDays[dayIndex].count = (updatedDays[dayIndex].count || 0) + 1;
        updatedDays[dayIndex].records = [...(updatedDays[dayIndex].records || []), newRecord];
      } else {
        // Add new day
        updatedDays.push({
          id: today,
          date: today,
          count: 1,
          records: [newRecord]
        });
      }
      
      setAttendanceDays(updatedDays);
      
      // Don't return the ID to match the Promise<void> return type
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
      throw error;
    }
  };

  // Get attendance records for a specific staff member
  const getStaffAttendance = (
    userId: string, 
    startDate?: string, 
    endDate?: string
  ): AttendanceRecord[] => {
    return attendanceRecords.filter(record => {
      const isStaffMatch = record.user_id === userId;
      const isDateInRange = (!startDate || record.date >= startDate) && 
                           (!endDate || record.date <= endDate);
      return isStaffMatch && isDateInRange;
    });
  };

  // Get all attendance records within a date range
  const getAllAttendance = (startDate?: string, endDate?: string): AttendanceRecord[] => {
    return attendanceRecords.filter(record => {
      return (!startDate || record.date >= startDate) && 
             (!endDate || record.date <= endDate);
    });
  };

  return (
    <StaffContext.Provider value={{
      staff,
      attendanceDays,
      attendanceRecords,
      addStaff,
      removeStaff,
      toggleStaffStatus,
      markAttendance,
      getStaffAttendance,
      getAllAttendance,
      isLoading,
      error
    }}>
      {children}
    </StaffContext.Provider>
  );
};

// Custom hook to use the staff context
export const useStaff = () => useContext(StaffContext);
