"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  Car, Edit, Trash2, ArrowLeft, Save,
  AlertCircle, User, Users, Camera
} from "lucide-react";

const SingleTransportPage = () => {
  const router = useRouter();
  const params = useParams();
  const transportId = params.id;

  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    vehicle_name: "",
    driver_name: "",
    capacity: 0,
    image: ""
  });
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
      baseURL: "https://dbtch5xt-3001.asse.devtunnels.ms/api",
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch transport data
  const fetchTransportData = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      const response = await apiClient.get(`/transports/${transportId}`);
      setTransport(response.data);
      setEditData({
        vehicle_name: response.data.vehicle_name || "",
        driver_name: response.data.driver_name || "",
        capacity: response.data.capacity || 0,
        image: response.data.image || ""
      });
    } catch (err) {
      console.error("Error fetching transport:", err);
      
      // Check for unauthorized error
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/sign-in");
        return;
      }
      
      setError(
        err.response?.data?.message || 
        "Unable to load transport information. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setEditData({
        vehicle_name: transport.vehicle_name || "",
        driver_name: transport.driver_name || "",
        capacity: transport.capacity || 0,
        image: transport.image || ""
      });
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setUpdateStatus({ type: null, message: null });
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      const response = await apiClient.put(`/transports/${transportId}`, editData);
      
      // Update local state with the updated data
      setTransport({
        ...transport,
        ...editData,
        updatedAt: new Date().toISOString()
      });
      
      setUpdateStatus({
        type: 'success',
        message: 'Transport updated successfully'
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating transport:", err);
      
      setUpdateStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update transport. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle transport deletion
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transport? This action cannot be undone.")) {
      return;
    }
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/transports/${transportId}`);
      router.push("/manage/transports");
    } catch (err) {
      console.error("Error deleting transport:", err);
      setUpdateStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete transport. Please try again.'
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (transportId) {
      fetchTransportData();
    }
  }, [transportId, router]);

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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Transport</h3>
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

  // No transport found
  if (!transport) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Transport Not Found</h3>
            <p className="text-gray-600 mb-6">The requested transport could not be found or may have been deleted.</p>
            <button 
              onClick={() => router.push("/manage/transports")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center mx-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Transports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Status message */}
        {updateStatus.message && (
          <div className={`mb-6 p-4 rounded-xl ${updateStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <div className="flex items-center">
              {updateStatus.type === 'success' ? (
                <div className="mr-2 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
              ) : (
                <AlertCircle size={20} className="mr-2 flex-shrink-0 text-red-500" />
              )}
              <p>{updateStatus.message}</p>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column - Main info */}
          <div className="md:col-span-7 lg:col-span-8">
            {/* Transport info card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Car size={24} />
                    </div>
                    <div className="ml-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="vehicle_name"
                          value={editData.vehicle_name}
                          onChange={handleInputChange}
                          className="bg-white/10 backdrop-blur-sm text-2xl font-bold p-1 rounded w-full text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                          placeholder="Vehicle Name"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold">{transport.vehicle_name}</h2>
                      )}
                      <div className="mt-1 text-blue-50 flex items-center text-sm">
                        <span>ID: {transport.transport_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <button
                        onClick={toggleEditMode}
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-colors"
                        title="Cancel"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={toggleEditMode}
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-colors"
                        title="Edit Transport"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {isEditing ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                        title="Save Changes"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                          <Save size={18} />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleDelete}
                        className="rounded-full w-10 h-10 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Delete Transport"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Image */}
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative mb-6 group">
                  {transport.image ? (
                    <Image
                      src={transport.image}
                      alt={transport.vehicle_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car size={64} className="text-gray-300" />
                      <p className="text-gray-400 absolute bottom-4">No image available</p>
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                        <input
                          type="text"
                          name="image"
                          value={editData.image}
                          onChange={handleInputChange}
                          className="p-2 border border-gray-300 rounded w-full text-sm"
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-blue-500 rounded-full p-2 text-white">
                          <Camera size={20} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Driver info */}
                <div className="flex items-start mb-6 p-4 bg-indigo-50 rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-indigo-500" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="uppercase text-xs font-semibold text-indigo-500 tracking-wider">Driver</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="driver_name"
                        value={editData.driver_name}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border border-indigo-200 rounded w-full bg-white"
                        placeholder="Driver Name"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-800">
                        {transport.driver_name || "Not assigned"}
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
                        {transport.capacity} persons
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Summary and metadata */}
          <div className="md:col-span-5 lg:col-span-4">
            {/* Transport summary card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-6">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Transport Details</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Transport ID</span>
                    <span className="font-medium text-gray-800">#{transport.transport_id}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Vehicle Name</span>
                    <span className="font-medium text-gray-800">{transport.vehicle_name}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Driver</span>
                    <span className="font-medium text-gray-800">{transport.driver_name || "Not assigned"}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium text-gray-800">{transport.capacity} persons</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium text-gray-800">{formatDate(transport.createdAt)}</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium text-gray-800">{formatDate(transport.updatedAt)}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Quick actions card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-6">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {!isEditing ? (
                    <button 
                      onClick={toggleEditMode}
                      className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center transition-colors"
                    >
                      <Edit size={18} className="mr-2" />
                      Edit Transport Details
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
                    Delete Transport
                  </button>
                </div>
              </div>
            </div>
            
            {/* View related bookings */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-6">
              <div className="p-6">
                <Link href={`/list/transport-bookings?transport=${transportId}`}>
                  <button className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-medium flex items-center justify-center transition-colors">
                    View Related Bookings
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Navigation links */}
            <div>
              <Link 
                href="/manage/transports" 
                className="flex items-center text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Transport Management
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTransportPage;