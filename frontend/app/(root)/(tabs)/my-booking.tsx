import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TextInput, SafeAreaView, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { LinearGradient } from 'expo-linear-gradient';

interface IApprovalStatus {
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  feedback?: string;
  approverName?: string;
  approvedAt?: string;
}

interface IBooking {
  id: string;
  type: "ROOM" | "TRANSPORT";
  agenda: string;
  date: string;
  start_time: string;
  end_time: string;
  section: string;
  isOngoing: boolean;
  approval: IApprovalStatus;
  vehicleName?: string;
  driverName?: string;
  capacity?: string;
  imageUrl?: string;
  rawDate?: Date;
}

interface FilterOptions {
  type: "ALL" | "ROOM" | "TRANSPORT";
  timeframe: "ALL" | "RECENT" | "PASSED";
  status: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
}
 
const MyBooking = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"BOOKED" | "HISTORY">("BOOKED");
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: "ALL",
    timeframe: "ALL",
    status: "ALL",
  });

  // Default image URLs in case API doesn't provide them
  const defaultRoomImageUrl = "https://images.unsplash.com/photo-1606744824163-985d376605aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80";
  const defaultTransportImageUrl = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80";

  // Utility function to process image URLs
  const processImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return defaultRoomImageUrl;
    
    // Handle local filesystem paths
    if (imageUrl.startsWith('E:') || imageUrl.startsWith('C:')) {
      return `https://j9d3hc82-3001.asse.devtunnels.ms/api/image-proxy?path=${encodeURIComponent(imageUrl)}`;
    }
    
    // Fix double slash issue
    if (imageUrl.includes('//uploads')) {
      imageUrl = imageUrl.replace('//uploads', '/uploads');
    }
    
    // Add base URL for relative paths
    if (!imageUrl.startsWith('http')) {
      const cleanPath = imageUrl.replace(/^\/+/, '');
      return `https://j9d3hc82-3001.asse.devtunnels.ms/${cleanPath}`;
    }
    
    return imageUrl;
  };

  // Function to determine if a booking is expired
  const getBookingStatus = (status: string, bookingDate: Date, endTime: string) => {
    // If status is already CANCELLED, preserve it
    if (status.toUpperCase() === "CANCELLED") {
      return "CANCELLED";
    }
    
    // If status is not PENDING, return it as is
    if (status.toUpperCase() !== "PENDING") {
      return status.toUpperCase();
    }
    
    // For PENDING status, check if it's expired
    const now = new Date();
    const bookingDateTime = new Date(bookingDate);
    
    // Parse end time
    const endTimeParts = endTime.split(':');
    if (endTimeParts.length >= 2) {
      bookingDateTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]));
    }
    
    // If the booking end time is in the past and status is PENDING, mark as EXPIRED
    return bookingDateTime < now ? "EXPIRED" : "PENDING";
  };

  // Function to fetch images for rooms and transports
  const fetchImagesForBookings = async (authToken: string) => {
    try {
      // Fetch room images
      const roomImagesResponse = await fetch(
        "https://j9d3hc82-3001.asse.devtunnels.ms/api/room-images",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch vehicle images
      const vehicleImagesResponse = await fetch(
        "https://j9d3hc82-3001.asse.devtunnels.ms/api/vehicle-images",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let roomImages = {}; 
      let vehicleImages = {};

      if (roomImagesResponse.ok) {
        const roomImagesData = await roomImagesResponse.json();
        // Make sure we're mapping correctly according to database structure
        roomImagesData.forEach((item: any) => {
          roomImages[item.room_id] = processImageUrl(item.image_url);
        });
      }

      if (vehicleImagesResponse.ok) {
        const vehicleImagesData = await vehicleImagesResponse.json();
        // Make sure we're mapping correctly according to database structure
        vehicleImagesData.forEach((item: any) => { 
          vehicleImages[item.vehicle_id] = processImageUrl(item.image_url);
        });
      }

      return { roomImages, vehicleImages };
    } catch (error) {
      console.error("Error fetching images:", error);
      return { roomImages: {}, vehicleImages: {} };
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);

        if (!authToken) {
          Alert.alert("Error", "Not authenticated");
          router.push("/(auth)/sign-in");
          return;
        }

        const response = await fetch(
          "https://j9d3hc82-3001.asse.devtunnels.ms/api/auth/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const profileData = await response.json();
        setUserId(profileData.user.id); // Set the user ID
      } catch (error) {
        console.error("Error fetching user profile: ", error);
        Alert.alert("Error", "Failed to fetch user profile");
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
    
        if (!authToken) {
          Alert.alert("Error", "Not authenticated");
          router.push("/(auth)/sign-in");
          return;
        }
    
        // Fetch booking data directly
        const roomResponse = await fetch(
          "https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        const transportResponse = await fetch(
          "https://j9d3hc82-3001.asse.devtunnels.ms/api/transport-bookings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        // Fetch rooms and transports for image data
        const roomsResponse = await fetch(
          "https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        const transportsResponse = await fetch(
          "https://j9d3hc82-3001.asse.devtunnels.ms/api/transports",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        const roomData = await roomResponse.json();
        const transportData = await transportResponse.json();
        
        // Create image mappings from room and transport data
        let roomImages = {};
        let transportImages = {};
        
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          console.log("Rooms data fetched:", roomsData.length);
          
          roomsData.forEach((room: any) => {
            if (room.room_id && room.image) {
              roomImages[room.room_id] = processImageUrl(room.image);
              console.log(`Room ${room.room_id} image: ${room.image} → ${roomImages[room.room_id]}`);
            }
          });
        }
        
        if (transportsResponse.ok) {
          const transportsData = await transportsResponse.json();
          console.log("Transports data fetched:", transportsData.length);
          
          transportsData.forEach((transport: any) => {
            if (transport.transport_id && transport.image) {
              transportImages[transport.transport_id] = processImageUrl(transport.image);
              console.log(`Transport ${transport.transport_id} image: ${transport.image} → ${transportImages[transport.transport_id]}`);
            }
          });
        }
    
        if (!roomResponse.ok || !transportResponse.ok) {
          if (roomResponse.status === 401 || transportResponse.status === 401) {
            await tokenCache.removeToken(AUTH_TOKEN_KEY);
            router.push("/(auth)/sign-in");
            return;
          }
          throw new Error("Failed to fetch bookings");
        }
    
        // Process room bookings with images
        const mappedRoomBookings = roomData 
          .filter((item: any) => item.user_id === userId)
          .map((item: any) => {
            const bookingDate = new Date(item.booking_date);
            const formattedBookingDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('default', { month: 'short' })} ${bookingDate.getFullYear()}`;
            const start_time = item.start_time ? new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
            const end_time = item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
    
            // Try to get image directly from booking data first, then from room data
            let imageUrl;
            
            // Check if the item itself has an image_url
            if (item.image_url) {
              imageUrl = processImageUrl(item.image_url);
              console.log(`Room booking ${item.booking_id} has direct image: ${imageUrl}`);
            } 
            // Otherwise check if we have an image for this room_id in our mapping
            else if (roomImages[item.room_id]) {
              imageUrl = roomImages[item.room_id];
              console.log(`Room booking ${item.booking_id} using room_id ${item.room_id} image: ${imageUrl}`);
            } 
            // Finally fall back to default
            else {
              imageUrl = defaultRoomImageUrl;
              console.log(`Room booking ${item.booking_id} using default image`);
            }
            
            // Determine the status (check if expired for PENDING status)
            const status = getBookingStatus(
              item.status, 
              bookingDate, 
              item.end_time
            );
    
            return {
              id: item.booking_id.toString(),
              type: "ROOM",
              agenda: item.agenda || "Meeting Room",
              date: formattedBookingDate,
              start_time: start_time,
              end_time: end_time,
              section: item.section || "Office section",
              isOngoing: false,
              approval: {
                status: status as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED",
                approverName: item.pic,
                approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
                feedback: item.notes || undefined,
              },
              imageUrl: imageUrl,
              rawDate: bookingDate, // Store raw date for sorting and expired check
            };
          });
    
        // Process transport bookings with images
        const mappedTransportBookings = transportData
          .filter((item: any) => item.user_id === userId)
          .map((item: any) => {
            const bookingDate = new Date(item.booking_date);
            const formattedBookingDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('default', { month: 'short' })} ${bookingDate.getFullYear()}`;
            const start_time = item.start_time ? new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
            const end_time = item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
    
            // Try to get image directly from booking data first, then from transport data
            let imageUrl;
            
            // Check if the item itself has an image_url
            if (item.image_url) {
              imageUrl = processImageUrl(item.image_url);
              console.log(`Transport booking ${item.booking_id} has direct image: ${imageUrl}`);
            } 
            // Otherwise check if we have an image for this transport_id in our mapping
            else if (transportImages[item.transport_id]) {
              imageUrl = transportImages[item.transport_id];
              console.log(`Transport booking ${item.booking_id} using transport_id ${item.transport_id} image: ${imageUrl}`);
            } 
            // Finally fall back to default
            else {
              imageUrl = defaultTransportImageUrl;
              console.log(`Transport booking ${item.booking_id} using default image`);
            }
            
            // Determine the status (check if expired for PENDING status)
            const status = getBookingStatus(
              item.status, 
              bookingDate, 
              item.end_time
            );
    
            return {
              id: item.booking_id.toString(),
              type: "TRANSPORT",
              agenda: item.agenda || "Transport Service",
              date: formattedBookingDate,
              start_time: start_time,
              end_time: end_time,
              section: item.section || "Transport section",
              isOngoing: false,
              approval: {
                status: status as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED",
                approverName: item.pic,
                approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
                feedback: item.notes || undefined,
              },
              vehicleName: item.vehicle_name || "No vehicle name",
              driverName: item.driver_name || "No driver name",
              capacity: item.capacity || "Not specified",
              imageUrl: imageUrl,
              rawDate: bookingDate, // Store raw date for sorting and expired check
            };
          });
    
        const allBookings = [...mappedRoomBookings, ...mappedTransportBookings];
        allBookings.sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));
    
        setBookings(allBookings);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        Alert.alert("Error", "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const filteredBookings = bookings.filter((booking) => {
    // Text search filter
    const matchesSearch =
      booking.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.section.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter (active vs history)
    const matchesTab =
      activeTab === "BOOKED"
        ? (booking.approval.status === "APPROVED" || booking.approval.status === "PENDING")
        : (booking.approval.status === "REJECTED" || booking.approval.status === "EXPIRED" || booking.approval.status === "CANCELLED");

    // Type filter (room vs transport)
    const matchesType =
      filterOptions.type === "ALL" ||
      booking.type === filterOptions.type;

    // Status filter
    const matchesStatus =
      filterOptions.status === "ALL" ||
      booking.approval.status === filterOptions.status;

    // Timeframe filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDate = booking.rawDate;
    const isPassed = bookingDate && bookingDate < today;
    const isRecent = !isPassed;

    const matchesTimeframe =
      filterOptions.timeframe === "ALL" ||
      (filterOptions.timeframe === "RECENT" && isRecent) ||
      (filterOptions.timeframe === "PASSED" && isPassed);

    return matchesSearch && matchesTab && matchesType && matchesStatus && matchesTimeframe;
  });

  const getStatusColorAndBackground = (status: string) => {
    switch (status) {
      case "APPROVED": 
        return { 
          color: "#10B981", // Green text
          background: "rgba(16, 185, 129, 0.1)" // Light green background
        };
      case "PENDING": 
        return { 
          color: "#F59E0B", // Amber text
          background: "rgba(245, 158, 11, 0.1)" // Light amber background
        };
      case "REJECTED": 
        return { 
          color: "#EF4444", // Red text
          background: "rgba(239, 68, 68, 0.1)" // Light red background
        };
      case "EXPIRED": 
        return { 
          color: "#6B7280", // Gray text
          background: "rgba(107, 114, 128, 0.1)" // Light gray background
        };
      case "CANCELLED": 
        return { 
          color: "#7C3AED", // Purple text
          background: "rgba(124, 58, 237, 0.1)" // Light purple background
        };
      default: 
        return { 
          color: "#9CA3AF", // Gray text
          background: "#F3F4F6" // Light gray background
        };
    }
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilterOptions({
      type: "ALL",
      timeframe: "ALL",
      status: "ALL",
    });
  };

  // Apply filters and close modal
  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  // Filter option button component
  const FilterButton = ({ 
    agenda, 
    isActive, 
    onPress 
  }: { 
    agenda: string; 
    isActive: boolean; 
    onPress: () => void 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        isActive ? "bg-sky-500" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isActive ? "text-white" : "text-gray-600"
        }`}
      >
        {agenda}
      </Text>
    </TouchableOpacity>
  );

  

  // Filter Modal Component
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl px-4 pt-4 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Filter Bookings</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Filter by type */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-2">Booking Type</Text>
            <View className="flex-row flex-wrap">
              <FilterButton 
                agenda="All Types" 
                isActive={filterOptions.type === "ALL"} 
                onPress={() => setFilterOptions({...filterOptions, type: "ALL"})}
              />
              <FilterButton 
                agenda="Room" 
                isActive={filterOptions.type === "ROOM"} 
                onPress={() => setFilterOptions({...filterOptions, type: "ROOM"})}
              />
              <FilterButton 
                agenda="Transport" 
                isActive={filterOptions.type === "TRANSPORT"} 
                onPress={() => setFilterOptions({...filterOptions, type: "TRANSPORT"})}
              />
            </View>
          </View>

          {/* Filter by timeframe */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-2">Time Frame</Text>
            <View className="flex-row flex-wrap">
              <FilterButton 
                agenda="All Time" 
                isActive={filterOptions.timeframe === "ALL"} 
                onPress={() => setFilterOptions({...filterOptions, timeframe: "ALL"})}
              />
              <FilterButton 
                agenda="Recent/Upcoming" 
                isActive={filterOptions.timeframe === "RECENT"} 
                onPress={() => setFilterOptions({...filterOptions, timeframe: "RECENT"})}
              />
              <FilterButton 
                agenda="Passed" 
                isActive={filterOptions.timeframe === "PASSED"} 
                onPress={() => setFilterOptions({...filterOptions, timeframe: "PASSED"})}
              />
            </View>
          </View>

          {/* Filter by status */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">Status</Text>
            <View className="flex-row flex-wrap">
              <FilterButton 
                agenda="All Status" 
                isActive={filterOptions.status === "ALL"} 
                onPress={() => setFilterOptions({...filterOptions, status: "ALL"})}
              />
              <FilterButton 
                agenda="Pending" 
                isActive={filterOptions.status === "PENDING"} 
                onPress={() => setFilterOptions({...filterOptions, status: "PENDING"})}
              />
              <FilterButton 
                agenda="Approved" 
                isActive={filterOptions.status === "APPROVED"} 
                onPress={() => setFilterOptions({...filterOptions, status: "APPROVED"})}
              />
              <FilterButton 
                agenda="Rejected" 
                isActive={filterOptions.status === "REJECTED"} 
                onPress={() => setFilterOptions({...filterOptions, status: "REJECTED"})}
              />
              <FilterButton 
                agenda="Expired" 
                isActive={filterOptions.status === "EXPIRED"} 
                onPress={() => setFilterOptions({...filterOptions, status: "EXPIRED"})}
              />
              <FilterButton 
                agenda="Cancelled" 
                isActive={filterOptions.status === "CANCELLED"} 
                onPress={() => setFilterOptions({...filterOptions, status: "CANCELLED"})}
              />
            </View>
          </View>

          {/* Action buttons */}
          <View className="flex-row">
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-1 py-3 mr-2 border border-sky-500 rounded-xl"
            >
              <Text className="text-sky-500 font-semibold text-center">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={applyFilters}
              className="flex-1 py-3 ml-2 bg-sky-500 rounded-xl"
            >
              <Text className="text-white font-semibold text-center">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View> 
    </Modal>
  );

  const BookingCard = ({ booking }: { booking: IBooking }) => {
    const handlePress = () => {
      if (booking.type === "ROOM") {
        router.push(`/detail-bookingRoom?id=${booking.id}`);
      } else if (booking.type === "TRANSPORT") {
        router.push(`/detail-bookingTransport?id=${booking.id}`);
      }
    };
   
    const { color, background } = getStatusColorAndBackground(booking.approval.status);
    const defaultImage = booking.type === "ROOM" ? defaultRoomImageUrl : defaultTransportImageUrl;
  
    return (
      <TouchableOpacity
        className="bg-white mt-4 mx-4 rounded-2xl mb-4 overflow-hidden shadow-sm border border-sky-50"
        onPress={handlePress}
      >
        <View className="flex-row p-2">
          <Image
            source={{ uri: booking.imageUrl || defaultImage }}
            className="w-24 h-24 rounded-lg"
            resizeMode="cover"
            defaultSource={{ uri: defaultImage }}
            onError={(e) => { 
              console.log(`Image load error for ${booking.id}, type: ${booking.type}, URL: ${booking.imageUrl}`);
              console.log("Error details:", e.nativeEvent.error);
            }} 
          /> 
          <View className="flex-1 pl-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-[15px] font-bold text-gray-800" numberOfLines={1}>
                  {booking.agenda}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Text className="text-[13px] text-gray-500" numberOfLines={1}>
                    {booking.section}
                  </Text>
                </View>
              </View>
              <View 
                style={{ backgroundColor: background, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <Text style={{ color, fontSize: 12, fontWeight: '500' }}>
                  {booking.approval.status}
                </Text>
              </View>
            </View>
            <View className="mt-2 space-y-1">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={13} color="#0EA5E9" />
                <Text className="text-[10px] text-sky-500 font-medium ml-1.5">
                  {booking.date}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={13} color="#F97316" />
                <Text className="text-[10px] text-orange-500 font-medium ml-1.5">
                  {booking.start_time} - {booking.end_time}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons 
                  name={booking.type === "ROOM" ? "business" : "car"} 
                  size={13} 
                  color="#6366F1" 
                />
                <Text className="text-[10px] text-indigo-500 font-medium ml-1.5">
                  {booking.type}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Image
        source={icons.calendar}
        className="w-16 h-16 mb-4"
        tintColor="#D1D5DB"
      />
      <Text className="text-gray-400 text-base font-medium text-center">No bookings found</Text>
      <Text className="text-gray-400 text-sm text-center mt-1">
        Try changing your search or filters
      </Text>
    </View>
  );

  // Active filters indicator
  const hasActiveFilters = 
    filterOptions.type !== "ALL" || 
    filterOptions.timeframe !== "ALL" || 
    filterOptions.status !== "ALL";

  return (
    <SafeAreaView className="flex-1 pb-20 bg-white">
      {/* Filter Modal */}
      <FilterModal />
      
      {/* Header with LinearGradient */}
      <LinearGradient
        colors={['#0EA5E9', '#E0F2FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-44"
      />
      <View className="mb-4">
        <View className="flex-row items-center justify-start px-4 py-5 pt-8">
          <Text className="text-xl font-bold text-white">My Booking</Text>
        </View>

        {/* Search bar and filter button */}
        <View className="flex-row items-center space-x-2 mx-4 mb-4">
          <View className="flex-1 bg-white border border-sky-100 shadow-sm flex-row items-center px-3 py-0.5 rounded-xl">
            <Image
              source={icons.search}
              className="w-4 h-4 mr-2"
              tintColor="#9CA3AF"
            />
            <TextInput
              placeholder="Search bookings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Image
                  source={icons.close}
                  className="w-4 h-4"
                  tintColor="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            className={`p-1.5 rounded-lg ${hasActiveFilters ? 'bg-sky-500' : 'bg-white'}`}
            onPress={() => setFilterModalVisible(true)}
          >
            <Image 
              source={icons.filter} 
              className="w-5 h-5" 
              tintColor={hasActiveFilters ? '#ffffff' : '#0EA5E9'} 
            />
          </TouchableOpacity>
        </View>

        {/* Active filters indicators */}
        {hasActiveFilters && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mx-4 mb-3"
          >
            {filterOptions.type !== "ALL" && (
              <View className="bg-sky-100 rounded-full px-3 py-1 mr-2 flex-row items-center">
                <Text className="text-sky-700 text-xs">{filterOptions.type}</Text>
                <TouchableOpacity 
                  onPress={() => setFilterOptions({...filterOptions, type: "ALL"})}
                  className="ml-1"
                >
                  <Ionicons name="close-circle" size={16} color="#0284C7" />
                </TouchableOpacity>
              </View>
            )}
            {filterOptions.timeframe !== "ALL" && (
              <View className="bg-sky-100 rounded-full px-3 py-1 mr-2 flex-row items-center">
                <Text className="text-sky-700 text-xs">{filterOptions.timeframe}</Text>
                <TouchableOpacity 
                  onPress={() => setFilterOptions({...filterOptions, timeframe: "ALL"})}
                  className="ml-1"
                >
                  <Ionicons name="close-circle" size={16} color="#0284C7" />
                </TouchableOpacity>
              </View>
            )}
            {filterOptions.status !== "ALL" && (
              <View className="bg-sky-100 rounded-full px-3 py-1 mr-2 flex-row items-center">
                <Text className="text-sky-700 text-xs">{filterOptions.status}</Text>
                <TouchableOpacity 
                  onPress={() => setFilterOptions({...filterOptions, status: "ALL"})}
                  className="ml-1"
                >
                  <Ionicons name="close-circle" size={16} color="#0284C7" />
                </TouchableOpacity>
              </View>
            )}
            {hasActiveFilters && (
              <TouchableOpacity 
                onPress={resetFilters}
                className="bg-sky-100 rounded-full px-3 py-1"
              >
                <Text className="text-sky-700 text-xs">Clear All</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Tab buttons */}
        <View className="flex-row mx-12 bg-white border border-white rounded-full shadow-sm">
          <TouchableOpacity
            onPress={() => setActiveTab("BOOKED")}
            className={`flex-1 py-1.5 px-5 rounded-full ${
              activeTab === "BOOKED" ? "bg-sky-500" : "bg-white"
            }`}
          >
            <Text
              className={`text-sm text-center font-medium ${
                activeTab === "BOOKED" ? "text-white" : "text-gray-500"
              }`}
            >
              Active Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("HISTORY")}
            className={`flex-1 py-1.5 px-5 rounded-full ${
              activeTab === "HISTORY" ? "bg-sky-500" : "bg-white"
            }`}
          >
            <Text
              className={`text-sm text-center font-medium ${
                activeTab === "HISTORY" ? "text-white" : "text-gray-500"
              }`}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView>
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#0037FFFF" />
            <Text className="text-gray-500 mt-4">Loading your bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <EmptyState />
        )}
        
        {/* Add some space at the bottom */} 
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView> 
  );
}; 
 
export default MyBooking;