import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import InputField from '@/components/Inputfield_form';

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
}

const AddBooking = () => {
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

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJmaWtyYW4zQGdtYWlsLmNvbSIsImlhdCI6MTc0MDA0Njg2NCwiZXhwIjoxNzQwMDUwNDY0fQ.9dHtzEDAvk3JV48W9G0_kO4x8v_bmtGcoJbNq5RbJ2M';

  // Keep existing useEffect and helper functions...
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.data && Array.isArray(response.data)) {
          setRooms(response.data);
        } else {
          Alert.alert('Error', 'Invalid rooms data received.');
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        Alert.alert('Error', 'Failed to load rooms. Please try again.');
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = async () => {
    if (!form.pic) {
      Alert.alert('Error', 'Please fill in the PIC name');
      return;
    }

    if (!form.section) {
      Alert.alert('Error', 'Please fill in the section');
      return;
    }

    if (!form.start_time || !form.end_time) {
      Alert.alert('Error', 'Please select both start and end times');
      return;
    }

    if (form.room_id === null) {
      Alert.alert('Error', 'Please select a valid room');
      return;
    }

    if (!isValidTimeRange(form.start_time, form.end_time)) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      Alert.alert('Success', 'Booking submitted successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Failed to submit booking. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to submit booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidTimeRange = (start: string, end: string) => {
    if (!start || !end) return false;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderRooms = () => (
    <View className="mb-6">
      <Text className="text-gray-700 font-medium mb-3">Select Room *</Text>
      <ScrollView className="max-h-full">
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.room_id}
            onPress={() => setForm(prev => ({ ...prev, room_id: room.room_id }))}
            className={`flex-row items-center p-4 mb-2 rounded-xl border ${
              room.room_id === form.room_id 
                ? 'bg-blue-50 border-blue-500' 
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons 
                name="business" 
                size={20} 
                color={room.room_id === form.room_id ? '#1E40AF' : '#64748B'}
              />
            </View>
            <Text className={`flex-1 text-base ${
              room.room_id === form.room_id ? 'text-blue-900 font-medium' : 'text-gray-700'
            }`}>
              {room.room_name}
            </Text>
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
    <SafeAreaView className="flex-1 bg-gray-50 mb-20">
      {/* Enhanced Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">New Booking</Text>
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
            onChangeText={(text: string) =>setForm(prev => ({ ...prev, description: text }))}
            placeholder="Enter booking description"
            multiline
            numberOfLines={4}
            style={{ padding: 4 }} 
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-blue-900 py-4 rounded-xl mb-6 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? ( 
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Submit Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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

export default AddBooking;