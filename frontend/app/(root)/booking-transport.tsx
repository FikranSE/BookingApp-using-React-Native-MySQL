import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import InputField from '@/components/Inputfield_form';
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';

interface TransportBookingForm {
  transport_id: number | null;
  booking_date: Date;
  start_time: string;
  end_time: string;
  pic: string;
  section: string;
  description: string;
  destination: string;  // Added destination field
}

interface Transport {
  transport_id: number;
  vehicle_name: string;
  driver_name: string;
  capacity: number;  // Added capacity to the transport
  image: string;  // Added image URL for the transport
}

const TransportBooking = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TransportBookingForm>({
    transport_id: null,
    booking_date: new Date(),
    start_time: '',
    end_time: '',
    pic: '',
    section: '',
    description: '',
    destination: '', // Initialize destination
  });
  const [transports, setTransports] = useState<Transport[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const authToken = await fetchAuthToken();
        if (!authToken) {
          Alert.alert('Error', 'Not authenticated');
          router.push('/(auth)/sign-in');
          return;
        }

        const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/transports', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.data && Array.isArray(response.data)) {
          setTransports(response.data);
        } else {
          showAlert('Error', 'Invalid transport data received.', 'error');
        }
      } catch (error) {
        console.error('Error fetching transports:', error);
        showAlert('Error', 'Failed to load transports. Please try again.', 'error');
      }
    };
    fetchTransports();
  }, []);

  const handleSubmit = async () => {
    // Validate the required fields
    if (!form.pic || !form.section || !form.start_time || !form.end_time || form.transport_id === null || !form.destination) {
      showAlert('Error', 'Please fill in all required fields.', 'error');
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
  
      // Send the booking request including destination
      const response = await axios.post('https://j9d3hc82-3001.asse.devtunnels.ms/api/transport-bookings', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
  
      // Log the API response for debugging
      console.log('API Response:', response);
  
      // Check for success status code 201 (created)
      if (response.status === 201) {
        showAlert('Success', 'Booking submitted successfully', 'success');
        setTimeout(() => {
          router.replace('/(root)/(tabs)/my-booking');
        }, 2000);
      } else {
        // Unexpected status code, log it and show an error
        console.log('Unexpected response:', response);
        showAlert('Error', 'Unexpected response from server', 'error');
      }
    } catch (error) {
      console.error('Booking error:', error);
  
      // Log the full error response
      if (error.response) {
        console.log('Error response:', error.response);
        showAlert('Error', error.response.data.message || 'Failed to submit booking. Please try again.', 'error');
      } else {
        showAlert('Error', 'Failed to submit booking. Please try again.', 'error');
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

  const renderTransports = () => (
    <View className="mb-6">
      <Text className="text-gray-700 font-medium mb-3">Select Transport *</Text>
      <ScrollView className="max-h-full">
        {transports.map((transport) => (
          <TouchableOpacity
            key={transport.transport_id}
            onPress={() => setForm(prev => ({ ...prev, transport_id: transport.transport_id }))}
            className={`p-4 mb-4 rounded-xl border ${
              transport.transport_id === form.transport_id 
                ? 'bg-blue-50 border-blue-500' 
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="flex-row items-center">
              <Image
                source={{ uri: transport.image }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
                className="mr-4"
              />
              <View className="flex-1">
                <Text className={`text-base ${
                  transport.transport_id === form.transport_id ? 'text-blue-900 font-medium' : 'text-gray-700'
                }`}>
                  {transport.vehicle_name}
                </Text>
                <Text className={`text-sm ${
                  transport.transport_id === form.transport_id ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  Driver: {transport.driver_name}
                </Text>
                <Text className={`text-sm ${
                  transport.transport_id === form.transport_id ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  Capacity: {transport.capacity}
                </Text>
              </View>
              {transport.transport_id === form.transport_id && (
                <Ionicons name="checkmark-circle" size={24} color="#1E40AF" />
              )}
            </View>
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
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      <View className="shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#48494EFF" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-700">New Transport Booking</Text>
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

          <InputField
            label="Destination *"
            value={form.destination}
            onChangeText={(text: string) => setForm(prev => ({ ...prev, destination: text }))}
            placeholder="Enter destination"
            leftIcon={<Ionicons name="location" size={20} color="#64748B" />}
          />

          {renderTransports()}

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

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} animationIn="fadeIn" animationOut="fadeOut">
        <View className={`flex-col items-center justify-center bg-white rounded-xl p-6 shadow-lg ${alertType === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
          <Ionicons 
            name={alertType === 'error' ? 'close-circle' : 'checkmark-circle'} 
            size={75} 
            color={alertType === 'error' ? 'red' : '#31C48D'} 
          />
          <Text className={`text-xl font-bold mt-1 ${alertType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {alertType === 'error' ? 'Error' : 'Success'}
          </Text>
          <Text className="text-gray-600 ">{alertMessage}</Text>
          <Button mode="contained" onPress={() => setModalVisible(false)} className="mt-4 w-1/2 bg-blue-900 text-white">
            OK
          </Button>
        </View>
      </Modal>

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

export default TransportBooking;
