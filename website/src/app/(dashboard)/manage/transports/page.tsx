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
  Car, Plus, Edit, Trash2, X, Save, 
  Camera, AlertCircle, Users
} from "lucide-react";

type Transport = {
  transport_id: number;
  vehicle_name: string;
  driver_name: string;
  capacity: number;
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
    header: "Transport ID",
    accessor: "transport_id",
    className: "hidden md:table-cell",
  },
  {
    header: "Vehicle Name",
    accessor: "vehicle_name",
    className: "hidden md:table-cell",
  },
  {
    header: "Driver",
    accessor: "driver_name",
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

const TransportManagePage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  
  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTransport, setCurrentTransport] = useState<Transport | null>(null);
  const [formData, setFormData] = useState({
    vehicle_name: "",
    driver_name: "",
    capacity: 1,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: null, message: null });
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transportToDelete, setTransportToDelete] = useState<number | null>(null);
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
    fetchTransports();
  }, [router]);

  const fetchTransports = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      console.log("Fetching transports...");
      const response = await apiClient.get("/transports");
      console.log("Transports fetched successfully:", response.data);
      setTransports(response.data);
      setAuthStatus("Authenticated and data loaded");
    } catch (error: any) {
      console.error("Error fetching transports:", error);
      
      // Check for unauthorized error
      if (error.response?.status === 401) {
        setAuthStatus("Authentication failed (401) - token may be invalid");
        localStorage.removeItem("adminToken");
        router.push("/sign-in");
        return;
      }
      
      setError(
        error.response?.data?.message || 
        "Unable to load transports. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating a new transport
  const handleAddTransport = () => {
    setFormData({
      vehicle_name: "",
      driver_name: "",
      capacity: 1,
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setFormErrors({});
    setIsEditMode(false);
    setCurrentTransport(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing transport
  const handleEditTransport = (transport: Transport) => {
    setFormData({
      vehicle_name: transport.vehicle_name || "",
      driver_name: transport.driver_name || "",
      capacity: transport.capacity || 1,
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setFormErrors({});
    setIsEditMode(true);
    setCurrentTransport(transport);
    setIsModalOpen(true);
  };

  // Confirm dialog for deleting a transport
  const handleDeleteClick = (transportId: number) => {
    setTransportToDelete(transportId);
    setShowDeleteConfirm(true);
  };

  // Delete a transport
  const handleDeleteTransport = async () => {
    if (!transportToDelete) return;
    
    setIsDeleting(true);
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/transports/${transportToDelete}`);
      setTransports(transports.filter(transport => transport.transport_id !== transportToDelete));
      setStatusMessage({
        type: 'success',
        message: 'Transport deleted successfully'
      });
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: null });
      }, 3000);
    } catch (err) {
      console.error("Error deleting transport:", err);
      setStatusMessage({
        type: 'error',
        message: 'Failed to delete transport. Please try again.'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setTransportToDelete(null);
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
    
    if (!formData.vehicle_name.trim()) {
      errors.vehicle_name = 'Vehicle name is required';
    }
    
    if (!formData.driver_name.trim()) {
      errors.driver_name = 'Driver name is required';
    }
    
    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create/update transport)
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
    formDataToSend.append('vehicle_name', formData.vehicle_name.trim());
    formDataToSend.append('driver_name', formData.driver_name.trim());
    formDataToSend.append('capacity', formData.capacity.toString());
    
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }
    
    try {
      let response;
      if (isEditMode && currentTransport) {
        // Update existing transport
        response = await apiClient.put(`/transports/${currentTransport.transport_id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Update the transports list with the updated transport
        setTransports(transports.map(transport => 
          transport.transport_id === currentTransport.transport_id ? response.data : transport
        ));
        
        setStatusMessage({
          type: 'success',
          message: 'Transport updated successfully'
        });
      } else {
        // Create new transport
        response = await apiClient.post('/transports', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Add the new transport to the transports list
        setTransports([...transports, response.data]);
        
        setStatusMessage({
          type: 'success',
          message: 'Transport created successfully'
        });
      }
      
      // Close the modal and reset form
      setIsModalOpen(false);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: null });
      }, 3000);
    } catch (err) {
      console.error("Error saving transport:", err);
      
      // Extract error message from response
      let errorMessage = 'Failed to save transport. Please try again.';
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
    // Use a more generic placeholder that's likely to exist in your project
    // or one from the Room component that already works
    return "/placeholder-room.jpg"; // If this exists in your project
    // Alternatively, return a path to any image that definitely exists in your public folder
    // Or return a data URI for a simple gray box as absolute fallback
    // return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M30,30 L70,70 M30,70 L70,30' stroke='%23cccccc' stroke-width='2'/%3E%3C/svg%3E";
  };

  const renderRow = (item: Transport) => (
    <tr
      key={item.transport_id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
          {item.image ? (
            <img 
              src={fixImageUrl(item.image)} 
              alt={item.vehicle_name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = getPlaceholderImage();
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car size={20} className="text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.vehicle_name}</h3>
          <p className="text-xs text-gray-500">
            Driver: {item.driver_name}
          </p>
          <p className="text-xs text-gray-500">
            Capacity: {item.capacity} persons
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.transport_id}</td>
      <td className="hidden md:table-cell">{item.vehicle_name}</td>
      <td className="hidden md:table-cell">{item.driver_name}</td>
      <td className="hidden lg:table-cell">{item.capacity}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/manage/transports/${item.transport_id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <button
            onClick={() => handleEditTransport(item)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaBlue text-white"
            title="Edit Transport"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(item.transport_id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaRed text-white"
            title="Delete Transport"
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
        <h1 className="hidden md:block text-lg font-semibold">Manage Transports</h1>
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
              onClick={handleAddTransport}
              className="h-9 px-4 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <Plus size={18} className="mr-1" />
              <span className="font-medium">Add Transport</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading transports...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchTransports()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && transports.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Car size={32} className="text-gray-300" />
            </div>
          </div>
          <h3 className="font-bold text-lg mb-2">No Transports Found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first transport.</p>
          <button 
            onClick={handleAddTransport}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <Plus size={18} className="mr-2" />
            Add New Transport
          </button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && transports.length > 0 && (
        <>
          <Table columns={columns} renderRow={renderRow} data={transports} />
          <Pagination />
        </>
      )}

      {/* Add/Edit Transport Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                    <Car size={20} />
                  </div>
                  <h2 className="text-xl font-bold">
                    {isEditMode ? 'Edit Transport' : 'Add New Transport'}
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
                {/* Vehicle Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicle_name"
                    value={formData.vehicle_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.vehicle_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter vehicle name"
                  />
                  {formErrors.vehicle_name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.vehicle_name}</p>
                  )}
                </div>
                
                {/* Driver Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300 ${
                      formErrors.driver_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter driver name"
                  />
                  {formErrors.driver_name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.driver_name}</p>
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
                
                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Image
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
                        alt="Vehicle preview"
                        className="w-full h-full object-cover"
                      />
                    ) : currentTransport && currentTransport.image ? (
                      <img
                        src={fixImageUrl(currentTransport.image)}
                        alt={currentTransport.vehicle_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = getPlaceholderImage();
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Car size={48} className="text-gray-300 mb-2" />
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
                    {isEditMode ? 'Update Transport' : 'Create Transport'}
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
                Are you sure you want to delete this transport? This action cannot be undone and all associated data will be permanently removed.
              </p>
              
              {/* Get transport details for the transport to be deleted */}
              {transportToDelete && 
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Car size={24} className="text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        {transports.find(transport => transport.transport_id === transportToDelete)?.vehicle_name || 'Unknown Transport'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {transportToDelete}
                      </p>
                    </div>
                  </div>
                </div>
              }
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTransportToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTransport}
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
                      Delete Transport
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

export default TransportManagePage;