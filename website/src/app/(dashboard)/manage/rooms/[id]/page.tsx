"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  BedDouble, Edit, Trash2, ArrowLeft, Save,
  AlertCircle, User, Users, Camera, Car
} from "lucide-react";

// Add room types for dropdown (same as in the ManageRoomsPage)
const roomTypes = [
  "Small",
  "Middle",
  "Big"
];

// Add the missing formatDate function
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

const SingleRoomPage = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id;
  const fileInputRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    room_name: "",
    room_type: roomTypes[0],
    capacity: 0,
    facilities: "",
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

  // Fetch room data
  const fetchRoomData = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      setRoom(response.data);
      setEditData({
        room_name: response.data.room_name || "",
        room_type: response.data.room_type || roomTypes[0],
        capacity: response.data.capacity || 0,
        facilities: response.data.facilities || "",
        image: response.data.image || ""
      });
    } catch (err) {
      console.error("Error fetching room:", err);
      setError("Unable to load room information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setEditData({
        room_name: room.room_name || "",
        room_type: room.room_type || roomTypes[0],
        capacity: room.capacity || 0,
        facilities: room.facilities || "",
        image: room.image || ""
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
      [name]: name === 'capacity' ? parseInt(value) : value
    });
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

// Improved handleSubmit function with better error handling
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);
  setUpdateStatus({ type: null, message: null });
  
  const apiClient = createApiClient();
  if (!apiClient) return;

  // Prepare form data for submission
  const formData = new FormData();
  
  // Ensure all required fields are included and properly formatted
  formData.append('room_name', editData.room_name.trim());
  formData.append('room_type', editData.room_type);
  formData.append('facilities', editData.facilities.trim());
  
  // Make sure capacity is a valid number
  const capacity = parseInt(editData.capacity);
  if (isNaN(capacity) || capacity <= 0) {
    setUpdateStatus({
      type: 'error',
      message: 'Capacity must be a positive number'
    });
    setIsSaving(false);
    return;
  }
  formData.append('capacity', capacity);

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
  console.log("Submitting room update...");
  console.log("Room ID:", roomId);
  
  try {
    // Log request details before sending
    console.log("API URL:", `${apiClient.defaults.baseURL}/rooms/${roomId}`);
    
    const response = await apiClient.put(`/rooms/${roomId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Update successful:", response.data);
    setRoom(response.data);
    setUpdateStatus({
      type: 'success',
      message: 'Room updated successfully',
    });
    setIsEditing(false);
    setPreviewImage(null);
    setSelectedFile(null);
  } catch (err) {
    console.error("Error updating room:", err);
    
    // Extract more detailed error message
    let errorMessage = 'Failed to update room. Please try again.';
    
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
        // Optionally redirect to login
        // setTimeout(() => router.push('/sign-in'), 2000);
      } else if (err.response.status === 403) {
        errorMessage = 'You do not have permission to update this room.';
      } else if (err.response.status === 413) {
        errorMessage = 'The image file is too large for the server to process.';
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

  // Handle room deletion
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/rooms/${roomId}`);
      router.push("/manage/rooms");
    } catch (err) {
      console.error("Error deleting room:", err);
      setUpdateStatus({
        type: 'error',
        message: 'Failed to delete room. Please try again.'
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, router]);

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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Room</h3>
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

  // No room found
  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Room Not Found</h3>
            <p className="text-gray-600 mb-6">The requested room could not be found or may have been deleted.</p>
            <button 
              onClick={() => router.push("/manage/rooms")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center mx-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Rooms
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
              <BedDouble size={20} className="mr-2 text-sky-500" />
              Room Details
            </h1>
            <div className="flex items-center gap-4">
              <Link href="/manage/rooms">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Rooms
                </button>
              </Link>
              {!isEditing ? (
                <button
                  onClick={toggleEditMode}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Room
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
              {/* Room info card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-sky-100 mb-6">
                <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 text-white">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <BedDouble size={24} />
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="room_name"
                          value={editData.room_name}
                          onChange={handleInputChange}
                          className="bg-white/10 backdrop-blur-sm text-2xl font-bold p-1 rounded w-full text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Room Name"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold">{room.room_name}</h2>
                      )}
                      <div className="mt-1 text-sky-50 flex items-center text-sm">
                        <span>ID: {room.room_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Image */}
                  <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden relative mb-6 group">
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
                          alt={room.room_name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : room.image ? (
                      <div className="relative w-full h-full">
                        <img
                          src={fixImageUrl(room.image)}
                          alt={room.room_name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-room.jpg';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BedDouble size={64} className="text-gray-300" />
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
                  
                  {/* Room Type info */}
                  <div className="flex items-start mb-6 p-4 bg-sky-50 rounded-2xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                      <BedDouble size={20} className="text-sky-500" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="uppercase text-xs font-semibold text-sky-500 tracking-wider">Room Type</h3>
                      {isEditing ? (
                        <select
                          name="room_type"
                          value={editData.room_type}
                          onChange={handleInputChange}
                          className="mt-1 p-2 border border-sky-200 rounded w-full bg-white"
                        >
                          {roomTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-lg font-medium text-gray-800">
                          {room.room_type || "Not assigned"}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Capacity info */}
                  <div className="flex items-start mb-6 p-4 bg-sky-50 rounded-2xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                      <Users size={20} className="text-sky-500" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="uppercase text-xs font-semibold text-sky-500 tracking-wider">Capacity</h3>
                      {isEditing ? (
                        <input
                          type="number"
                          name="capacity"
                          value={editData.capacity}
                          onChange={handleInputChange}
                          min="1"
                          max="100"
                          className="mt-1 p-2 border border-sky-200 rounded w-full bg-white"
                          placeholder="Capacity"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-800">
                          {room.capacity} persons
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Facilities info */}
                  <div className="flex items-start mb-6 p-4 bg-sky-50 rounded-2xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-sky-500" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="uppercase text-xs font-semibold text-sky-500 tracking-wider">Facilities</h3>
                      {isEditing ? (
                        <textarea
                          name="facilities"
                          value={editData.facilities}
                          onChange={handleInputChange}
                          rows={3}
                          className="mt-1 p-2 border border-sky-200 rounded w-full bg-white"
                          placeholder="Room Facilities"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-800">
                          {room.facilities || "No facilities information available"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Summary and metadata */}
            <div className="md:col-span-5 lg:col-span-4">
              {/* Room summary card */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-sky-100 mb-6">
                <div className="p-6 border-b border-sky-100">
                  <h3 className="font-bold text-sky-800">Room Details</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Room ID</span>
                      <span className="font-medium text-sky-800">#{room.room_id}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Room Name</span>
                      <span className="font-medium text-sky-800">{room.room_name}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Room Type</span>
                      <span className="font-medium text-sky-800">{room.room_type || "Not assigned"}</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Capacity</span>
                      <span className="font-medium text-sky-800">{room.capacity} persons</span>
                    </li>
                    <li className="flex justify-between items-center py-2 border-b border-dashed border-sky-100">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium text-sky-800">{formatDate(room.createdAt)}</span>
                    </li>
                    <li className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-medium text-sky-800">{formatDate(room.updatedAt)}</span>
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
                        Edit Room Details
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
                      Delete Room
                    </button>
                  </div>
                </div>
              </div>
              
              {/* View related bookings */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-sky-100 mb-6">
                <div className="p-6">
                  <Link href={`/list/room-bookings?room=${roomId}`}>
                    <button className="w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-medium flex items-center justify-center transition-colors">
                      View Related Bookings
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleRoomPage;