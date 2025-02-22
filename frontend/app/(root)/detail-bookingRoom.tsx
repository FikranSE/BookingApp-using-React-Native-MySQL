import React, { useState, useEffect } from "react";
import { Image, View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { images } from "@/constants";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

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

const DetailBookingRoom = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingDetail, setBookingDetail] = useState<IBooking | null>(null);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
        
        if (!authToken) {
          Alert.alert('Error', 'Not authenticated');
          router.push('/(auth)/sign-in');
          return;
        }

        const axiosInstance = axios.create({
          baseURL: 'https://j9d3hc82-3001.asse.devtunnels.ms/api',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Handle axios errors globally
        axiosInstance.interceptors.response.use(
          response => response,
          error => {
            if (error.response?.status === 401) {
              tokenCache.removeToken(AUTH_TOKEN_KEY);
              router.push('/(auth)/sign-in');
            }
            return Promise.reject(error);
          }
        );

        // Get booking details
        const bookingResponse = await axiosInstance.get(`/room-bookings/${id}`);
        const bookingData = bookingResponse.data;

        // Get room details
        const roomResponse = await axiosInstance.get(`/rooms/${bookingData.room_id}`);
        const roomData = roomResponse.data;

        // Get approver details if exists
        let approverName;
        if (bookingData.approved_by) {
          const approverResponse = await axiosInstance.get(`/admins/${bookingData.approved_by}`);
          approverName = `${approverResponse.data.first_name} ${approverResponse.data.last_name}`;
        }

        const mappedBooking: IBooking = {
          id: bookingData.booking_id.toString(),
          type: 'ROOM',
          pic: bookingData.pic || "Not assigned",
          section: bookingData.section || "No section",
          roomName: roomData.room_name || "Unknown Room",
          date: bookingData.booking_date,
          startTime: bookingData.start_time,
          endTime: bookingData.end_time,
          description: bookingData.description,
          isOngoing: false,
          approval: {
            status: bookingData.status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED',
            approverName: approverName,
            approvedAt: bookingData.approved_at ? new Date(bookingData.approved_at).toISOString() : undefined,
            feedback: bookingData.notes || undefined,
          },
        };

        setBookingDetail(mappedBooking);
      } catch (error) {
        console.error("Error fetching booking details: ", error);
        Alert.alert(
          'Error',
          'Failed to fetch booking details. Please try again later.'
        );
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
    <View className="mb-4">
      <View className="flex-row items-center bg-blue-50 rounded-2xl p-4">
        <View className="w-12 h-12 bg-blue-900 rounded-xl items-center justify-center mr-4">
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-blue-900 text-sm font-medium">{label}</Text>
          <Text className="text-gray-800 font-semibold text-lg mt-1">{value}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const handleReschedule = () => {
    router.push(`/reschedule-booking?id=${id}`);
  };

  const handleCancel = async () => {
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
          onPress: async () => {
            try {
              const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
              
              if (!authToken) {
                Alert.alert('Error', 'Not authenticated');
                router.push('/(auth)/sign-in');
                return;
              }

              await axios.delete(
                `https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              Alert.alert('Success', 'Booking cancelled successfully');
              router.back();
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
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
      <ScrollView className="flex-1">
        <View className="relative">
          <Image
            source={images.profile1}
            className="w-full h-80"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-12 h-12 bg-blue-900 rounded-full items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-6 -mt-10 bg-white rounded-t-3xl">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {bookingDetail.section} - Booking #{bookingDetail.id}
          </Text>
            {/* Status Section */}
          <View className={`w-1/3 px-4 py-2 rounded-xl mb-6 ${getStatusColor(bookingDetail.approval.status)}`}>
            <Text className="font-bold text-neutral-100 text-center">{bookingDetail.approval.status}</Text>
          </View>

          <View>
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

export default DetailBookingRoom;
