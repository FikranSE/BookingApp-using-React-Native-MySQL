"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, CalendarDays,BedDouble } from "lucide-react"; // Import necessary icons

type RoomBooking = {
  booking_id: number;
  user_id: number;
  room_id: number;
  booking_date: string;
  agenda: string;
  start_time: string;
  end_time: string;
  pic: string;
  section: string;
  description?: string;
  status: string;
  notes?: string;
  approver_id?: number;
  approved_at?: string;
};

// Updated columns to include status
const columns = [
  {
    header: "Booking ID",
    accessor: "booking_id",
  },
  {
    header: "PIC",
    accessor: "pic",
  },
  {
    header: "Agenda",
    accessor: "agenda",
    className: "hidden md:table-cell",
  },
  {
    header: "Start Time",
    accessor: "start_time",
    className: "hidden md:table-cell",
  },
  {
    header: "End Time",
    accessor: "end_time",
    className: "hidden lg:table-cell",
  },
  {
    header: "Room ID",
    accessor: "room_id",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const RoomBookingListPage = () => {
  const router = useRouter();
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
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
    const fetchRoomBookings = async () => {
      setLoading(true);
      setError(null);
      
      const apiClient = createApiClient();
      if (!apiClient) return;
      
      try {
        console.log("Fetching room bookings...");
        // Debug request headers
        const debugHeaders = apiClient.defaults.headers;
        console.log("Request headers:", debugHeaders);
        
        const response = await apiClient.get("/room-bookings");
        console.log("Room bookings fetched successfully:", response.data);
        setRoomBookings(response.data);
        setAuthStatus("Authenticated and data loaded");
      } catch (error: any) {
        console.error("Error fetching room bookings:", error);
        
        // Check for unauthorized error
        if (error.response?.status === 401) {
          setAuthStatus("Authentication failed (401) - token may be invalid");
          localStorage.removeItem("adminToken");
          router.push("/sign-in");
          return;
        }
        
        setError(
          error.response?.data?.message || 
          "Unable to load room bookings. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomBookings();
  }, [router]);

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle delete booking
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    setIsDeleting(true);
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      await apiClient.delete(`/room-bookings/${bookingToDelete}`);
      
      // Remove the deleted booking from state
      setRoomBookings(prevBookings => 
        prevBookings.filter(booking => booking.booking_id !== bookingToDelete)
      );
      
      // Close modal
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
      
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      setError(
        error.response?.data?.message || 
        "Unable to delete the room booking. Please try again later."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Get appropriate badge color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Modified renderRow to include status column with badges
  const renderRow = (item: RoomBooking) => (
    <tr
      key={item.booking_id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">#{item.booking_id}</td>
      <td className="p-4">{item.pic}</td>
      <td className="hidden md:table-cell p-4">{item.agenda}</td>
      <td className="hidden md:table-cell p-4">{formatTime(item.start_time)}</td>
      <td className="hidden lg:table-cell p-4">{formatTime(item.end_time)}</td>
      <td className="hidden lg:table-cell p-4">{item.room_id}</td>
      <td className="hidden md:table-cell p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Link href={`/list/room-bookings/${item.booking_id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {/* Replace FormModal with delete button */}
          <button 
            onClick={() => {
              setBookingToDelete(item.booking_id);
              setShowDeleteConfirm(true);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
          >
            <Trash2 size={16} className="text-red-600" />
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

      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Room Bookings</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormModal table="room-booking" type="create" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading room bookings...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && roomBookings.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No room bookings found.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && roomBookings.length > 0 && (
        <>
          <Table columns={columns} renderRow={renderRow} data={roomBookings} />
          <Pagination />
        </>
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
                Are you sure you want to delete this room booking? This action cannot be undone and all associated data will be permanently removed.
              </p>
              
                {/* Get booking details for the booking to be deleted */}
                {bookingToDelete && 
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                       <BedDouble size={24} className="text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        Room Booking #{bookingToDelete}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {roomBookings.find(booking => booking.booking_id === bookingToDelete)?.agenda || 'Unknown Booking'}
                      </p>
                    </div>
                  </div>
                </div>
              }
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBookingToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBooking}
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
                      Delete Booking
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

export default RoomBookingListPage;