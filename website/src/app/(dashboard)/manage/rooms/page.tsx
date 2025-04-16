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
  BedDouble, Plus, Edit, Trash2, X, Save, 
  Camera, AlertCircle, Users
} from "lucide-react";

type Room = {
  room_id: number;
  room_name: string;
  room_type: string;
  capacity: number;
  facilities: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Room ID",
    accessor: "room_id",
    className: "hidden md:table-cell",
  },
  {
    header: "Room Name",
    accessor: "room_name",
    className: "hidden md:table-cell",
  },
  {
    header: "Room Type",
    accessor: "room_type",
    className: "hidden md:table-cell",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

// Room types for dropdown
const roomTypes = [
  "Standard",
  "Deluxe",
  "Suite",
  "Executive",
  "Family",
  "Single",
  "Double",
  "Twin"
];

const RoomManagePage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  
  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_name: "",
    room_type: roomTypes[0],
    capacity: 1,
    facilities: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: null, message: null });
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Utility function to fix image URLs
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
    fetchRooms();
  }, [router]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      console.log("Fetching rooms...");
      const response = await apiClient.get("/rooms");
      console.log("Rooms fetched successfully:", response.data);
      setRooms(response.data);
      setAuthStatus("Authenticated and data loaded");
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      
      // Check for unauthorized error
      if (error.response?.status === 401) {
        setAuthStatus("Authentication failed (401) - token may be invalid");
        localStorage.removeItem("adminToken");
        router.push("/sign-in");
        return;
      }
      
      setError(
        error.response?.data?.message || 
        "Unable to load rooms. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating a new room
  const handleAddRoom = () => {
    setFormData({
      room_name: "",
      room_type: roomTypes[0],
      capacity: 1,
      facilities: "",
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setFormErrors({});
    setIsEditMode(false);
    setCurrentRoom(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing room
  const handleEditRoom = (room: Room) => {
    setFormData({
      room_name: room.room_name || "",
      room_type: room.room_type || roomTypes[0],
      capacity: room.capacity || 1,
      facilities: room.facilities || "",
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setFormErrors({});
    setIsEditMode(true);
    setCurrentRoom(room);
    setIsModalOpen(true);
  };

  // Confirm dialog for deleting a room
  const handleDeleteClick = (roomId: number) => {
    setRoomToDelete(roomId);
    setShowDeleteConfirm(true);
  };

  // Delete a room
  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    setIsDeleting(true);
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/rooms/${roomToDelete}`);
      setRooms(rooms.filter(room => room.room_id !== roomToDelete));
      setStatusMessage({
        type: 'success',
        message: 'Room deleted successfully'
      });
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: null });
      }, 3000);
    } catch (err) {
      console.error("Error deleting room:", err);
      setStatusMessage({
        type: 'error',
        message: 'Failed to delete room. Please try again.'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // If input is a number field, parse it as integer
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field when user makes a change
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Trigger file input click for image upload
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle file selection for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`Selected file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, type: ${file.type}`);
      
      // Check for file size exceeding limit
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setFormErrors({
          ...formErrors,
          image: `Image is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          image: `Unsupported file type: ${file.type}. Please use JPEG or PNG images.`
        });
        return;
      }

      // Set the selected file and its preview
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      
      // Clear any image error
      if (formErrors.image) {
        setFormErrors({
          ...formErrors,
          image: ''
        });
      }
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.room_name.trim()) {
      errors.room_name = 'Room name is required';
    }
    
    if (!formData.room_type) {
      errors.room_type = 'Room type is required';
    }
    
    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create/update room)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    const apiClient = createApiClient();
    if (!apiClient) return;

    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append('room_name', formData.room_name.trim());
    formDataToSend.append('room_type', formData.room_type);
    formDataToSend.append('capacity', formData.capacity.toString());
    formDataToSend.append('facilities', formData.facilities.trim());
    
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }
    
    try {
      let response;
      if (isEditMode && currentRoom) {
        // Update existing room
        response = await apiClient.put(`/rooms/${currentRoom.room_id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Update the rooms list with the updated room
        setRooms(rooms.map(room => 
          room.room_id === currentRoom.room_id ? response.data : room
        ));
        
        setStatusMessage({
          type: 'success',
          message: 'Room updated successfully'
        });
      } else {
        // Create new room
        response = await apiClient.post('/rooms', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Add the new room to the rooms list
        setRooms([...rooms, response.data]);
        
        setStatusMessage({
          type: 'success',
          message: 'Room created successfully'
        });
      }
      
      // Close the modal and reset form
      setIsModalOpen(false);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: null });
      }, 3000);
    } catch (err) {
      console.error("Error saving room:", err);
      
      // Extract error message from response
      let errorMessage = 'Failed to save room. Please try again.';
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

  const getPlaceholderImage = () => {
    return "/placeholder-room.jpg"; // Use a public image in your project
  };

  const renderRow = (item: Room) => (
    <tr
      key={item.room_id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
          {item.image ? (
            <img 
              src={fixImageUrl(item.image)} 
              alt={item.room_name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = getPlaceholderImage();
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BedDouble size={20} className="text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.room_name}</h3>
          <p className="text-xs text-gray-500">
            Type: {item.room_type}
          </p>
          <p className="text-xs text-gray-500">
            Capacity: {item.capacity} persons
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.room_id}</td>
      <td className="hidden md:table-cell">{item.room_name}</td>
      <td className="hidden md:table-cell">{item.room_type}</td>
      <td className="hidden lg:table-cell">{item.capacity}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/manage/rooms/${item.room_id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <button
            onClick={() => handleEditRoom(item)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaBlue text-white"
            title="Edit Room"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(item.room_id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaRed text-white"
            title="Delete Room"
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
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:underline text-xs"
          >
            Reload page
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
        <h1 className="hidden md:block text-lg font-semibold">Manage Rooms</h1>
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
              onClick={handleAddRoom}
              className="h-9 px-4 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <Plus size={18} className="mr-1" />
              <span className="font-medium">Add Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchRooms()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && rooms.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <BedDouble size={32} className="text-gray-300" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2">No Rooms Found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first room.</p>
          <button 
            onClick={handleAddRoom}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <Plus size={18} className="mr-2" />
            Add New Room
          </button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && rooms.length > 0 && (
        <>
          <Table columns={columns} renderRow={renderRow} data={rooms} />
          <Pagination />
        </>
      )}

      {/* Add/Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                    <BedDouble size={20} />
                  </div>
                  <h2 className="text-xl font-bold">
                    {isEditMode ? 'Edit Room' : 'Add New Room'}
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
                {/* Room Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room_name"
                    value={formData.room_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.room_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter room name"
                  />
                  {formErrors.room_name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.room_name}</p>
                  )}
                </div>
                
                {/* Room Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="room_type"
                    value={formData.room_type}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.room_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {formErrors.room_type && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.room_type}</p>
                  )}
                </div>
                
                {/* Capacity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                        formErrors.capacity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="ml-2 text-gray-500 flex items-center">
                      <Users size={18} className="mr-1" />
                      <span>persons</span>
                    </div>
                  </div>
                  {formErrors.capacity && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>
                  )}
                </div>
                
                {/* Facilities */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facilities
                  </label>
                  <textarea
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Enter room facilities (e.g., Wi-Fi, TV, Mini-bar)"
                  />
                </div>
                
                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Image
                  </label>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden relative mb-2 border border-gray-200">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Room preview"
                        className="w-full h-full object-cover"
                      />
                    ) : currentRoom && currentRoom.image ? (
                      <img
                        src={fixImageUrl(currentRoom.image)}
                        alt={currentRoom.room_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = getPlaceholderImage();
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <BedDouble size={48} className="text-gray-300 mb-2" />
                        <p className="text-gray-400 text-sm">No image selected</p>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute bottom-3 right-3 bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 transition-colors"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                  {formErrors.image && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a JPEG or PNG image (max 5MB). Leave empty to keep the current image.
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
                    {isEditMode ? 'Update Room' : 'Create Room'}
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
                Are you sure you want to delete this room? This action cannot be undone and all associated data will be permanently removed.
              </p>
              
              {/* Get room details for the room to be deleted */}
              {roomToDelete && 
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BedDouble size={24} className="text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        {rooms.find(room => room.room_id === roomToDelete)?.room_name || 'Unknown Room'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {roomToDelete}
                      </p>
                    </div>
                  </div>
                </div>
              }
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setRoomToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRoom}
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
                      Delete Room
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

export default RoomManagePage;