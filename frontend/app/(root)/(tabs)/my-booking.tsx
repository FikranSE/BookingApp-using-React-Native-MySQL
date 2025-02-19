import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import { router } from "expo-router";

// Types for API integration
interface IApprovalStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  approverName?: string;
  approvedAt?: string;
}

interface IBooking {
  id: string;
  type: 'ROOM' | 'TRANSPORT';
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isOngoing: boolean;
  approval: IApprovalStatus;
}

const MyBooking = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<"ALL" | "ROOM" | "TRANSPORT">("ALL");
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJmaWtyYW4zQGdtYWlsLmNvbSIsImlhdCI6MTczOTk1Nzg4NiwiZXhwIjoxNzM5OTYxNDg2fQ.g9G3QfDCcV4PTQ4qE6me4pCVWYOsNj5dBVIN2M8wrV0';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`, // Replace with actual token
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Fetched data:', data); // Log the API response to inspect the structure

        if (data.error) {
          Alert.alert('Error', data.error);
          return;
        }

        // Assuming the data is an array of bookings
        const mappedBookings = data.map((item: any) => ({
          id: item.booking_id.toString(),
          type: 'ROOM', // Assuming it's a room booking for this example
          title: item.description || "No title",
          date: item.booking_date,
          startTime: item.start_time,
          endTime: item.end_time,
          location: item.section,
          isOngoing: false, // Update this based on your logic for ongoing bookings
          approval: {
            status: item.status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED',
            approverName: item.pic,
            approvedAt: item.approved_at ? new Date(item.approved_at).toISOString() : undefined,
            feedback: item.notes || undefined,
          },
        }));

        setBookings(mappedBookings);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        Alert.alert('Error', 'There was an error fetching the bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

// Inside MyBooking component
const BookingCard = ({ booking }: { booking: IBooking }) => {
  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl mb-3 shadow-sm"
      onPress={() => router.push(`/detail-booking?id=${booking.id}`)}  // Use query params here
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
            {booking.title}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {booking.location}
          </Text>
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
        <View className={`px-2 py-1 rounded-lg mr-2 mb-2 ${
          booking.type === 'ROOM' ? 'bg-purple-100' : 'bg-green-100'}`}>
          <Text className={`text-xs ${
            booking.type === 'ROOM' ? 'text-purple-700' : 'text-green-700'}`}>
            {booking.type === 'ROOM' ? 'Room' : 'Transport'}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-lg mb-2 ${getStatusColor(booking.approval.status)}`}>
          <Text className={`text-xs ${getStatusColor(booking.approval.status)}`}>
            {booking.approval.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};





  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">My Bookings</Text>
        <View className="w-6" />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-3">
        {(["ALL", "ROOM", "TRANSPORT"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            className={`mr-2 px-4 py-2 rounded-lg ${
              selectedType === type ? 'bg-blue-900' : 'bg-white'
            }`}
          >
            <Text className={`text-sm font-semibold ${
              selectedType === type ? 'text-white' : 'text-gray-600'
            }`}>
              {type === "ALL" ? type : type.charAt(0) + type.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView className="flex-1 px-4">
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
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
