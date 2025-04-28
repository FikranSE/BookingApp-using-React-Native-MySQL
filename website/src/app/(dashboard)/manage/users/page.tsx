"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Plus, Edit, Trash2, X, Save, 
  AlertCircle, Users, Eye, Mail, Phone
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "User ID",
    accessor: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Name",
    accessor: "name",
    className: "hidden md:table-cell",
  },
  {
    header: "Email",
    accessor: "email",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const UserManagePage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  
  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: null, message: null });
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create a custom axios instance to avoid conflicts 
  const createApiClient = () => {
    // Get token from localStorage
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      console.log("No admin token found, redirecting to login");
      router.push("/sign-in");
      setAuthStatus("No token found");
      return null;
    }
    
    setAuthStatus(`Token found (${token.substring(0, 10)}...)`);
    
    // Create axios instance with auth header
    const apiClient = axios.create({
      baseURL: "https://j9d3hc82-3001.asse.devtunnels.ms/api",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return apiClient;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Direct API call for testing
      console.log("Fetching users directly...");
      
      // Get token from localStorage
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        console.log("No admin token found, redirecting to login");
        router.push("/sign-in");
        setAuthStatus("No token found");
        return;
      }
      
      setAuthStatus(`Token found (${token.substring(0, 10)}...)`);
      
      const response = await axios.get("https://j9d3hc82-3001.asse.devtunnels.ms/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("API Response:", response);
      
      // Check if data is in the expected format
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log("Users fetched successfully:", response.data.data);
        setUsers(response.data.data);
        setAuthStatus("Authenticated and data loaded");
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Received an unexpected response format from the server.");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      
      // Check for unauthorized error
      if (error.response?.status === 401) {
        setAuthStatus("Authentication failed (401) - token may be invalid");
        localStorage.removeItem("adminToken");
        router.push("/sign-in");
        return;
      }
      
      setError(
        error.response?.data?.message || 
        "Unable to load users. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating a new user
  const handleAddUser = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    setFormErrors({});
    setIsEditMode(false);
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing user
  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setFormErrors({});
    setIsEditMode(true);
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Confirm dialog for deleting a user
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  // Delete a user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/users/${userToDelete}`);
      setUsers(users.filter(user => user.id !== userToDelete));
      setStatusMessage({
        type: 'success',
        message: 'User deleted successfully'
      });
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: null });
      }, 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setStatusMessage({
        type: 'error',
        message: 'Failed to delete user. Please try again.'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user makes a change
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^[0-9]+$/.test(formData.phone)) {
      errors.phone = 'Phone must contain only numbers';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create/update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    const apiClient = createApiClient();
    if (!apiClient) return;

    try {
      let response;
      if (isEditMode && currentUser) {
        // Update existing user
        response = await apiClient.put(`/users/${currentUser.id}`, formData);
        
        // Update the users list with the updated user
        setUsers(users.map(user => 
          user.id === currentUser.id ? response.data.data : user
        ));
        
        setStatusMessage({
          type: 'success',
          message: 'User updated successfully'
        });
      } else {
        // Create new user
        response = await apiClient.post('/users', formData);
        
        // Add the new user to the users list
        setUsers([...users, response.data.data]);
        
        setStatusMessage({
          type: 'success',
          message: 'User created successfully'
        });
      }
      
      // Close the modal and reset form
      setIsModalOpen(false);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: null });
      }, 3000);
    } catch (err) {
      console.error("Error saving user:", err);
      
      // Extract error message from response
      let errorMessage = 'Failed to save user. Please try again.';
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      setStatusMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInitials = (name: string) => {
    if (!name) return "UN";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderRow = (item: User) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
          {getInitials(item.name)}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">
            <Mail size={12} className="inline mr-1" />
            {item.email}
          </p>
          <p className="text-xs text-gray-500">
            <Phone size={12} className="inline mr-1" />
            {item.phone || 'Not provided'}
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.id}</td>
      <td className="hidden md:table-cell">{item.name}</td>
      <td className="hidden md:table-cell">{item.email}</td>
      <td className="hidden lg:table-cell">{item.phone || '-'}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/manage/users/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center text-white rounded-full bg-lamaSky hover:bg-sky-500">
              <Eye size={14} />
            </button>
          </Link>
          <button
            onClick={() => handleEditUser(item)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-300 text-white hover:bg-orange-500"
            title="Edit User"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-300 text-white hover:bg-red-500"
            title="Delete User"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Auth status (for debugging - remove in production) */}
      <div className="bg-gray-50 p-2 mb-4 rounded text-xs text-gray-600 border flex justify-between">
        <div>
          <span>Auth status: {authStatus}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminInfo");
              router.push("/sign-in");
            }}
            className="text-red-500 hover:underline text-xs"
          >
            Sign out
          </button>
          <button
            onClick={() => fetchUsers()}
            className="text-blue-500 hover:underline text-xs"
          >
            Reload users
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMessage.message && (
        <div className={`mb-4 p-3 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {statusMessage.type === 'success' ? (
              <div className="mr-2 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <AlertCircle size={18} className="mr-2 flex-shrink-0 text-red-500" />
            )}
            <p>{statusMessage.message}</p>
          </div>
        </div>
      )}

      {/* TOP */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="hidden md:block text-lg font-semibold">Manage Users</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <button 
              onClick={handleAddUser}
              className="h-9 px-4 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <Plus size={18} className="mr-1" />
              <span className="font-medium">Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchUsers()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Users size={32} className="text-gray-300" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2">No Users Found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first user.</p>
          <button 
            onClick={handleAddUser}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <Plus size={18} className="mr-2" />
            Add New User
          </button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && users.length > 0 && (
        <>
          <Table columns={columns} renderRow={renderRow} data={users} />
          <Pagination />
        </>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-bold">
                    {isEditMode ? 'Edit User' : 'Add New User'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                {/* Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Phone number should contain only digits.
                  </p>
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {isEditMode ? 'Update User' : 'Create User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5 text-white">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                  <Trash2 size={20} />
                </div>
                <h2 className="text-xl font-bold">Confirm Deletion</h2>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed.
              </p>
              
              {/* Get user details for the user to be deleted */}
              {userToDelete && 
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-semibold">
                      {getInitials(users.find(user => user.id === userToDelete)?.name || 'Unknown User')}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        {users.find(user => user.id === userToDelete)?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {users.find(user => user.id === userToDelete)?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                </div>
              }
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagePage;