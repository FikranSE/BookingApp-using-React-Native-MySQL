"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import BookingStatusFilter from "@/components/BookingStatusFilter";
import DateRangeFilter from "@/components/DateRangeFilter";
import BookingSortDropdown from "@/components/BookingSortDropdown";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, Trash2, CalendarDays, BedDouble, 
  Filter as FilterIcon, X, Clock, CheckCircle, XCircle, Building 
} from "lucide-react";

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

type SortDirection = 'asc' | 'desc';

type DateFilter = {
  startDate: string | null;
  endDate: string | null;
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

  // New state for search, filter, and sort
  const [searchText, setSearchText] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ startDate: null, endDate: null });
  const [sorting, setSorting] = useState<{ field: string; direction: SortDirection } | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<RoomBooking[]>([]);

  // Sort options
  const sortOptions = [
    { id: "booking_id", label: "Booking ID" },
    { id: "booking_date", label: "Booking Date" },
    { id: "agenda", label: "Agenda" },
    { id: "start_time", label: "Start Time" },
    { id: "status", label: "Status" }
  ];

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

  // Add this function after the createApiClient function
  const checkAndUpdateExpiredBookings = (bookings: RoomBooking[]) => {
    const now = new Date();
    const updatedBookings = bookings.map(booking => {
      const bookingDate = new Date(booking.booking_date);
      const [startHours, startMinutes] = booking.start_time.split(':').map(Number);
      const [endHours, endMinutes] = booking.end_time.split(':').map(Number);
      
      bookingDate.setHours(startHours, startMinutes, 0);
      const endDateTime = new Date(bookingDate);
      endDateTime.setHours(endHours, endMinutes, 0);
      
      if (booking.status.toLowerCase() === 'pending' && endDateTime < now) {
        return { ...booking, status: 'expired' };
      }
      return booking;
    });
    
    return updatedBookings;
  };

  // Apply search, filters, and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [roomBookings, searchText, statusFilters, dateFilter, sorting]);

  // Fetch data on component mount
  useEffect(() => {
    fetchRoomBookings();
  }, []);

  // Apply all filters and sorting
  const applyFiltersAndSort = () => {
    let result = [...roomBookings];
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(booking => 
        booking.booking_id.toString().includes(searchLower) ||
        booking.agenda.toLowerCase().includes(searchLower) ||
        booking.pic.toLowerCase().includes(searchLower) ||
        booking.section.toLowerCase().includes(searchLower) ||
        booking.room_id.toString().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilters.length > 0) {
      result = result.filter(booking => 
        statusFilters.includes(booking.status.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        
        if (dateFilter.startDate && dateFilter.endDate) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          return bookingDate >= startDate && bookingDate <= endDate;
        } else if (dateFilter.startDate) {
          const startDate = new Date(dateFilter.startDate);
          return bookingDate >= startDate;
        } else if (dateFilter.endDate) {
          const endDate = new Date(dateFilter.endDate);
          return bookingDate <= endDate;
        }
        
        return true;
      });
    }
    
    // Apply sorting
    if (sorting) {
      result.sort((a, b) => {
        let valueA = a[sorting.field];
        let valueB = b[sorting.field];
        
        // Special handling for dates and times
        if (sorting.field === 'booking_date') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        } else if (sorting.field === 'start_time' || sorting.field === 'end_time') {
          valueA = valueA.replace(':', '');
          valueB = valueB.replace(':', '');
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) return sorting.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sorting.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredBookings(result);
  };

  // Modify the fetchRoomBookings function
  const fetchRoomBookings = async () => {
    setLoading(true);
    setError(null);
    
    const apiClient = createApiClient();
    if (!apiClient) return;
    
    try {
      console.log("Fetching room bookings...");
      const response = await apiClient.get("/room-bookings");
      console.log("Room bookings fetched successfully:", response.data);
      
      // Check and update expired bookings
      const updatedBookings = checkAndUpdateExpiredBookings(response.data);
      setRoomBookings(updatedBookings);
      setAuthStatus("Authenticated and data loaded");
    } catch (error: any) {
      console.error("Error fetching room bookings:", error);
      
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

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle status filter changes
  const handleStatusChange = (selected: string[]) => {
    setStatusFilters(selected);
  };

  // Handle date filter changes
  const handleDateChange = (dates: DateFilter) => {
    setDateFilter(dates);
  };

  // Handle sorting changes
  const handleSort = (field: string, direction: SortDirection) => {
    setSorting({ field, direction });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchText("");
    setStatusFilters([]);
    setDateFilter({ startDate: null, endDate: null });
    setSorting(null);
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  // Update the getStatusColor function to include expired status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update the getStatusIcon function to include expired status
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle size={14} className="mr-1 text-green-500" />;
      case 'rejected':
        return <XCircle size={14} className="mr-1 text-red-500" />;
      case 'pending':
        return <Clock size={14} className="mr-1 text-yellow-500" />;
      case 'expired':
        return <Clock size={14} className="mr-1 text-gray-500" />;
      default:
        return null;
    }
  };

  // Calculate active filters count
  const activeFilterCount = (statusFilters.length > 0 ? 1 : 0) + 
                           ((dateFilter.startDate || dateFilter.endDate) ? 1 : 0);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-sky-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold text-sky-800 flex items-center">
              <Building size={20} className="mr-2 text-sky-500" />
              Room Bookings
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <TableSearch 
                value={searchText} 
                onSearch={handleSearch} 
                placeholder="Search bookings..."
              />
              <div className="flex items-center gap-4 self-end">
                <div className="flex flex-wrap gap-2">
                  <BookingStatusFilter
                    selectedStatuses={statusFilters}
                    onStatusChange={handleStatusChange}
                  />
                  <DateRangeFilter
                    dateFilter={dateFilter}
                    onDateChange={handleDateChange}
                  />
                  <BookingSortDropdown
                    options={sortOptions}
                    currentSort={sorting}
                    onSort={handleSort}
                  />
                </div>
                <FormModal table="room-booking" type="create" />
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {statusFilters.length > 0 && (
                  <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <span>Status: {statusFilters.length} selected</span>
                    <button 
                      onClick={() => setStatusFilters([])} 
                      className="ml-1 text-sky-500 hover:text-sky-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <span>
                      Date: {dateFilter.startDate ? formatDate(dateFilter.startDate) : '...'}
                      {dateFilter.endDate ? ` - ${formatDate(dateFilter.endDate)}` : ''}
                    </span>
                    <button 
                      onClick={() => setDateFilter({ startDate: null, endDate: null })} 
                      className="ml-1 text-sky-500 hover:text-sky-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <button 
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mb-4"></div>
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
          <div className="bg-white rounded-lg shadow-sm border border-sky-100 p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-sky-50 rounded-xl flex items-center justify-center">
                <CalendarDays size={32} className="text-sky-300" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-sky-800">No Room Bookings Found</h3>
            <p className="text-gray-500 mb-6">No room bookings have been created yet.</p>
            <FormModal table="room-booking" type="create" />
          </div>
        )}

        {/* No Results After Filtering */}
        {!loading && !error && roomBookings.length > 0 && filteredBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-sky-100 p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-sky-50 rounded-xl flex items-center justify-center">
                <FilterIcon size={32} className="text-sky-300" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-sky-800">No Matching Bookings</h3>
            <p className="text-gray-500 mb-6">No room bookings match your current search or filters.</p>
            <button 
              onClick={clearAllFilters}
              className="px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors flex items-center mx-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Data table */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-sky-100 overflow-hidden">
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2">
                Showing {filteredBookings.length} of {roomBookings.length} room bookings
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-sky-100">
                  <thead className="bg-sky-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">PIC</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">Agenda</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">Start Time</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">End Time</th>
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">Room ID</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-sky-100">
                    {filteredBookings.map((item) => (
                      <tr key={item.booking_id} className="hover:bg-sky-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sky-800">#{item.booking_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-sky-800">{item.pic}</div>
                          <div className="text-xs text-gray-500">{item.section}</div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-sky-800">{item.agenda}</td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-sky-800">{formatTime(item.start_time)}</td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-sky-800">{formatTime(item.end_time)}</td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-sky-800">{item.room_id}</td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/list/room-bookings/${item.booking_id}`}>
                              <button className="w-7 h-7 flex items-center justify-center text-white rounded-full bg-sky-500 hover:bg-sky-600 transition-colors">
                                <Eye size={14} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => {
                                setBookingToDelete(item.booking_id);
                                setShowDeleteConfirm(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
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
                  Are you sure you want to delete this room booking? This action cannot be undone and all associated data will be permanently removed.
                </p>
                
                {bookingToDelete && 
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                        <Building size={24} className="text-sky-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-sky-800">
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
    </div>
  );
};

export default RoomBookingListPage;