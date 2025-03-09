import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TextInput, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

interface IApprovalStatus {
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback?: string;
  approverName?: string;
  approvedAt?: string;
}

interface IBooking {
  id: string;
  type: "ROOM" | "TRANSPORT";
  title: string;
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
}

const MyBooking = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"BOOKED" | "HISTORY">("BOOKED");
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Default image URLs in case API doesn't provide them
  const defaultRoomImageUrl = "https://images.unsplash.com/photo-1606744824163-985d376605aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80";
  const defaultTransportImageUrl = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80";

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

        const roomData = await roomResponse.json();
        const transportData = await transportResponse.json();

        if (!roomResponse.ok || !transportResponse.ok) {
          if (roomResponse.status === 401 || transportResponse.status === 401) {
            await tokenCache.removeToken(AUTH_TOKEN_KEY);
            router.push("/(auth)/sign-in");
            return;
          }
          throw new Error("Failed to fetch bookings");
        }

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
          roomImagesData.forEach((item: any) => {
            roomImages[item.room_id] = item.image_url;
          });
        }

        if (vehicleImagesResponse.ok) {
          const vehicleImagesData = await vehicleImagesResponse.json();
          vehicleImagesData.forEach((item: any) => { 
            vehicleImages[item.vehicle_id] = item.image_url;
          });
        }

        const mappedRoomBookings = roomData
          .filter((item: any) => item.user_id === userId)
          .map((item: any) => {
            const bookingDate = new Date(item.booking_date);
            const formattedBookingDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('default', { month: 'short' })} ${bookingDate.getFullYear()}`;
            const start_time = item.start_time ? new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
            const end_time = item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";

            const imageUrl = roomImages[item.room_id] || defaultRoomImageUrl;

            return {
              id: item.booking_id.toString(),
              type: "ROOM",
              title: item.description || "Meeting Room",
              date: formattedBookingDate,
              start_time: start_time,
              end_time: end_time,
              section: item.section || "Office section",
              isOngoing: false,
              approval: {
                status: item.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
                approverName: item.pic,
                approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
                feedback: item.notes || undefined,
              },
              imageUrl: imageUrl,
            };
          });

        const mappedTransportBookings = transportData
          .filter((item: any) => item.user_id === userId)
          .map((item: any) => {
            const bookingDate = new Date(item.booking_date);
            const formattedBookingDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('default', { month: 'short' })} ${bookingDate.getFullYear()}`;
            const start_time = item.start_time ? new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
            const end_time = item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";

            const imageUrl = vehicleImages[item.vehicle_id] || defaultTransportImageUrl;

            return {
              id: item.booking_id.toString(),
              type: "TRANSPORT",
              title: item.description || "Transport Service",
              date: formattedBookingDate,
              start_time: start_time,
              end_time: end_time,
              section: item.section || "Transport section",
              isOngoing: false,
              approval: {
                status: item.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
                approverName: item.pic,
                approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
                feedback: item.notes || undefined,
              },
              vehicleName: item.vehicle_name || "No vehicle name",
              driverName: item.driver_name || "No driver name",
              capacity: item.capacity || "Not specified",
              imageUrl: imageUrl,
            };
          });

        const allBookings = [...mappedRoomBookings, ...mappedTransportBookings];
        allBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setBookings(allBookings);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        Alert.alert("Error", "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.section.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "BOOKED"
        ? (booking.approval.status === "APPROVED" || booking.approval.status === "PENDING")
        : booking.approval.status === "REJECTED";

    return matchesSearch && matchesTab;
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
      default: 
        return { 
          color: "#9CA3AF", // Gray text
          background: "#F3F4F6" // Light gray background
        };
    }
  };

  const BookingCard = ({ booking }: { booking: IBooking }) => {
    const handlePress = () => {
      if (booking.type === "ROOM") {
        router.push(`/detail-bookingRoom?id=${booking.id}`);
      } else if (booking.type === "TRANSPORT") {
        router.push(`/detail-bookingTransport?id=${booking.id}`);
      }
    };

    const { color, background } = getStatusColorAndBackground(booking.approval.status);

    return (
      <TouchableOpacity
      className="bg-white rounded-xl mt-4 mx-4 overflow-hidden shadow-sm"
      onPress={handlePress}
    >
      <View className="flex-row p-2">
        <Image
          source={{ uri: booking.imageUrl }}
          className="w-24 h-full rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 pl-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-[15px] font-bold text-gray-800" numberOfLines={1}>
                {booking.title}
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

  return (
    <SafeAreaView className="flex-1 pb-20 bg-sky-50">
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

        {/* Search bar */}
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
          <TouchableOpacity className="bg-white p-1.5 rounded-lg">
            <Image source={icons.filter} className="w-5 h-5" tintColor="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Tab buttons */}
        <View className="flex-row mx-12 bg-white border border-white rounded-full  shadow-sm">
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
