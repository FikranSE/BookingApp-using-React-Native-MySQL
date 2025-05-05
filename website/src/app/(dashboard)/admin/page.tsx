"use client";

import React, { useState, useEffect } from 'react';
import axios from "axios";
import {
  Building, Users, Car, CalendarDays, Clock, 
  ArrowUp, ArrowDown, CheckCircle, XCircle, AlertCircle, 
  PieChart, Calendar, Layers, Activity, CheckCheck, User
} from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    roomBookings: { total: 0, pending: 0, approved: 0, rejected: 0 },
    transportBookings: { total: 0, pending: 0, approved: 0, rejected: 0 },
    rooms: { total: 0, available: 0 },
    transports: { total: 0, available: 0 }
  });
  
  const [recentRoomBookings, setRecentRoomBookings] = useState([]);
  const [recentTransportBookings, setRecentTransportBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableTransports, setAvailableTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  
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

  // Create a custom axios instance
  const createApiClient = () => {
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      console.warn("No admin token found");
      return null;
    }
    
    return {
      baseURL: "https://j9d3hc82-3001.asse.devtunnels.ms/api",
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Get appropriate status style with a more subtle design
  const getStatusStyle = (status) => {
    if (!status) return {
      bg: "bg-gray-50",
      text: "text-gray-600",
      icon: <AlertCircle size={14} />
    };
    
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          bg: "bg-green-50",
          text: "text-green-600",
          icon: <CheckCheck size={14} />
        };
      case 'rejected':
        return {
          bg: "bg-red-50",
          text: "text-red-600",
          icon: <XCircle size={14} />
        };
      case 'pending':
        return {
          bg: "bg-gray-50",
          text: "text-gray-600",
          icon: <Clock size={14} />
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-600",
          icon: <AlertCircle size={14} />
        };
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) {
      setError("Authentication required. Please sign in.");
      setLoading(false);
      return;
    }
    
    try {
      // Fetch room bookings
      const roomBookingsResponse = await axios.get(`${apiClient.baseURL}/room-bookings`, {
        headers: apiClient.headers
      });
      
      // Fetch transport bookings
      const transportBookingsResponse = await axios.get(`${apiClient.baseURL}/transport-bookings`, {
        headers: apiClient.headers
      });
      
      // Fetch rooms
      const roomsResponse = await axios.get(`${apiClient.baseURL}/rooms`, {
        headers: apiClient.headers
      });
      
      // Fetch transports
      const transportsResponse = await axios.get(`${apiClient.baseURL}/transports`, {
        headers: apiClient.headers
      });
      
      // Process room bookings data
      const roomBookings = roomBookingsResponse.data || [];
      const roomStats = {
        total: roomBookings.length,
        pending: roomBookings.filter(booking => booking.status?.toLowerCase() === 'pending').length,
        approved: roomBookings.filter(booking => booking.status?.toLowerCase() === 'approved').length,
        rejected: roomBookings.filter(booking => booking.status?.toLowerCase() === 'rejected').length,
        cancelled: roomBookings.filter(booking => booking.status?.toLowerCase() === 'cancelled').length
      };
      
      // Process transport bookings data
      const transportBookings = transportBookingsResponse.data || [];
      const transportStats = {
        total: transportBookings.length,
        pending: transportBookings.filter(booking => booking.status?.toLowerCase() === 'pending').length,
        approved: transportBookings.filter(booking => booking.status?.toLowerCase() === 'approved').length,
        rejected: transportBookings.filter(booking => booking.status?.toLowerCase() === 'rejected').length,
        cancelled: transportBookings.filter(booking => booking.status?.toLowerCase() === 'cancelled').length
      };
      
      // Process rooms data
      const rooms = roomsResponse.data || [];
      const roomsStats = {
        total: rooms.length,
        available: rooms.filter(room => room.status?.toLowerCase() === 'available').length || rooms.length
      };
      
      // Process transports data
      const transports = transportsResponse.data || [];
      const transportsStats = {
        total: transports.length,
        available: transports.filter(transport => transport.status?.toLowerCase() === 'available').length || transports.length
      };
      
      // Set stats
      setStats({
        roomBookings: roomStats,
        transportBookings: transportStats,
        rooms: roomsStats,
        transports: transportsStats
      });
      
      // Get rooms with proper mapping to match model
      const mappedRooms = rooms.map(room => ({
        id: room.room_id || room.id,
        name: room.room_name || room.name,
        type: room.room_type || room.type,
        capacity: room.capacity,
        facilities: room.facilities ? (typeof room.facilities === 'string' ? room.facilities.split(',').map(f => f.trim()) : room.facilities) : [],
        image: room.image || null,
        status: room.status || 'available'
      }));
      
      // Get transports with proper mapping to match model
      const mappedTransports = transports.map(transport => ({
        id: transport.transport_id || transport.id,
        name: transport.vehicle_name || transport.name,
        driver: transport.driver_name || transport.driver,
        capacity: transport.capacity,
        image: transport.image || null,
        status: transport.status || 'available'
      }));
      
      // Get today's date for filtering today's bookings
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get recent room bookings (sort by date and take latest 5)
      const todayRoomBookings = roomBookings.filter(booking => 
        booking.booking_date && booking.booking_date.includes(todayStr)
      );
      
      // Upcoming room bookings (future dates only)
      const upcomingRoomBookings = roomBookings.filter(booking => {
        if (!booking.booking_date) return false;
        const bookingDate = new Date(booking.booking_date);
        return bookingDate > today;
      });
      
      const sortedRoomBookings = [...roomBookings].sort((a, b) => {
        return new Date(b.booking_date || 0) - new Date(a.booking_date || 0);
      });
      
      // Map room booking data to include room details
      const enhancedRoomBookings = sortedRoomBookings.slice(0, 5).map(booking => {
        const roomInfo = mappedRooms.find(r => r.id == (booking.room_id || booking.room?.id));
        return {
          ...booking,
          room_details: roomInfo || null
        };
      });
      
      setRecentRoomBookings(enhancedRoomBookings);
      
      // Get recent transport bookings (sort by date and take latest 5)
      const todayTransportBookings = transportBookings.filter(booking => 
        booking.booking_date && booking.booking_date.includes(todayStr)
      );
      
      // Upcoming transport bookings (future dates only)
      const upcomingTransportBookings = transportBookings.filter(booking => {
        if (!booking.booking_date) return false;
        const bookingDate = new Date(booking.booking_date);
        return bookingDate > today;
      });
      
      const sortedTransportBookings = [...transportBookings].sort((a, b) => {
        return new Date(b.booking_date || 0) - new Date(a.booking_date || 0);
      });
      
      // Map transport booking data to include transport details
      const enhancedTransportBookings = sortedTransportBookings.slice(0, 5).map(booking => {
        const transportInfo = mappedTransports.find(t => t.id == (booking.transport_id || booking.transport?.id));
        return {
          ...booking,
          transport_details: transportInfo || null
        };
      });
      
      setRecentTransportBookings(enhancedTransportBookings);
      
      // Get available rooms
      const availableRoomsList = mappedRooms.filter(room => 
        room.status?.toLowerCase() === 'available' || !room.status
      );
      setAvailableRooms(availableRoomsList.slice(0, 5));
      
      // Get available transports
      const availableTransportsList = mappedTransports.filter(transport => 
        transport.status?.toLowerCase() === 'available' || !transport.status
      );
      setAvailableTransports(availableTransportsList.slice(0, 5));
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      
      // Check for unauthorized error
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        setError("Session expired. Please sign in again.");
      } else {
        setError(
          err.response?.data?.message || 
          "Unable to load dashboard information. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate approval rate
  const calculateApprovalRate = (data) => {
    if (data.total === 0) return 0;
    return ((data.approved / data.total) * 100).toFixed(1);
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-gray-800 animate-spin"></div>
          <div className="mt-4 text-gray-800 font-medium text-center">Loading Dashboard</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Dashboard Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => fetchDashboardData()}
              className="px-6 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center mx-auto"
            >
              <Activity size={16} className="mr-2" />
              Refresh Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Resource Booking Dashboard</h1>
          <p className="text-gray-500">Monitor and manage all booking activities</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="mb-6">
          <div className="inline-flex bg-white rounded-md shadow-sm border border-gray-200">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeRange === 'week' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeRange === 'year' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Resources */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <Layers size={20} className="text-gray-800" />
              </div>
              <div className="text-xs font-medium text-gray-500">
                {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Resources</h3>
            <div className="text-2xl font-bold text-gray-800">{stats.rooms.total + stats.transports.total}</div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <div className="w-1 h-1 rounded-full bg-gray-400 mr-1"></div>
              <span>Rooms: {stats.rooms.total}</span>
              <div className="w-1 h-1 rounded-full bg-gray-400 ml-2 mr-1"></div>
              <span>Vehicles: {stats.transports.total}</span>
            </div>
          </div>
          
          {/* Total Bookings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <CalendarDays size={20} className="text-gray-800" />
              </div>
              <div className="text-xs font-medium text-gray-500">
                {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h3>
            <div className="text-2xl font-bold text-gray-800">{stats.roomBookings.total + stats.transportBookings.total}</div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <div className="w-1 h-1 rounded-full bg-gray-400 mr-1"></div>
              <span>Rooms: {stats.roomBookings.total}</span>
              <div className="w-1 h-1 rounded-full bg-gray-400 ml-2 mr-1"></div>
              <span>Transports: {stats.transportBookings.total}</span>
            </div>
          </div>
          
          {/* Pending Requests */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <Clock size={20} className="text-gray-800" />
              </div>
              <div className="text-xs font-medium text-gray-500">Requires Action</div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Requests</h3>
            <div className="text-2xl font-bold text-gray-800">{stats.roomBookings.pending + stats.transportBookings.pending}</div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <div className="w-1 h-1 rounded-full bg-gray-400 mr-1"></div>
              <span>Rooms: {stats.roomBookings.pending}</span>
              <div className="w-1 h-1 rounded-full bg-gray-400 ml-2 mr-1"></div>
              <span>Transports: {stats.transportBookings.pending}</span>
            </div>
          </div>
          
          {/* Available Resources */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-md">
                <CheckCircle size={20} className="text-gray-800" />
              </div>
              <div className="text-xs font-medium text-gray-500">Ready for Booking</div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Available Resources</h3>
            <div className="text-2xl font-bold text-gray-800">{stats.rooms.available + stats.transports.available}</div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <div className="w-1 h-1 rounded-full bg-gray-400 mr-1"></div>
              <span>Rooms: {stats.rooms.available}</span>
              <div className="w-1 h-1 rounded-full bg-gray-400 ml-2 mr-1"></div>
              <span>Transports: {stats.transports.available}</span>
            </div>
          </div>
        </div>
        
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Room Bookings Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800 flex items-center">
                <Building size={18} className="mr-2 text-gray-500" />
                Room Bookings Status
              </h3>
              <div className="text-sm text-gray-500">{stats.roomBookings.total} Total</div>
            </div>
            <div className="space-y-4">
              {/* Pending */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-gray-800 font-medium">{stats.roomBookings.pending}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${(stats.roomBookings.pending / stats.roomBookings.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Approved */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Approved</span>
                  <span className="text-gray-800 font-medium">{stats.roomBookings.approved}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.roomBookings.approved / stats.roomBookings.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Rejected */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Rejected</span>
                  <span className="text-gray-800 font-medium">{stats.roomBookings.rejected}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.roomBookings.rejected / stats.roomBookings.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transport Bookings Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800 flex items-center">
                <Car size={18} className="mr-2 text-gray-500" />
                Transport Bookings Status
              </h3>
              <div className="text-sm text-gray-500">{stats.transportBookings.total} Total</div>
            </div>
            <div className="space-y-4">
              {/* Pending */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-gray-800 font-medium">{stats.transportBookings.pending}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${(stats.transportBookings.pending / stats.transportBookings.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Approved */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Approved</span>
                  <span className="text-gray-800 font-medium">{stats.transportBookings.approved}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.transportBookings.approved / stats.transportBookings.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Rejected */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Rejected</span>
                  <span className="text-gray-800 font-medium">{stats.transportBookings.rejected}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.transportBookings.rejected / stats.transportBookings.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Room Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Building size={18} className="mr-2 text-gray-500" />
                  Recent Room Bookings
                </h3>
                <a href="/list/room-bookings" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  View All
                </a>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRoomBookings.map((booking) => {
                      const statusStyle = getStatusStyle(booking.status);
                      return (
                        <tr key={booking.booking_id || booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">
                              {booking.room_details?.name || `Room #${booking.room_id || booking.room?.id || 'N/A'}`}
                            </div>
                            {booking.room_details?.type && (
                              <div className="text-xs text-gray-500">
                                {booking.room_details.type}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800">{formatDate(booking.booking_date)}</div>
                            <div className="text-xs text-gray-500">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">{booking.pic || "N/A"}</div>
                            <div className="text-xs text-gray-500">{booking.section || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              {statusStyle.icon}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Transport Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Car size={18} className="mr-2 text-gray-500" />
                  Recent Transport Bookings
                </h3>
                <a href="/list/transport-bookings" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  View All
                </a>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransportBookings.map((booking) => {
                      const statusStyle = getStatusStyle(booking.status);
                      return (
                        <tr key={booking.booking_id || booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">
                              {booking.transport_details?.name || `Vehicle #${booking.transport_id || booking.transport?.id || 'N/A'}`}
                            </div>
                            {booking.transport_details?.driver && (
                              <div className="text-xs text-gray-500">
                                Driver: {booking.transport_details.driver}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800">{formatDate(booking.booking_date)}</div>
                            <div className="text-xs text-gray-500">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800">{booking.destination || "Not specified"}</div>
                            <div className="text-xs text-gray-500">{booking.section || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              {statusStyle.icon}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Rooms */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Building size={18} className="mr-2 text-gray-500" />
                  Available Rooms
                </h3>
                <a href="/list/rooms" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  View All
                </a>
              </div>
              <div className="p-4">
                <ul className="divide-y divide-gray-200">
                  {availableRooms.map(room => (
                    <li key={room.id} className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{room.name || `Room ${room.id}`}</p>
                          {room.type && (
                            <p className="text-xs text-gray-500">{room.type}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Users size={12} className="mr-1" />
                          {room.capacity || 'N/A'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Available Transport */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Car size={18} className="mr-2 text-gray-500" />
                  Available Transport
                </h3>
                <a href="/list/transports" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  View All
                </a>
              </div>
              <div className="p-4">
                <ul className="divide-y divide-gray-200">
                  {availableTransports.map(transport => (
                    <li key={transport.id} className="py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{transport.name || `Vehicle ${transport.id}`}</p>
                          {transport.driver && (
                            <p className="text-xs text-gray-500">Driver: {transport.driver}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Users size={12} className="mr-1" />
                          {transport.capacity || 'N/A'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Today's Date */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-500 mr-2" />
                  <h3 className="font-medium text-gray-800">Today</h3>
                </div>
                <p className="text-gray-600 mt-2">
                  {new Date().toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;