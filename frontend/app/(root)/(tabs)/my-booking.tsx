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
  startTime: string;
  endTime: string;
  location: string;
  isOngoing: boolean;
  approval: IApprovalStatus;
  vehicleName?: string;  // Added for transport bookings
  driverName?: string;   // Added for transport bookings
  capacity?: string;     // Added for transport bookings
}

const MyBooking = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<"ALL" | "ROOM" | "TRANSPORT">("ALL");
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

        const mappedRoomBookings = roomData.map((item: any) => ({
          id: item.booking_id.toString(),
          type: "ROOM",
          title: item.description || "No title",
          date: item.booking_date,
          startTime: item.start_time,
          endTime: item.end_time,
          location: item.section,
          isOngoing: false,
          approval: {
            status: item.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
            approverName: item.pic,
            approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
            feedback: item.notes || undefined,
          },
        }));

        const mappedTransportBookings = transportData.map((item: any) => ({
          id: item.booking_id.toString(),
          type: "TRANSPORT",
          title: item.description || "No title",
          date: item.booking_date,
          startTime: item.start_time,
          endTime: item.end_time,
          location: item.section,
          isOngoing: false,
          approval: {
            status: item.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
            approverName: item.pic,
            approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
            feedback: item.notes || undefined,
          },
          vehicleName: item.vehicle_name,
          driverName: item.driver_name,
          capacity: item.capacity,
        }));

        setBookings([...mappedRoomBookings, ...mappedTransportBookings]);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        Alert.alert("Error", "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings based on selectedType and searchQuery
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "ALL" || booking.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
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

    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        onPress={handlePress}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
              {booking.title}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">{booking.location}</Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-medium text-blue-700">
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center flex-wrap">
          <View className="bg-gray-100 px-2 py-1 rounded-lg mr-2 mb-2">
            <Text className="text-xs text-gray-600">{booking.date}</Text>
          </View>
          <View
            className={`px-2 py-1 rounded-lg mr-2 mb-2 ${
              booking.type === "ROOM" ? "bg-purple-100" : "bg-green-100"
            }`}
          >
            <Text
              className={`text-xs ${
                booking.type === "ROOM" ? "text-purple-700" : "text-green-700"
              }`}
            >
              {booking.type === "ROOM" ? "Room" : "Transport"}
            </Text>
          </View>
          <View
            className={`px-2 py-1 rounded-lg mb-2 ${getStatusColor(booking.approval.status)}`}
          >
            <Text className={`text-xs ${getStatusColor(booking.approval.status)}`}>
              {booking.approval.status}
            </Text>
          </View>
        </View>
        {booking.type === "TRANSPORT" && booking.vehicleName && (
          <View className="mt-2">
            <Text className="text-xs text-gray-600">Vehicle: {booking.vehicleName}</Text>
            <Text className="text-xs text-gray-600">Driver: {booking.driverName}</Text>
            <Text className="text-xs text-gray-600">Capacity: {booking.capacity}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-slate-100 flex-1 pb-20">
      <View className="flex-row items-center justify-between px-4 py-3 bg-slate-100 mt-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">My Bookings</Text>
        <View className="w-6" />
      </View>

      {/* Search Bar */}
      <View className="mt-4 flex-row items-center space-x-2 mx-4">
        <View className="flex-1 bg-white border border-blue-200 rounded-xl flex-row items-center px-3 py-2">
          <Image
            source={icons.search}
            className="w-5 h-5 mr-2"
            tintColor="#64748b"
          />
          <TextInput
            placeholder="Search bookings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-sm"
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View className="flex-row mt-3 space-x-2 z-10 pb-4 mx-4">
        <TouchableOpacity
          onPress={() => setSelectedType("ALL")}
          className={`rounded-full px-4 py-2 ${
            selectedType === "ALL" ? "bg-blue-900" : "bg-white border border-blue-900"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              selectedType === "ALL" ? "text-white" : "text-blue-900"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedType("ROOM")}
          className={`rounded-full px-4 py-2 flex-row items-center ${
            selectedType === "ROOM" ? "bg-blue-900" : "bg-white border border-blue-900"
          }`}
        >
          <Image
            source={icons.door}
            className="w-4 h-4 mr-1"
            style={{
              tintColor: selectedType === "ROOM" ? "#fff" : "#1e3a8a",
            }}
          />
          <Text
            className={`text-xs font-semibold ${
              selectedType === "ROOM" ? "text-white" : "text-blue-900"
            }`}
          >
            Rooms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedType("TRANSPORT")}
          className={`rounded-full px-4 py-2 flex-row items-center ${
            selectedType === "TRANSPORT" ? "bg-blue-900" : "bg-white border border-blue-900"
          }`}
        >
          <Image
            source={icons.car}
            className="w-4 h-4 mr-1"
            style={{
              tintColor: selectedType === "TRANSPORT" ? "#fff" : "#1e3a8a",
            }}
          />
          <Text
            className={`text-xs font-semibold ${
              selectedType === "TRANSPORT" ? "text-white" : "text-blue-900"
            }`}
          >
            Transport
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView className="px-4 pt-3">
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 text-center">No bookings found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyBooking;
