import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TextInput, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import { router } from "expo-router";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

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

        // Fetch images for rooms
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

        // Fetch images for vehicles
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
          // Create a map of room id to image URL
          roomImagesData.forEach((item: any) => {
            roomImages[item.room_id] = item.image_url;
          });
        }

        if (vehicleImagesResponse.ok) {
          const vehicleImagesData = await vehicleImagesResponse.json();
          // Create a map of vehicle id to image URL
          vehicleImagesData.forEach((item: any) => {
            vehicleImages[item.vehicle_id] = item.image_url;
          });
        }

        const mappedRoomBookings = roomData
          .filter((item: any) => item.user_id === userId) // Filter bookings by user_id
          .map((item: any) => {
            // Format the booking date (booking_date)
            const bookingDate = new Date(item.booking_date);
            const formattedBookingDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('default', { month: 'short' })} ${bookingDate.getFullYear()}`;

            // Ensure start_time and end_time are valid (if any)
            const start_time = item.start_time ? new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
            const end_time = item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";

            const imageUrl = roomImages[item.room_id] || defaultRoomImageUrl;

            return {
              id: item.booking_id.toString(),
              type: "ROOM",
              title: item.description || "Meeting Room", // Default to "Meeting Room" if description is missing
              date: formattedBookingDate, // Use formatted date directly here
              start_time: start_time,
              end_time: end_time,
              section: item.section || "Office section", // Default to "Office section" if section is missing
              isOngoing: false,
              approval: {
                status: item.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
                approverName: item.pic,
                approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
                feedback: item.notes || undefined,  // Use notes if available, else undefined
              },
              imageUrl: imageUrl,
            };
          });

        const mappedTransportBookings = transportData
          .filter((item: any) => item.user_id === userId) // Filter bookings by user_id
          .map((item: any) => {
            // Format the booking date (booking_date)
            const bookingDate = new Date(item.booking_date);
            const formattedBookingDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('default', { month: 'short' })} ${bookingDate.getFullYear()}`;

            // Ensure start_time and end_time are valid (if any)
            const start_time = item.start_time ? new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
            const end_time = item.end_time ? new Date(`1970-01-01T${item.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";

            const imageUrl = vehicleImages[item.vehicle_id] || defaultTransportImageUrl;

            return {
              id: item.booking_id.toString(),
              type: "TRANSPORT",
              title: item.description || "Transport Service", // Default to "Transport Service" if description is missing
              date: formattedBookingDate, // Use formatted date directly here
              start_time: start_time,
              end_time: end_time,
              section: item.section || "Transport section", // Default to "Transport section" if section is missing
              isOngoing: false,
              approval: {
                status: item.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
                approverName: item.pic,
                approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
                feedback: item.notes || undefined,  // Use notes if available, else undefined
              },
              vehicleName: item.vehicle_name || "No vehicle name", // Default if vehicle name is missing
              driverName: item.driver_name || "No driver name", // Default if driver name is missing
              capacity: item.capacity || "Not specified", // Default if capacity is missing
              imageUrl: imageUrl,
            };
          });

        const allBookings = [...mappedRoomBookings, ...mappedTransportBookings];

        // Sort by date (most recent first)
        allBookings.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

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

  // Filter bookings based on searchQuery and activeTab
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.section.toLowerCase().includes(searchQuery.toLowerCase());

    // For demo purposes:
    // - BOOKED tab shows APPROVED and PENDING bookings
    // - HISTORY tab shows REJECTED bookings
    const matchesTab =
      activeTab === "BOOKED"
        ? (booking.approval.status === "APPROVED" || booking.approval.status === "PENDING")
        : booking.approval.status === "REJECTED";

    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "#10B981"; // Green
      case "PENDING": return "#F59E0B";  // Yellow
      case "REJECTED": return "#EF4444"; // Red
      default: return "#9CA3AF";         // Gray
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

    const statusColor = getStatusColor(booking.approval.status);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl mb-4 shadow overflow-hidden"
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
                <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                  {booking.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Image
                    source={icons.tag}
                    className="w-3 h-3 mr-1"
                    tintColor="#9CA3AF"
                  />
                  <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {booking.section}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                <Image
                  source={icons.star}
                  className="w-3 h-3 mr-1"
                  tintColor="#FFD700"
                />
                <Text className="text-xs font-medium">N/A</Text>
              </View>
            </View>
            <View className="mt-1 flex-row items-center">
              <View
                style={{ backgroundColor: statusColor }}
                className="w-2 h-2 rounded-full mr-1"
              />
              <Text className="text-xs font-medium" style={{ color: statusColor }}>
                {booking.approval.status}
              </Text>
            </View>
            <View className="mt-2 space-y-1">
              <View className="flex-row items-center">
                <Image
                  source={icons.calendar}
                  className="w-3 h-3 mr-1"
                  tintColor="#6B7280"
                />
                <Text className="text-xs text-gray-700">{booking.date}</Text>
              </View>
              <View className="flex-row items-center">
                <Image
                  source={icons.user}
                  className="w-3 h-3 mr-1"
                  tintColor="#6B7280"
                />
                <Text className="text-xs text-gray-700">{booking.start_time} - {booking.end_time}</Text>
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
    <SafeAreaView className="bg-gray-100 flex-1 py-6 pb-20">
      <View className="bg-white">
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text className="text-2xl font-bold text-gray-800">My Booking</Text>
          <TouchableOpacity className="p-2">
            <Image source={icons.list} className="w-6 h-6" tintColor="#4B5563" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center space-x-2 mx-4 mb-4">
          <View className="flex-1 bg-white border border-blue-100 shadow-sm flex-row items-center px-3 py-1.5 rounded-xl">
            <Image
              source={icons.search}
              className="w-5 h-5 mr-2"
              tintColor="#9CA3AF"
            />
            <TextInput
              placeholder="Search bookings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-base"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Image
                  source={icons.close}
                  className="w-5 h-5"
                  tintColor="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity className="bg-blue-700 p-2.5 rounded-lg">
            <Image source={icons.filter} className="w-5 h-5" tintColor="#FFFFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="flex-row mx-4 mb-4 p-1 bg-white rounded-full border border-blue-100 shadow-sm">
          <TouchableOpacity
            onPress={() => setActiveTab("BOOKED")}
            className={`flex-1 py-2.5 px-5 rounded-full ${
              activeTab === "BOOKED" ? "bg-blue-700 shadow" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm text-center font-medium ${
                activeTab === "BOOKED" ? "text-white" : "text-gray-400"
              }`}
            >
              Active Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("HISTORY")}
            className={`flex-1 py-2.5 px-5 rounded-full ${
              activeTab === "HISTORY" ? "bg-blue-700 shadow" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm text-center font-medium ${
                activeTab === "HISTORY" ? "text-white" : "text-gray-400"
              }`}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView className="px-4 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#0000ff" />
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