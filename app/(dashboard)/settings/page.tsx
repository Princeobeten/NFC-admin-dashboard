"use client";

import React, { useState } from 'react';
import { useSettings } from '../../../hooks/useSettings';
import { CogIcon, ClockIcon, CalendarIcon, ExclamationCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { 
    attendanceRules, 
    loading, 
    error, 
    updating,
    updateSuccess,
    formatWorkHours, 
    formatWeekendDays,
    updateField 
  } = useSettings();
  
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  
  // Handle edit field click
  const handleEditClick = (field: string, currentValue: any) => {
    setEditMode(field);
    setEditValue(currentValue);
  };
  
  // Handle save changes
  const handleSave = async (field: string) => {
    if (editValue === null) {
      setEditMode(null);
      return;
    }
    
    const success = await updateField(field, editValue);
    if (success) {
      setEditMode(null);
    }
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setEditMode(null);
    setEditValue(null);
  };
  
  // Render editable field
  const renderEditableField = (field: string, currentValue: any, label: string, type: 'number' | 'text' | 'time' | 'select' = 'text', options?: any[]) => {
    const isEditing = editMode === field;
    
    // Determine the input type based on the field
    const renderInput = () => {
      switch (type) {
        case 'number':
          return (
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value, 10))}
              min={0}
            />
          );
        case 'time':
          // For time fields (hours and minutes)
          if (field.includes('hour')) {
            return (
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value, 10))}
                min={0}
                max={23}
              />
            );
          } else {
            return (
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value, 10))}
                min={0}
                max={59}
                step={5}
              />
            );
          }
        case 'select':
          return (
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={JSON.stringify(editValue)}
              onChange={(e) => setEditValue(JSON.parse(e.target.value))}
              multiple={field === 'weekend_days'}
              size={field === 'weekend_days' ? 7 : 1}
            >
              {options?.map((option, index) => (
                <option key={index} value={JSON.stringify(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        default:
          return (
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          );
      }
    };
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          {isEditing ? (
            <div className="flex flex-col space-y-2">
              {renderInput()}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSave(field)}
                  disabled={updating}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <span>{currentValue}</span>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => handleEditClick(field, currentValue)}
            className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !attendanceRules) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Failed to load settings data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      {/* Update Status Message */}
      {updateSuccess !== null && (
        <div className={`mt-4 p-4 rounded-md ${updateSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {updateSuccess ? (
                <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${updateSuccess ? 'text-green-800' : 'text-red-800'}`}>
                {updateSuccess ? 'Settings updated successfully' : 'Failed to update settings'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-blue-500" />
              Attendance Rules
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              System settings for attendance tracking and calculations
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  Work Start Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Hour</label>
                      {renderEditableField('work_hours.start_hour', attendanceRules.work_hours.start_hour, 'Start Hour', 'time')}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Minute</label>
                      {renderEditableField('work_hours.start_minute', attendanceRules.work_hours.start_minute, 'Start Minute', 'time')}
                    </div>
                  </div>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  Work End Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500">Hour</label>
                      {renderEditableField('work_hours.end_hour', attendanceRules.work_hours.end_hour, 'End Hour', 'time')}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Minute</label>
                      {renderEditableField('work_hours.end_minute', attendanceRules.work_hours.end_minute, 'End Minute', 'time')}
                    </div>
                  </div>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Late Threshold</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {renderEditableField('thresholds.late_minutes', attendanceRules.thresholds.late_minutes, 'Late Minutes', 'number')} minutes
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Minimum Work Hours</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {renderEditableField('thresholds.minimum_hours', attendanceRules.thresholds.minimum_hours, 'Minimum Hours', 'number')} hours
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                  Weekend Days
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode === 'weekend_days' ? (
                    <div>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">Select weekend days:</label>
                        <select
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={editValue ? editValue.map(String) : []}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            setEditValue(selectedOptions);
                          }}
                          multiple
                          size={7}
                        >
                          <option value="0">Sunday</option>
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave('weekend_days')}
                          disabled={updating}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{formatWeekendDays()}</span>
                      <button
                        onClick={() => handleEditClick('weekend_days', attendanceRules.weekend_days)}
                        className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PencilIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Additional settings sections can be added here */}
    </div>
  );
}
