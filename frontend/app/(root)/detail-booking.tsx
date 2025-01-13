import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import { router } from "expo-router";

// Types from MyBooking
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

const DetailBooking = () => {
  const navigation = useNavigation();

  // Dummy data - replace with API call or route params
  const bookingDetail: IBooking = {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const handleEdit = () => {
    // Navigate to edit page
    router.replace('/(root)/edit-booking');
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            // Add delete logic here
            router.replace('/(root)/my-booking');
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Booking Details</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Main Card */}
        <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
          {/* Title and Type */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {bookingDetail.title}
            </Text>
            <View className={`self-start px-3 py-1 rounded-lg ${
              bookingDetail.type === 'ROOM' ? 'bg-purple-100' : 'bg-green-100'}`}>
              <Text className={`text-sm font-medium ${
                bookingDetail.type === 'ROOM' ? 'text-purple-700' : 'text-green-700'}`}>
                {bookingDetail.type === 'ROOM' ? 'Room' : 'Transport'}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-500 mb-1">Location</Text>
              <Text className="text-base text-gray-800">{bookingDetail.location}</Text>
            </View>

            <View>
              <Text className="text-sm text-gray-500 mb-1">Date</Text>
              <Text className="text-base text-gray-800">{bookingDetail.date}</Text>
            </View>

            <View>
              <Text className="text-sm text-gray-500 mb-1">Time</Text>
              <Text className="text-base text-gray-800">
                {bookingDetail.startTime} - {bookingDetail.endTime}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-500 mb-1">Status</Text>
              <View className={`self-start px-3 py-1 rounded-lg ${getStatusColor(bookingDetail.approval.status)}`}>
                <Text className={`text-sm font-medium ${getStatusColor(bookingDetail.approval.status)}`}>
                  {bookingDetail.approval.status}
                </Text>
              </View>
            </View>

            {bookingDetail.approval.feedback && (
              <View>
                <Text className="text-sm text-gray-500 mb-1">Feedback</Text>
                <Text className="text-base text-gray-800">{bookingDetail.approval.feedback}</Text>
              </View>
            )}

            <View>
              <Text className="text-sm text-gray-500 mb-1">Approver</Text>
              <Text className="text-base text-gray-800">{bookingDetail.approval.approverName}</Text>
            </View>

            {bookingDetail.approval.approvedAt && (
              <View>
                <Text className="text-sm text-gray-500 mb-1">Approval Date</Text>
                <Text className="text-base text-gray-800">{bookingDetail.approval.approvedAt}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-1 bg-blue-900 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Edit Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="flex-1 bg-red-600 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Delete Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailBooking;