import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { tokenCache } from "@/lib/auth";  
import { AUTH_TOKEN_KEY } from "@/lib/constants";  
import Modal from 'react-native-modal';  
import { Button } from 'react-native-paper';  

interface BookingForm {
  booking_id: number;
  room_id: number | null;
  booking_date: Date;
  start_time: string;
  end_time: string;
  pic: string;
  section: string;
  description: string;
}

interface Room {
  room_id: number;
  room_name: string;
  room_type: string;
  capacity: number;
  image: string;
  facilities: string;
}

const RescheduleBooking = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params?.id; 
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState<BookingForm>({
    booking_id: 0,
    room_id: null,
    booking_date: new Date(),
    start_time: '',
    end_time: '',
    pic: '',
    section: '',
    description: '',
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Fetch authToken from tokenCache
  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        if (!bookingId) {
          console.error('No booking ID in params:', params);
          showAlert('Error', 'No booking ID provided. Please try again.', 'error');
          router.back();
          return;
        }

        const authToken = await fetchAuthToken();
        if (!authToken) {
          Alert.alert('Error', 'Not authenticated');
          router.push('/(auth)/sign-in');
          return;
        }

        const bookingResponse = await axios.get(
          `https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings/${bookingId}`,
          {
            headers: { 
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json'
            },
          }
        );

        if (bookingResponse.data) {
          const bookingData = bookingResponse.data;
          const bookingDate = new Date(bookingData.booking_date);
          setForm({
            booking_id: bookingData.booking_id,
            room_id: bookingData.room_id,
            booking_date: bookingDate,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            pic: bookingData.pic || '',
            section: bookingData.section || '',
            description: bookingData.description || '',
          });
        }

        // Fetch rooms
        const roomsResponse = await axios.get(
          'https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms',
          {
            headers: { 
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json'
            },
          }
        );

        if (roomsResponse.data && Array.isArray(roomsResponse.data)) {
          const roomsWithFacilities = roomsResponse.data.map((room: Room) => ({
            ...room,
            facilities: room.facilities ? room.facilities.split(',').map((item: string) => item.trim()) : [],
          }));
          setRooms(roomsWithFacilities);
          
          // Set selected room based on form.room_id
          const currentRoom = roomsWithFacilities.find(room => room.room_id === form.room_id);
          if (currentRoom) {
            setSelectedRoom(currentRoom);
          }
        }

      } catch (error) {
        console.error('Error in fetchBookingData:', error.response?.data || error);
        const errorMessage = error.response?.data?.message || 'Failed to load booking data';
        showAlert('Error', errorMessage, 'error');
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, params]);

  const showAlert = (message: string, details: string, type: 'success' | 'error') => {
    setAlertMessage(`${message}: ${details}`);
    setAlertType(type);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.start_time || !form.end_time) {
      showAlert('Error', 'Please select both start and end times', 'error');
      return;
    }

    if (!isValidTimeRange(form.start_time, form.end_time)) {
      showAlert('Error', 'End time must be after start time', 'error');
      return;
    }

    setLoading(true);

    try {
      const authToken = await fetchAuthToken();
      if (!authToken) {
        showAlert('Error', 'Not authenticated', 'error');
        return;
      }

      const updateData = {
        ...form,
        booking_date: form.booking_date.toISOString().split('T')[0],
      };

      await axios.put(
        `https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings/${bookingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      showAlert('Success', 'Booking rescheduled successfully', 'success');
      setTimeout(() => {
        router.replace('/(root)/(tabs)/my-booking');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response) {
        showAlert('Error', error.response.data.message || 'Failed to reschedule booking. Please try again.', 'error');
      } else {
        showAlert('Error', 'Failed to reschedule booking. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidTimeRange = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  const DetailField = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-6">
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <View className="bg-gray-50 p-4 rounded-xl">
        <Text className="text-gray-800">{value}</Text>
      </View>
    </View>
  );

  const renderRoomDetail = () => {
    if (!selectedRoom) return null;
    
    return (
      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-3">Room Details</Text>
        <View className="bg-gray-50 p-4 rounded-xl">
          <View className="flex-row mb-4">
            <Image 
              source={{ uri: selectedRoom.image }} 
              className="w-24 h-24 rounded-lg mr-4"
            />
            <View className="flex-1">
              <Text className="text-lg font-medium text-gray-900">{selectedRoom.room_name}</Text>
              <Text className="text-gray-600">Type: {selectedRoom.room_type}</Text>
              <Text className="text-gray-600">Capacity: {selectedRoom.capacity}</Text>
            </View>
          </View>
          <Text className="text-gray-600">Facilities: {selectedRoom.facilities}</Text>
        </View>
      </View>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="flex-row items-center mb-4 mt-2">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="mx-4 text-gray-500 font-medium">{title}</Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  );

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text className="mt-4 text-gray-600">Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-10">
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <SectionHeader title="BOOKING DETAILS" />
          
          <DetailField label="PIC Name" value={form.pic} />
          <DetailField label="Section" value={form.section} />
          {renderRoomDetail()}
          <DetailField label="Description" value={form.description || 'No description provided'} />

          <SectionHeader title="RESCHEDULE DATE & TIME" />

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-3">Booking Date *</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center space-x-2 bg-white border border-gray-200 rounded-xl p-4"
            >
              <Ionicons name="calendar" size={20} color="#64748B" className="mr-3" />
              <Text className="text-gray-900">
                {form.booking_date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-6 space-x-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-3">Start Time *</Text>
              <TouchableOpacity 
                onPress={() => setShowStartTimePicker(true)}
                className="flex-row items-center space-x-2 bg-white border border-gray-200 rounded-xl p-4"
              >
                <Ionicons name="time" size={20} color="#64748B" className="mr-3" />
                <Text className="text-gray-900">{form.start_time || 'Select time'}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-3">End Time *</Text>
              <TouchableOpacity 
                onPress={() => setShowEndTimePicker(true)}
                className="flex-row items-center space-x-2 bg-white border border-gray-200 rounded-xl p-4"
              >
                <Ionicons name="time" size={20} color="#64748B" className="mr-3" />
                <Text className="text-gray-900">{form.end_time || 'Select time'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-blue-900 py-3 rounded-xl mb-6 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? ( 
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-md">Update Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} animationIn="fadeIn" animationOut="fadeOut">
        <View className={`flex-col items-center justify-center bg-white rounded-xl p-6 shadow-lg ${alertType === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
          <Ionicons 
            name={alertType === 'error' ? 'close-circle' : 'checkmark-circle'} 
            size={75} 
            color={alertType === 'error' ? 'red' : '#31C48D'} 
          />
          <Text 
            className={`text-xl font-bold mt-1 ${alertType === 'error' ? 'text-red-500' : 'text-green-500'}`}
          >
            {alertType === 'error' ? 'Error' : 'Success'}
          </Text>
          <Text className="text-center text-gray-700 mt-2">{alertMessage}</Text>
          <Button 
            mode="contained" 
            onPress={() => setModalVisible(false)} 
            className="mt-4"
          >
            Close
          </Button>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={form.booking_date}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type === 'set') {
              setForm(prev => ({ ...prev, booking_date: selectedDate }));
            }
          }}
        />
      )}

{showStartTimePicker && (
  <DateTimePicker
    value={form.start_time ? new Date(`2000-01-01T${form.start_time}`) : new Date()}
    mode="time"
    onChange={(event, selectedDate) => {
      setShowStartTimePicker(false);
      if (selectedDate && event.type === 'set') {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0'); // Fixed: remove duplicated line
        const formattedTime = `${hours}:${minutes}`;
        setForm(prev => ({ ...prev, start_time: formattedTime }));
      }
    }}
  />
)}

{showEndTimePicker && (
  <DateTimePicker
    value={form.end_time ? new Date(`2000-01-01T${form.end_time}`) : new Date()}
    mode="time"
    onChange={(event, selectedDate) => {
      setShowEndTimePicker(false);
      if (selectedDate && event.type === 'set') {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        setForm(prev => ({ ...prev, end_time: formattedTime }));
      }
    }}
  />
)}

    </SafeAreaView>
  );
};

export default RescheduleBooking;