"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { 
  Car, Edit, Trash2, CheckCircle, XCircle, ArrowLeft,
  CalendarDays, Clock, User, Users, FileText, AlertCircle, 
  CheckCheck, Home, MessageSquare, MapPin
} from "lucide-react";

const SingleTransportBookingPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

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

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get appropriate status style with orange and sky theme
  const getStatusStyle = (status) => {
    if (!status) return {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: <AlertCircle size={14} />
    };
    
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          bg: "bg-green-50",
          text: "text-green-600",
          border: "border-green-100",
          icon: <CheckCheck size={14} />
        };
      case 'rejected':
        return {
          bg: "bg-red-50",
          text: "text-red-600",
          border: "border-red-100",
          icon: <XCircle size={14} />
        };
      case 'pending':
        return {
          bg: "bg-orange-50",
          text: "text-orange-600",
          border: "border-orange-100",
          icon: <Clock size={14} />
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: <AlertCircle size={14} />
        };
    }
  };

  // Fetch transport booking data
  const fetchBookingData = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      const response = await apiClient.get(`/transport-bookings/${bookingId}`);
      setBooking(response.data);
    } catch (err) {
      console.error("Error fetching transport booking:", err);
      
      // Check for unauthorized error
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/sign-in");
        return;
      }
      
      setError(
        err.response?.data?.message || 
        "Unable to load transport booking information. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (newStatus) => {
    setStatusLoading(true);
    setStatusMessage(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      // Get current admin ID from localStorage if available
      const adminInfo = localStorage.getItem("adminInfo");
      let approver_id = null;
      
      if (adminInfo) {
        try {
          const adminData = JSON.parse(adminInfo);
          approver_id = adminData.id || null;
        } catch (e) {
          console.error("Error parsing admin info:", e);
        }
      }
      
      // Prepare update data
      const updateData = {
        status: newStatus,
        approver_id: approver_id,
        approved_at: new Date().toISOString()
      };
      
      // Update booking
      await apiClient.put(`/transport-bookings/${bookingId}`, updateData);
      
      // Show success message
      setStatusMessage({
        type: 'success',
        text: `Booking has been ${newStatus.toLowerCase()} successfully.`
      });
      
      // Refresh booking data
      fetchBookingData();
    } catch (err) {
      console.error(`Error ${newStatus.toLowerCase()} booking:`, err);
      
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || `Failed to ${newStatus.toLowerCase()} booking. Please try again.`
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle approve booking
  const handleApprove = () => {
    updateBookingStatus('approved');
  };
  
  // Handle reject booking
  const handleReject = () => {
    updateBookingStatus('rejected');
  };

  // Initial data fetch
  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-sky-500 animate-spin"></div>
          <div className="mt-4 text-sky-500 font-medium text-center">Loading</div>
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Booking</h3>
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

  // No booking found
  if (!booking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-8">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Booking Not Found</h3>
            <p className="text-gray-600 mb-6">The requested booking could not be found or may have been deleted.</p>
            <button 
              onClick={() => router.push("/list/transport-bookings")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center mx-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Transport Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(booking.status);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Status message */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <div className="flex items-center">
              {statusMessage.type === 'success' ? (
                <CheckCircle size={20} className="mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              )}
              <p>{statusMessage.text}</p>
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
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Car size={24} />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold">Transport #{booking.transport_id}</h2>
                    <div className="mt-1 text-blue-50 flex items-center text-sm">
                      <CalendarDays size={14} className="mr-1.5" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Time slot */}
                <div className="flex items-start mb-6 p-4 bg-blue-50 rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="uppercase text-xs font-semibold text-blue-500 tracking-wider">Time Slot</h3>
                    <p className="text-lg font-medium text-gray-800">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                  </div>
                </div>
                
                {/* Destination */}
                <div className="flex items-start mb-6 p-4 bg-indigo-50 rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="uppercase text-xs font-semibold text-indigo-500 tracking-wider">Destination</h3>
                    <p className="text-lg font-medium text-gray-800">
                      {booking.destination || "Not specified"}
                    </p>
                  </div>
                </div>
                
                {/* Organizer info */}
                <div className="flex items-start mb-6 p-4 bg-sky-50 rounded-2xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <User size={20} className="text-sky-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="uppercase text-xs font-semibold text-sky-500 tracking-wider">Person in Charge</h3>
                    <p className="text-lg font-medium text-gray-800">
                      {booking.pic || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description & Notes */}
            {(booking.description || booking.notes) && (
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6">
                  {/* Description section */}
                  {booking.description && (
                    <div className="mb-6">
                      <h3 className="flex items-center text-sky-500 font-semibold mb-3 uppercase text-xs tracking-wider">
                        <FileText size={16} className="mr-2" />
                        Description
                      </h3>
                      <div className="p-4 bg-gray-50 rounded-2xl text-gray-700">
                        {booking.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes section */}
                  {booking.notes && (
                    <div>
                      <h3 className="flex items-center text-blue-500 font-semibold mb-3 uppercase text-xs tracking-wider">
                        <MessageSquare size={16} className="mr-2" />
                        Notes
                      </h3>
                      <div className="p-4 bg-blue-50 rounded-2xl text-gray-700">
                        {booking.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Summary and actions */}
          <div className="md:col-span-5 lg:col-span-4">
            {/* Booking summary card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-6">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Booking Summary</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Booking ID</span>
                    <span className="font-medium text-gray-800">#{booking.booking_id}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Transport</span>
                    <span className="font-medium text-gray-800">#{booking.transport_id}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-800">{formatDate(booking.booking_date)}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-800">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Destination</span>
                    <span className="font-medium text-gray-800">{booking.destination || "Not specified"}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Person in Charge</span>
                    <span className="font-medium text-gray-800">{booking.pic || "Not specified"}</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                    <span className="text-gray-500">Section</span>
                    <span className="font-medium text-gray-800">{booking.section || "Not specified"}</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Status</span>
                    <span className={`${statusStyle.bg} ${statusStyle.text} px-3 py-1 rounded-full text-xs font-medium`}>
                      {booking.status}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Admin actions card */}
            {role === "admin" && (
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Actions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {booking.status === "pending" && (
                      <>
                        <button 
                          onClick={handleApprove}
                          disabled={statusLoading}
                          className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {statusLoading ? (
                            <>
                              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={18} className="mr-2" />
                              Approve Booking
                            </>
                          )}
                        </button>
                        <button 
                          onClick={handleReject}
                          disabled={statusLoading}
                          className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {statusLoading ? (
                            <>
                              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <XCircle size={18} className="mr-2" />
                              Reject Booking
                            </>
                          )}
                        </button>
                      </>
                    )}
                    {booking.status !== "pending" && (
                      <div className={`${booking.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} p-3 rounded-xl text-center`}>
                        This booking has been {booking.status.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation links */}
            <div>
              <Link 
                href="/list/transport-bookings" 
                className="flex items-center text-sky-500 hover:text-sky-600 font-medium transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Transport Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTransportBookingPage;