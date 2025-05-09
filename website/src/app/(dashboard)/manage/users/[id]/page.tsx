"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  Edit, Trash2, ArrowLeft, Save,
  AlertCircle, User, Mail, Phone, Camera
} from "lucide-react";

// Add the formatDate function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";
  
  // Format as "Month DD, YYYY at HH:MM AM/PM"
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const SingleUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    image: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({ type: null, message: null });
  const [isSaving, setIsSaving] = useState(false);

  // Create a custom axios instance
  const createApiClient = () => {
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      console.log("No admin token found, redirecting to login");
      router.push("/sign-in");
      return null;
    }
    
    return axios.create({
      baseURL: "https://j9d3hc82-3001.asse.devtunnels.ms/api",
      headers: { Authorization: `Bearer ${token}` },
      timeout: 45000 // Increased timeout to 45 seconds for image uploads
    });
  };

  // Fetch user data
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      const response = await apiClient.get(`/users/${userId}`);
      console.log("API Response:", response.data); // Debug the API response
      
      // Extract the user data from the nested response structure
      const userData = response.data.data;
      
      // Set the user state with the actual data
      setUser(userData);
      
      // Set the edit data using the correct properties
      setEditData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        image: userData.image || ""
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Unable to load user information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setEditData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        image: user.image || ""
      });
      setSelectedFile(null);
      setPreviewImage(null);
    }
    setIsEditing(!isEditing);
    setUpdateStatus({ type: null, message: null });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`Selected file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, type: ${file.type}`);
      
      // Check for file size exceeding limit
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setUpdateStatus({
          type: 'error',
          message: `Image is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`
        });
        return;
      }

      // Set the selected file and its preview
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      
      if (updateStatus.type === 'error') {
        setUpdateStatus({ type: null, message: null });
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
  
    // Handle local filesystem paths
    if (typeof imageUrl === 'string' && imageUrl.startsWith('E:')) {
      return `/api/image-proxy?path=${encodeURIComponent(imageUrl)}`;
    }
  
    // Fix double slash issue in URLs
    if (typeof imageUrl === 'string' && imageUrl.includes('//uploads')) {
      return imageUrl.replace('//uploads', '/uploads');
    }
  
    return imageUrl;
  };

// Handle submit function with error handling
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);
  setUpdateStatus({ type: null, message: null });
  
  const apiClient = createApiClient();
  if (!apiClient) return;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(editData.email.trim())) {
    setUpdateStatus({
      type: 'error',
      message: 'Please enter a valid email address'
    });
    setIsSaving(false);
    return;
  }

  // Prepare form data for submission
  const formData = new FormData();
  
  // Add user data to form
  formData.append('name', editData.name.trim());
  formData.append('email', editData.email.trim());
  formData.append('phone', editData.phone.trim());

  // If there's an image, append it to FormData with proper validation
  if (selectedFile) {
    // Double-check file size again before submission
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setUpdateStatus({
        type: 'error',
        message: `Image is too large (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`
      });
      setIsSaving(false);
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUpdateStatus({
        type: 'error',
        message: `Unsupported file type: ${selectedFile.type}. Please use JPEG or PNG images.`
      });
      setIsSaving(false);
      return;
    }
    
    formData.append('image', selectedFile);
  }

  // For debugging
  console.log("Submitting user update...");
  console.log("User ID:", userId);
  
  try {
    // Log request details before sending
    console.log("API URL:", `${apiClient.defaults.baseURL}/users/${userId}`);
    
    const response = await apiClient.put(`/users/${userId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Update successful:", response.data);
    // Update the user state with the updated data
    if (response.data && response.data.data) {
      setUser(response.data.data);
    } else {
      setUser(response.data);
    }
    setUpdateStatus({
      type: 'success',
      message: 'User updated successfully',
    });
    setIsEditing(false);
    setPreviewImage(null);
    setSelectedFile(null);
  } catch (err) {
    console.error("Error updating user:", err);
    
    // Extract more detailed error message
    let errorMessage = 'Failed to update user. Please try again.';
    
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server response error data:", err.response.data);
      console.error("Server response status:", err.response.status);
      
      if (err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      // Handle specific status codes
      if (err.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response.status === 403) {
        errorMessage = 'You do not have permission to update this user.';
      } else if (err.response.status === 422) {
        errorMessage = 'Validation failed. Please check the form fields.';
      }
    } else if (err.request) {
      // The request was made but no response was received
      console.error("No response received:", err.request);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", err.message);
    }
    
    setUpdateStatus({
      type: 'error',
      message: errorMessage
    });
  } finally {
    setIsSaving(false);
  }
};

  // Handle user deletion
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/users/${userId}`);
      router.push("/manage/users");
    } catch (err) {
      console.error("Error deleting user:", err);
      setUpdateStatus({
        type: 'error',
        message: 'Failed to delete user. Please try again.'
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="mt-4 text-blue-500 font-medium text-center">Loading</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 p-8">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load User</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center mx-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user found
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">User Not Found</h3>
            <p className="text-gray-600 mb-6">The requested user could not be found or may have been deleted.</p>
            <button 
              onClick={() => router.push("/manage/users")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center mx-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Status message */}
        {updateStatus.message && (
          <div className={`mb-6 p-4 rounded-xl ${
            updateStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            updateStatus.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center">
              {updateStatus.type === 'success' ? (
                <div className="mr-2 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
              ) : updateStatus.type === 'info' ? (
                <div className="mr-2 flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
              ) : (
                <AlertCircle size={20} className="mr-2 flex-shrink-0 text-red-500" />
              )}
              <p>{updateStatus.message}</p>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-sky-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold text-sky-800 flex items-center">
              <User size={20} className="mr-2 text-sky-500" />
              User Details
            </h1>
            <div className="flex items-center gap-4">
              <Link href="/manage/users">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Users
                </button>
              </Link>
              {!isEditing ? (
                <button
                  onClick={toggleEditMode}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit User
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left column - Main info */}
            <div className="md:col-span-7 lg:col-span-8">
              {/* User info card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-sky-100 mb-6">
                <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 text-white">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          className="bg-white/10 backdrop-blur-sm text-2xl font-bold p-1 rounded w-full text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Full Name"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                      )}
                      <div className="mt-1 text-sky-50 flex items-center text-sm">
                        <span>ID: {user.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Profile Image */}
                  <div className="aspect-square w-60 mx-auto bg-gray-100 rounded-full overflow-hidden relative mb-6 group">
                    {/* Hidden file input */}
                    <input 
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          alt={user.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : user.image ? (
                      <div className="relative w-full h-full">
                        <img
                          src={fixImageUrl(user.image)}
                          alt={user.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-user.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User size={64} className="text-gray-300" />
                      </div>
                    )}
                    
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={triggerFileInput}
                          className="bg-white/90 backdrop-blur-sm rounded-xl p-3 flex items-center"
                        >
                          <Camera size={20} className="mr-2 text-sky-500" />
                          <span>Choose Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Email info */}
                  <div className="flex items-start mb-6 p-4 bg-sky-50 rounded-2xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                      <Mail size={20} className="text-sky-500" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="uppercase text-xs font-semibold text-sky-500 tracking-wider">Email</h3>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          className="mt-1 p-2 border border-sky-200 rounded w-full bg-white"
                          placeholder="Email Address"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-800">
                          {user.email || "Not available"}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Phone info */}
                  <div className="flex items-start mb-6 p-4 bg-sky-50 rounded-2xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                      <Phone size={20} className="text-sky-500" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="uppercase text-xs font-semibold text-sky-500 tracking-wider">Phone</h3>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          className="mt-1 p-2 border border-sky-200 rounded w-full bg-white"
                          placeholder="Phone Number"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-800">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Summary and metadata */}
            <div className="md:col-span-5 lg:col-span-4">
              {/* User summary card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-sky-100 mb-6">
                <div className="p-6 border-b border-sky-100">
                  <h3 className="font-bold text-sky-800">User Details</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">User ID</span>
                      <span className="font-medium text-sky-800">#{user.id}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium text-sky-800">{user.name}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-sky-800">{user.email || "Not available"}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-sky-800">{user.phone || "Not provided"}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium text-sky-800">{formatDate(user.createdAt)}</span>
                    </li>
                    <li className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-medium text-sky-800">{formatDate(user.updatedAt)}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Quick actions card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-sky-100 mb-6">
                <div className="p-6 border-b border-sky-100">
                  <h3 className="font-bold text-sky-800">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {!isEditing ? (
                      <button 
                        onClick={toggleEditMode}
                        className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium flex items-center justify-center transition-colors"
                      >
                        <Edit size={18} className="mr-2" />
                        Edit User Details
                      </button>
                    ) : (
                      <button 
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    )}
                    <button 
                      onClick={handleDelete}
                      className={`w-full py-2.5 px-4 ${isEditing ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-red-500 hover:bg-red-600 text-white'} rounded-xl font-medium flex items-center justify-center transition-colors`}
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserPage;