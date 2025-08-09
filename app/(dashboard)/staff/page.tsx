"use client";

import React, { useState } from 'react';
import { useStaffManagement } from '../../../hooks/useStaffManagement';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function StaffManagementPage() {
  const {
    filteredStaff,
    searchTerm,
    setSearchTerm,
    isAddModalOpen,
    setIsAddModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    staffToDelete,
    newStaff,
    handleInputChange,
    handleSubmit,
    handleDelete,
    openDeleteModal,
    toggleStaffStatus
  } = useStaffManagement();
  
  // State for managing status toggle confirmation and loading states
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [showStatusInfo, setShowStatusInfo] = useState(false);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        <div className="mt-4 sm:mt-0">
          {/* <span className="text-sm text-gray-500">View-only mode</span> */}
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-blue-500 p-2 border text-gray-600 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search staff by name, email, position, or department"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Position
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStaff.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.position}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.department}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'active' || member.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : member.status === 'checked_in'
                                ? 'bg-blue-100 text-blue-800'
                                : member.status === 'checked_out'
                                ? 'bg-yellow-100 text-yellow-800'
                                : member.status === 'late'
                                ? 'bg-orange-100 text-orange-800'
                                : member.status === 'half-day'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-red-100 text-red-800'
                            } transition-all duration-300`}
                          >
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1).replace('_', ' ')}
                          </span>
                          
                          {/* Status info tooltip button */}
                          <button 
                            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={() => setShowStatusInfo(!showStatusInfo)}
                            title="What do these statuses mean?"
                          >
                            <InformationCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {/* View-only mode - no actions */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal removed - view only mode */}

      {/* Delete Confirmation Modal removed - view only mode */}
          {/* Status Info Modal */}
      {showStatusInfo && (
        <div className="fixed -top-1/4 z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowStatusInfo(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowStatusInfo(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Staff Status Information</h3>
                  <div className="mt-4 text-left">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active/Present
                        </span>
                        <p className="ml-2 text-sm text-gray-500">Staff members who are currently active or present.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Checked in
                        </span>
                        <p className="ml-2 text-sm text-gray-500">Staff members who have checked in for the day.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Checked out
                        </span>
                        <p className="ml-2 text-sm text-gray-500">Staff members who have checked out for the day.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          Late
                        </span>
                        <p className="ml-2 text-sm text-gray-500">Staff members who arrived late.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Half-day
                        </span>
                        <p className="ml-2 text-sm text-gray-500">Staff members who are present for half a day.</p>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive/Absent
                        </span>
                        <p className="ml-2 text-sm text-gray-500">Staff members who are inactive or absent.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={() => setShowStatusInfo(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
