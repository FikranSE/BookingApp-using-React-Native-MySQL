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

type RoomBooking = {
  booking_id: number;
  user_id: number;
  room_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  pic: string;
  section: string;
  description?: string;
  status: string; // 'pending', 'approved', 'rejected'
  notes?: string;
  approver_id?: number;
  approved_at?: string;
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
    header: "Booking Date",
    accessor: "booking_date",
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
    header: "Status",
    accessor: "status",
    className: "hidden lg:table-cell",
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

  // Create axios instance with interceptors for authentication
  const setupAxiosAuth = () => {
    // Get token from localStorage
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      // If no token found, redirect to login page
      router.push("/sign-in");
      return false;
    }
    
    // Set default authorization header for all requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // Add response interceptor to handle 401 Unauthorized errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If we get a 401 response, token might be expired
          localStorage.removeItem("adminToken");
          router.push("/login");
        }
        return Promise.reject(error);
      }
    );
    
    return true;
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchRoomBookings = async () => {
      setLoading(true);
      setError(null);
      
      // Setup authentication
      const isAuth = setupAxiosAuth();
      if (!isAuth) return;
      
      try {
        const response = await axios.get(
          "https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings"
        );
        setRoomBookings(response.data);
      } catch (error: any) {
        console.error("Error fetching room bookings:", error);
        // Display user-friendly error message
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

  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const renderRow = (item: RoomBooking) => (
    <tr
      key={item.booking_id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">Room {item.room_id}</h3>
          <p className="text-xs text-gray-500">
            {formatDate(item.booking_date)} • {formatTime(item.start_time)}
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.room_id}</td>
      <td className="hidden md:table-cell">{formatDate(item.booking_date)}</td>
      <td className="hidden md:table-cell">{formatTime(item.start_time)}</td>
      <td className="hidden md:table-cell">{formatTime(item.end_time)}</td>
      <td className="hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/room-bookings/${item.booking_id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <FormModal table="room-booking" type="delete" id={item.booking_id} />
        </div>
      </td>
    </tr>
  );

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading room bookings...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
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
      {/* LIST */}
      {roomBookings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No room bookings found.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Refresh
          </button>
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={roomBookings} />
      )}
      {/* PAGINATION */}
      {roomBookings.length > 0 && <Pagination />}
    </div>
  );
};

export default RoomBookingListPage;