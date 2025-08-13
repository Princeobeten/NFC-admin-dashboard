"use client"

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface WorkHours {
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
}

export interface Thresholds {
  late_minutes: number;
  minimum_hours: number;
}

export interface AttendanceRules {
  thresholds: Thresholds;
  weekend_days: number[];
  work_hours: WorkHours;
}

export const useSettings = () => {
  const [attendanceRules, setAttendanceRules] = useState<AttendanceRules | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settingsDocRef = doc(db, 'settings', 'attendance_rules');
        const settingsDoc = await getDoc(settingsDocRef);
        
        if (settingsDoc.exists()) {
          setAttendanceRules(settingsDoc.data() as AttendanceRules);
        } else {
          setError('Settings document does not exist');
        }
      } catch (err) {
        setError('Failed to fetch settings');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Format work hours for display (e.g., "9:00 AM - 5:00 PM")
  const formatWorkHours = (): string => {
    if (!attendanceRules?.work_hours) return 'Not set';
    
    const { start_hour, start_minute, end_hour, end_minute } = attendanceRules.work_hours;
    
    const formatTime = (hour: number, minute: number): string => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };
    
    return `${formatTime(start_hour, start_minute)} - ${formatTime(end_hour, end_minute)}`;
  };

  // Format weekend days for display (e.g., "Friday, Saturday")
  const formatWeekendDays = (): string => {
    if (!attendanceRules?.weekend_days || attendanceRules.weekend_days.length === 0) {
      return 'None';
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return attendanceRules.weekend_days.map(day => dayNames[day]).join(', ');
  };

  // Update attendance rules in Firestore
  const updateAttendanceRules = async (updatedRules: AttendanceRules) => {
    try {
      setUpdating(true);
      setUpdateSuccess(null);
      
      const settingsDocRef = doc(db, 'settings', 'attendance_rules');
      
      // Convert AttendanceRules to a plain object that Firestore can accept
      const updateData = {
        'thresholds.late_minutes': updatedRules.thresholds.late_minutes,
        'thresholds.minimum_hours': updatedRules.thresholds.minimum_hours,
        'weekend_days': updatedRules.weekend_days,
        'work_hours.start_hour': updatedRules.work_hours.start_hour,
        'work_hours.start_minute': updatedRules.work_hours.start_minute,
        'work_hours.end_hour': updatedRules.work_hours.end_hour,
        'work_hours.end_minute': updatedRules.work_hours.end_minute
      };
      
      await updateDoc(settingsDocRef, updateData);
      
      // Update local state
      setAttendanceRules(updatedRules);
      setUpdateSuccess(true);
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      setUpdateSuccess(false);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Update specific field in attendance rules
  const updateField = async (field: string, value: any) => {
    if (!attendanceRules) return false;
    
    // Create a deep copy of the current rules
    const updatedRules = JSON.parse(JSON.stringify(attendanceRules));
    
    // Handle nested fields using dot notation (e.g., 'work_hours.start_hour')
    const fieldParts = field.split('.');
    
    if (fieldParts.length === 1) {
      // Top-level field
      updatedRules[field] = value;
    } else if (fieldParts.length === 2) {
      // Nested field (e.g., work_hours.start_hour)
      const [parent, child] = fieldParts;
      if (!updatedRules[parent]) updatedRules[parent] = {};
      updatedRules[parent][child] = value;
    }
    
    // For direct Firestore update (without using updateAttendanceRules)
    try {
      setUpdating(true);
      setUpdateSuccess(null);
      
      const settingsDocRef = doc(db, 'settings', 'attendance_rules');
      
      // Create an update object with just the field being updated
      const updateData: Record<string, any> = {};
      updateData[field] = value;
      
      await updateDoc(settingsDocRef, updateData);
      
      // Update local state
      setAttendanceRules(updatedRules);
      setUpdateSuccess(true);
      return true;
    } catch (err) {
      console.error('Error updating settings field:', err);
      setError(`Failed to update ${field}`);
      setUpdateSuccess(false);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    attendanceRules,
    loading,
    error,
    updating,
    updateSuccess,
    formatWorkHours,
    formatWeekendDays,
    updateAttendanceRules,
    updateField
  };
};
