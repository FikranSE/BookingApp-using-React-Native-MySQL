import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface IApprovalStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  approverName?: string;
  approvedAt?: string;
}

interface IBooking {
  id: string;
  type: 'ROOM' | 'TRANSPORT';
  pic: string;
  section: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  isOngoing: boolean;
  approval: IApprovalStatus;
}

const DetailBooking = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingDetail, setBookingDetail] = useState<IBooking | null>(null);

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJmaWtyYW4zQGdtYWlsLmNvbSIsImlhdCI6MTc0MDA0Njg2NCwiZXhwIjoxNzQwMDUwNDY0fQ.9dHtzEDAvk3JV48W9G0_kO4x8v_bmtGcoJbNq5RbJ2M';

  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = response.data;

        if (data.error) {
          Alert.alert('Error', data.error);
          return;
        }

        // Get room details
        const roomResponse = await axios.get(
          `https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms/${data.room_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Get approver details if approved_by exists
        let approverName = undefined;
        if (data.approved_by) {
          const approverResponse = await axios.get(
            `https://j9d3hc82-3001.asse.devtunnels.ms/api/users/${data.approved_by}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          approverName = `${approverResponse.data.first_name} ${approverResponse.data.last_name}`;
        }

        const mappedBooking: IBooking = {
          id: data.booking_id.toString(),
          type: 'ROOM',
          pic: data.pic || "Not assigned",
          section: data.section || "No section",
          roomName: roomResponse.data.room_name || "Unknown Room",
          date: data.booking_date,
          startTime: data.start_time,
          endTime: data.end_time,
          description: data.description,
          isOngoing: false,
          approval: {
            status: data.status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED',
            approverName: approverName,
            approvedAt: data.approved_at ? new Date(data.approved_at).toISOString() : undefined,
            feedback: data.notes || undefined,
          },
        };

        setBookingDetail(mappedBooking);
      } catch (error) {
        console.error("Error fetching booking details: ", error);
        Alert.alert('Error', 'There was an error fetching the booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [id]);

  const InfoRow = ({ icon, label, value }: { 
    icon: string; 
    label: string; 
    value: string;
  }) => (
    <View className="flex-row items-center space-x-4 py-5 border-b border-gray-100">
      <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
        <Ionicons name={icon as any} size={24} color="#1E3A8A" />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-500 font-medium">{label}</Text>
        <Text className="text-base text-gray-900 font-semibold mt-1">{value}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-700';
      case 'REJECTED':
        return 'bg-red-600 text-white';
      default:
        return 'bg-yellow-50 text-yellow-700';
    }
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Navigate to reschedule screen');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [ 
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            // Add cancel logic here
            Alert.alert('Booking cancelled successfully');
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </SafeAreaView>
    );
  }

  if (!bookingDetail) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500 text-lg">Booking not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="black" />
        </TouchableOpacity> 
        <Text className="text-lg font-bold text-gray-800">Add Bookings</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Content Container */}
        <View className="px-6 pt-6">
          {/* Title and Status Section */}
          <View className="bg-blue-50 p-6 rounded-2xl mb-8">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-blue-900">{bookingDetail.section}</Text>
                <Text className="text-blue-700/70 mt-1">Booking #{bookingDetail.id}</Text>
                <Text className="text-blue-700/70 mt-1">{bookingDetail.roomName}</Text>
              </View>
              <View className={`px-4 py-2 rounded-xl ${getStatusColor(bookingDetail.approval.status)}`}>
                <Text className="font-bold">{bookingDetail.approval.status}</Text>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View className="bg-white rounded-2xl mb-6">
            <Text className="text-lg font-bold text-blue-900 mb-4">Booking Information</Text>
            
            <InfoRow
              icon="person"
              label="Person in Charge"
              value={bookingDetail.pic}
            />
            <InfoRow
              icon="business"
              label="Room"
              value={bookingDetail.roomName}
            />
            <InfoRow
              icon="newspaper"
              label="Description"
              value={bookingDetail.description}
            />
            <InfoRow
              icon="calendar"
              label="Date"
              value={bookingDetail.date}
            />
            <InfoRow
              icon="time"
              label="Time"
              value={`${bookingDetail.startTime} - ${bookingDetail.endTime}`}
            />
            {bookingDetail.approval.approverName && (
              <InfoRow
                icon="person"
                label="Approved By"
                value={bookingDetail.approval.approverName}
              />
            )}
            {bookingDetail.approval.approvedAt && (
              <InfoRow
                icon="time"
                label="Approved At"
                value={new Date(bookingDetail.approval.approvedAt).toLocaleString()}
              />
            )}
          </View>

          {/* Feedback Section */}
          {bookingDetail.approval.feedback && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-blue-900 mb-4">Feedback</Text>
              <View className="bg-blue-50 p-6 rounded-2xl">
                <Text className="text-blue-900 leading-relaxed">{bookingDetail.approval.feedback}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-4 mb-6">
            <TouchableOpacity 
              onPress={handleReschedule}
              className="flex-1 bg-blue-900 py-4 rounded-xl flex-row items-center justify-center space-x-2"
            >
              <Ionicons name="calendar" size={20} color="white" />
              <Text className="text-white font-bold text-base">Reschedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleCancel}
              className="flex-1 bg-red-600 py-4 rounded-xl flex-row items-center justify-center space-x-2"
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <Text className="text-white font-bold text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailBooking;