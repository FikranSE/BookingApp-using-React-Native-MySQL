import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import InputField from '@/components/Inputfield_form';
import { tokenCache } from "@/lib/auth";  // Import tokenCache from lib/auth
import { AUTH_TOKEN_KEY } from "@/lib/constants";  // Import the constant key for the auth token
import Modal from 'react-native-modal';  // Import react-native-modal for custom alerts
import { Button } from 'react-native-paper';  // Import Button from react-native-paper for better button styling

interface BookingForm {
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
  room_type: string;  // Added room_type
  capacity: number;  // Added capacity
  image: string;  // Added image
  facilities: string;  // Facilities as string (comma-separated)
}

const BookingRoom = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BookingForm>({
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
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success'); // Success or error state

  // Fetch authToken from tokenCache
  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const authToken = await fetchAuthToken();
        if (!authToken) {
          Alert.alert('Error', 'Not authenticated');
          // Optionally redirect to login page if no token
          router.push('/(auth)/sign-in');
          return;
        }

        const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.data && Array.isArray(response.data)) {
          // Ensure facilities is always a valid array
          const roomsWithFacilities = response.data.map((room: Room) => ({
            ...room,
            // Ensure facilities is an array, even if it's stored as a string in the database
            facilities: room.facilities ? room.facilities.split(',').map((item: string) => item.trim()) : [],
          }));
          setRooms(roomsWithFacilities);
        } else {
          showAlert('Error', 'Invalid rooms data received.', 'error');
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        showAlert('Error', 'Failed to load rooms. Please try again.', 'error');
      }
    };
    fetchRooms();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!form.pic) {
      showAlert('Error', 'Please fill in the PIC name', 'error');
      return;
    }

    if (!form.section) {
      showAlert('Error', 'Please fill in the section', 'error');
      return;
    }

    if (!form.start_time || !form.end_time) {
      showAlert('Error', 'Please select both start and end times', 'error');
      return;
    }

    if (form.room_id === null) {
      showAlert('Error', 'Please select a valid room', 'error');
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

      await axios.post('https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      showAlert('Success', 'Booking submitted successfully', 'success');
      setTimeout(() => {
        router.replace('/(root)/(tabs)/my-booking');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response) {
        showAlert('Error', error.response.data.message || 'Failed to submit booking. Please try again.', 'error');
      } else {
        showAlert('Error', 'Failed to submit booking. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show alert with custom modal
  const showAlert = (message: string, details: string, type: 'success' | 'error') => {
    setAlertMessage(`${message}: ${details}`);
    setAlertType(type);
    setModalVisible(true);
  };

  // Validate time range (start time < end time)
  const isValidTimeRange = (start: string, end: string) => {
    if (!start || !end) return false;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  // Format time as hh:mm
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Render room selection
  const renderRooms = () => (
    <View className="mb-6">
      <Text className="text-gray-700 font-medium mb-3">Select Room *</Text>
      <ScrollView className="max-h-full">
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.room_id}
            onPress={() => setForm(prev => ({ ...prev, room_id: room.room_id }))}
            className={`flex-row items-center p-4 mb-4 rounded-xl border ${
              room.room_id === form.room_id 
                ? 'bg-blue-50 border-blue-500' 
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="w-20 h-20 bg-blue-100 rounded-lg overflow-hidden mr-4">
              <Image source={{ uri: room.image }} style={{ width: '100%', height: '100%' }} />
            </View>
            <View className="flex-1">
              <Text className={`text-base ${
                room.room_id === form.room_id ? 'text-blue-900 font-medium' : 'text-gray-700'
              }`}>
                {room.room_name}
              </Text>
              <Text className={`text-sm ${
                room.room_id === form.room_id ? 'text-blue-700' : 'text-gray-500'
              }`}>
                Type: {room.room_type} | Capacity: {room.capacity}
              </Text>
              <Text className={`text-xs ${
                room.room_id === form.room_id ? 'text-blue-700' : 'text-gray-500'
              }`}>
                Facilities: {room.facilities.length > 0 ? room.facilities.join(', ') : 'No facilities available'}
              </Text>
            </View>
            {room.room_id === form.room_id && (
              <Ionicons name="checkmark-circle" size={24} color="#1E40AF" />
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
    <SafeAreaView className="flex-1 bg-gray-100 pb-10">
      {/* Enhanced Header */}
      <View className="shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#48494EFF" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-700">New Room Booking</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <SectionHeader title="BASIC INFORMATION" />
          
          <InputField
            label="PIC Name *"
            value={form.pic}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, pic: text }))}
            placeholder="Enter person in charge"
            leftIcon={<Ionicons name="person" size={20} color="#64748B" />}
          />

          <InputField
            label="Section *"
            value={form.section}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, section: text }))}
            placeholder="Enter section name"
            leftIcon={<Ionicons name="pencil" size={20} color="#64748B" />}
          />

          {renderRooms()}

          <SectionHeader title="DATE & TIME" />

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-3">Booking Date *</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center space-x-2 bg-white border border-gray-200 rounded-xl p-4"
            >
              <Ionicons name="calendar" size={20} color="#64748B" className="mr-3" />
              <Text className="text-gray-900">{form.booking_date.toLocaleDateString()}</Text>
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

          <SectionHeader title="ADDITIONAL DETAILS" />

          <InputField
            label="Description"
            value={form.description}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, description: text }))}
            placeholder="Enter booking description"
            multiline
            numberOfLines={4}
            style={{ padding: 4 }} 
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-blue-900 py-3 rounded-xl mb-6 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? ( 
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-md">Submit Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Modal for Success/Error */}
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
          <Text className="text-gray-600 ">{alertMessage}</Text>
          <Button mode="contained" onPress={() => setModalVisible(false)} className="mt-4 w-1/2 bg-blue-900 text-white">
            OK
          </Button>
        </View>
      </Modal>


      {/* DateTimePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={form.booking_date}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setForm(prev => ({ ...prev, booking_date: selectedDate }));
            }
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          onChange={(event, selectedDate) => {
            setShowStartTimePicker(false);
            if (selectedDate) {
              setForm(prev => ({ ...prev, start_time: formatTime(selectedDate) }));
            }
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          onChange={(event, selectedDate) => {
            setShowEndTimePicker(false);
            if (selectedDate) {
              setForm(prev => ({ ...prev, end_time: formatTime(selectedDate) }));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default BookingRoom;
