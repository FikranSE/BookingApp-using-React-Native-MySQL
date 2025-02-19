import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import InputField from '@/components/InputField';

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

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJmaWtyYW4zQGdtYWlsLmNvbSIsImlhdCI6MTczOTk1Nzg4NiwiZXhwIjoxNzM5OTYxNDg2fQ.g9G3QfDCcV4PTQ4qE6me4pCVWYOsNj5dBVIN2M8wrV0';

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
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">Select Room *</Text>
      <ScrollView className="max-h-40">
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.room_id}
            onPress={() => setForm(prev => ({ ...prev, room_id: room.room_id }))}
            style={{
              padding: 10,
              marginVertical: 5,
              backgroundColor: room.room_id === form.room_id ? '#ddd' : '#fff',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
            }}
          >
            <Text>{room.room_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-4 py-3 bg-blue-900">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Add Booking</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <InputField
          label="PIC Name *"
          value={form.pic}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, pic: text }))}
          
        />

        <InputField
          label="Section *"
          value={form.section}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, section: text }))}
          
        />

        {renderRooms()}

        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Booking Date *</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className="bg-white border border-gray-200 rounded-xl h-12 px-4 justify-center"
          >
            <Text>{form.booking_date.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-4 space-x-4">
          <View className="flex-1">
            <Text className="text-gray-700 font-medium mb-2">Start Time *</Text>
            <TouchableOpacity 
              onPress={() => setShowStartTimePicker(true)}
              className="bg-white border border-gray-200 rounded-xl h-12 px-4 justify-center"
            >
              <Text>{form.start_time || 'Select time'}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="text-gray-700 font-medium mb-2">End Time *</Text>
            <TouchableOpacity 
              onPress={() => setShowEndTimePicker(true)}
              className="bg-white border border-gray-200 rounded-xl h-12 px-4 justify-center"
            >
              <Text>{form.end_time || 'Select time'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <InputField
          label="Description"
          value={form.description}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, description: text }))}
          
          multiline
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-blue-900 py-4 rounded-xl mt-6 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold">Submit Booking</Text>
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