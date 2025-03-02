import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import InputField from '@/components/Inputfield_form';
import { tokenCache } from "@/lib/auth";  // Import tokenCache from lib/auth
import { AUTH_TOKEN_KEY } from "@/lib/constants";  // Import the constant key for the auth token
import Modal from 'react-native-modal';  // Import react-native-modal for custom alerts
import { Button } from 'react-native-paper';  // Import Button from react-native-paper for better button styling
import { Picker } from '@react-native-picker/picker';

interface RescheduleForm {
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

const RescheduleBooking = ({ bookingId }: { bookingId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RescheduleForm>({
    room_id: null,
    booking_date: new Date(),
    start_time: '',
    end_time: '',
    pic: '',
    section: '',
    description: '',
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const authToken = await fetchAuthToken();
        if (!authToken) {
          Alert.alert('Error', 'Not authenticated');
          router.push('/(auth)/sign-in');
          return;
        }

        const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.data && Array.isArray(response.data)) {
          setRooms(response.data);
        } else {
          showAlert('Error', 'Invalid room data received.', 'error');
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        showAlert('Error', 'Failed to load rooms. Please try again.', 'error');
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const authToken = await fetchAuthToken();
        if (!authToken) {
          Alert.alert('Error', 'Not authenticated');
          router.push('/(auth)/sign-in');
          return;
        }

        const response = await axios.get(`https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings/${bookingId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.data) {
          setForm({
            room_id: response.data.room_id,
            booking_date: new Date(response.data.booking_date),
            start_time: response.data.start_time,
            end_time: response.data.end_time,
            pic: response.data.pic,
            section: response.data.section,
            description: response.data.description,
          });
        } else {
          showAlert('Error', 'Booking data not found.', 'error');
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        showAlert('Error', 'Failed to load booking details. Please try again.', 'error');
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.pic.trim()) {
      newErrors.pic = 'PIC name is required';
    }
    
    if (!form.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (!form.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!form.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (form.start_time && !isValidTimeRange(form.start_time, form.end_time)) {
      newErrors.end_time = 'End time must be after start time';
    }

    if (form.room_id === null) {
      newErrors.room_id = 'Please select a valid room';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      showAlert('Validation Error', firstError, 'error');
      return;
    }

    setLoading(true);

    try {
      const authToken = await fetchAuthToken();
      if (!authToken) {
        showAlert('Error', 'Not authenticated', 'error');
        return;
      }

      const response = await axios.put(`https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings/${bookingId}`, form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        showAlert('Success', 'Booking rescheduled successfully', 'success');
        setTimeout(() => {
          router.replace('/(root)/(tabs)/my-booking');
        }, 2000);
      } else {
        showAlert('Error', 'Unexpected response from server', 'error');
      }
    } catch (error) {
      console.error('Rescheduling error:', error);
      if (error.response) {
        showAlert('Error', error.response.data.message || 'Failed to reschedule booking. Please try again.', 'error');
      } else {
        showAlert('Error', 'Failed to reschedule booking. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, details: string, type: 'success' | 'error') => {
    setAlertMessage(`${message}: ${details}`);
    setAlertType(type);
    setModalVisible(true);
  };

  const isValidTimeRange = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  const renderRooms = () => (
    <View className="mb-6">
      <Text className="text-gray-700 font-medium mb-3">Select Room *</Text>
      {errors.room_id && <Text className="text-orange-500 mb-2 text-xs">{errors.room_id}</Text>}
      <ScrollView className="max-h-full">
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.room_id}
            onPress={() => {
              setForm(prev => ({ ...prev, room_id: room.room_id }));
              if (errors.room_id) {
                setErrors(prev => ({ ...prev, room_id: undefined }));
              }
            }}
            className={`flex-row items-center p-4 mb-4 rounded-xl border ${
              room.room_id === form.room_id 
                ? 'bg-sky-50 border-sky-500' 
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="w-20 h-20 bg-sky-100 rounded-lg overflow-hidden mr-4">
              <Image source={{ uri: room.image }} style={{ width: '100%', height: '100%' }} />
            </View>
            <View className="flex-1">
              <Text className={`text-base ${
                room.room_id === form.room_id ? 'text-sky-900 font-medium' : 'text-gray-700'
              }`}>
                {room.room_name}
              </Text>
              <Text className={`text-sm ${
                room.room_id === form.room_id ? 'text-sky-700' : 'text-gray-500'
              }`}>
                Type: {room.room_type} | Capacity: {room.capacity}
              </Text>
              <Text className={`text-xs ${
                room.room_id === form.room_id ? 'text-sky-700' : 'text-gray-500'
              }`}>
                Facilities: {room.facilities ? room.facilities.join(', ') : 'No facilities available'}
              </Text>
            </View>
            {room.room_id === form.room_id && (
              <Ionicons name="checkmark-circle" size={24} color="#0EA5E9" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View> 
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="flex-row items-center mb-4 mt-2">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="mx-4 text-gray-500 font-medium">{title}</Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white pb-10">
      <View className="shadow-sm bg-sky-500">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center bg-white"
          >
            <Ionicons name="arrow-back" size={20} color="#0EA5E9" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white">Reschedule Room Booking</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-sky-100">
          <SectionHeader title="BASIC INFORMATION" />
          
          <InputField
            label="PIC Name *"
            value={form.pic}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, pic: text }))}
            placeholder="Enter person in charge"
            errorMessage={errors.pic}
          />

          <InputField
            label="Section *"
            value={form.section}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, section: text }))}
            placeholder="Enter section name"
            errorMessage={errors.section}
          />

          {renderRooms()}

          <SectionHeader title="DATE & TIME" />

          <View className="mb-6">
            <Text className="text-sky-700 font-medium mb-3">Booking Date *</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center space-x-2 bg-sky-50 border border-gray-200 rounded-xl p-4"
            >
              <Ionicons name="calendar" size={20} color="#0EA5E9" className="mr-3" />
              <Text className="text-gray-900">{form.booking_date.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-6 space-x-4">
            <View className="flex-1">
              <Text className="text-sky-700 font-medium mb-3">Start Time *</Text>
              <TouchableOpacity 
                onPress={() => setShowStartTimePicker(true)}
                className="flex-row items-center space-x-2 bg-sky-50 border ${errors.start_time ? 'border-orange-500' : 'border-gray-200'} rounded-xl p-4"
              >
                <Ionicons name="time" size={20} color="#0EA5E9" className="mr-3" />
                <Text className="text-gray-900">{form.start_time || 'Select time'}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <Text className="text-sky-700 font-medium mb-3">End Time *</Text>
              <TouchableOpacity 
                onPress={() => setShowEndTimePicker(true)}
                className="flex-row items-center space-x-2 bg-sky-50 border ${errors.end_time ? 'border-orange-500' : 'border-gray-200'} rounded-xl p-4"
              >
                <Ionicons name="time" size={20} color="#0EA5E9" className="mr-3" />
                <Text className="text-gray-900">{form.end_time || 'Select time'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <SectionHeader title="ADDITIONAL DETAILS" />

          <InputField
            label="Description"
            value={form.description}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, description: text }))}
            placeholder="Enter booking description"
            multiline
            numberOfLines={4}
            errorMessage={errors.description}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-orange-500 py-4 rounded-xl mb-6 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? ( 
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-base">Reschedule Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Success/Error Alerts */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} animationIn="fadeIn" animationOut="fadeOut">
        <View className={`flex-col items-center justify-center bg-white rounded-xl p-6 shadow-lg ${alertType === 'error' ? 'border-orange-500' : 'border-sky-500'}`}>
          <Ionicons 
            name={alertType === 'error' ? 'close-circle' : 'checkmark-circle'} 
            size={75} 
            color={alertType === 'error' ? '#F97316' : '#0EA5E9'} 
          />
          <Text className={`text-xl font-bold mt-1 ${alertType === 'error' ? 'text-orange-500' : 'text-sky-500'}`}>
            {alertType === 'error' ? 'Error' : 'Success'}
          </Text>
          <Text className="text-gray-600 text-center mt-2">{alertMessage}</Text>
          <TouchableOpacity 
            onPress={() => setModalVisible(false)}
            className={`mt-4 py-2 px-6 rounded-full ${alertType === 'error' ? 'bg-orange-500' : 'bg-sky-500'}`}
          >
            <Text className="text-white font-bold">OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RescheduleBooking;
