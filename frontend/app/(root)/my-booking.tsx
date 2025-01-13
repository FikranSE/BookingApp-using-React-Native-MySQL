import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import {router} from "expo-router";

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
  
  // Dummy data - replace with API call
  const dummyBookings: IBooking[] = [
    {
      id: "1",
      type: "ROOM",
      title: "Team Meeting",
      date: "2025-01-13",
      startTime: "09:00",
      endTime: "10:00",
      location: "Meeting Room A",
      isOngoing: false,
      approval: {
        status: "APPROVED",
        approverName: "John Doe",
        approvedAt: "2025-01-12 14:30",
        feedback: "Approved. Please make sure to clean up after use."
      }
    },
    {
      id: "2",
      type: "TRANSPORT",
      title: "Client Visit",
      date: "2025-01-13",
      startTime: "13:00",
      endTime: "15:00",
      location: "Toyota Innova - B 1234 CD",
      isOngoing: false,
      approval: {
        status: "PENDING",
        approverName: "Jane Smith"
      }
    },
    {
      id: "3",
      type: "ROOM",
      title: "Project Discussion",
      date: "2025-01-14",
      startTime: "11:00",
      endTime: "12:00",
      location: "Meeting Room B",
      isOngoing: false,
      approval: {
        status: "REJECTED",
        approverName: "Mike Johnson",
        approvedAt: "2025-01-12 16:45",
        feedback: "Room already booked for maintenance."
      }
    }
  ];

  // Filter bookings based on selected type
  const filteredBookings = dummyBookings.filter(booking => {
    if (selectedType === "ALL") return true;
    return booking.type === selectedType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const BookingCard = ({ booking }: { booking: IBooking }) => {
    return (
      <TouchableOpacity 
        className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        onPress={() => router.replace('/(root)/detail-booking')}
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
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
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