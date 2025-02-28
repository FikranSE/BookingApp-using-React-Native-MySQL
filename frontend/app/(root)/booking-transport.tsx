import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import InputField from '@/components/Inputfield_form';
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

interface TransportBookingForm {
  transport_id: number | null;
  booking_date: Date;
  start_time: string;
  end_time: string;
  pic: string;
  section: string;
  description: string;
  destination: string;
}

interface Transport {
  transport_id: number;
  vehicle_name: string;
  driver_name: string;
  capacity: number;
  image: string;
}

// Generate time options for picker (from 00:00 to 23:59 with 30 min intervals)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      options.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return options;
};

// Generate month options
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate year options (current year and next 5 years)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear + index);
};

// Generate day options (1-31)
const generateDayOptions = (year: number, month: number) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) => index + 1);
};

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
    destination: '',
  });
  const [transports, setTransports] = useState<Transport[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Time options for picker
  const timeOptions = generateTimeOptions();

  // States for custom date and time pickers
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showStartTimePickerModal, setShowStartTimePickerModal] = useState(false);
  const [showEndTimePickerModal, setShowEndTimePickerModal] = useState(false);
  
  // Date picker state
  const [selectedDay, setSelectedDay] = useState(form.booking_date.getDate());
  const [selectedMonth, setSelectedMonth] = useState(form.booking_date.getMonth());
  const [selectedYear, setSelectedYear] = useState(form.booking_date.getFullYear());

  // Days options based on selected month and year
  const [dayOptions, setDayOptions] = useState(generateDayOptions(selectedYear, selectedMonth));
  
  // Alert modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Update day options when month or year changes
  useEffect(() => {
    setDayOptions(generateDayOptions(selectedYear, selectedMonth));
    // If the selected day exceeds the new max, adjust it
    const maxDay = generateDayOptions(selectedYear, selectedMonth).length;
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedMonth, selectedYear]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.pic.trim()) {
      newErrors.pic = 'PIC name is required';
    }
    
    if (!form.section.trim()) {
      newErrors.section = 'Section is required';
    }
    
    if (!form.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (form.transport_id === null) {
      newErrors.transport_id = 'Please select a transport';
    }
    
    if (!form.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!form.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (form.start_time && !isValidTimeRange(form.start_time, form.end_time)) {
      newErrors.end_time = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show first error
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

      const response = await axios.post('https://j9d3hc82-3001.asse.devtunnels.ms/api/transport-bookings', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 201) {
        showAlert('Success', 'Booking submitted successfully', 'success');
        setTimeout(() => {
          router.replace('/(root)/(tabs)/my-booking');
        }, 2000);
      } else {
        showAlert('Error', 'Unexpected response from server', 'error');
      }
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

  // Function to confirm date selection
  const confirmDateSelection = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    setForm(prev => ({ ...prev, booking_date: newDate }));
    setShowDatePickerModal(false);
  };

  // Function to confirm start time selection
  const confirmStartTimeSelection = (time: string) => {
    setForm(prev => ({ ...prev, start_time: time }));
    setShowStartTimePickerModal(false);
  };

  // Function to confirm end time selection
  const confirmEndTimeSelection = (time: string) => {
    setForm(prev => ({ ...prev, end_time: time }));
    setShowEndTimePickerModal(false);
  };
  
  const SectionHeader = ({ title }: { title: string }) => (
    <View className="flex-row items-center mb-4 mt-2">
      <View className="flex-1 h-px bg-sky-200" />
      <Text className="mx-4 text-sky-600 font-medium">{title}</Text>
      <View className="flex-1 h-px bg-sky-200" />
    </View>
  );
  
  const renderTransports = () => (
    <View className="mb-6">
      <Text className="text-sky-700 font-medium mb-3">Select Transport *</Text>
      {errors.transport_id && <Text className="text-orange-500 mb-2 text-xs">{errors.transport_id}</Text>}
      <ScrollView className="max-h-full">
        {transports.map((transport) => (
          <TouchableOpacity
            key={transport.transport_id}
            onPress={() => {
              setForm(prev => ({ ...prev, transport_id: transport.transport_id }));
              // Clear error when a selection is made
              if (errors.transport_id) {
                setErrors(prev => ({ ...prev, transport_id: undefined }));
              }
            }}
            className={`p-4 mb-4 rounded-xl border ${
              transport.transport_id === form.transport_id 
                ? 'bg-sky-50 border-sky-500' 
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
                  transport.transport_id === form.transport_id ? 'text-sky-900 font-medium' : 'text-gray-700'
                }`}>
                  {transport.vehicle_name}
                </Text>
                <Text className={`text-sm ${
                  transport.transport_id === form.transport_id ? 'text-sky-700' : 'text-gray-500'
                }`}>
                  Driver: {transport.driver_name}
                </Text>
                <Text className={`text-sm ${
                  transport.transport_id === form.transport_id ? 'text-sky-700' : 'text-gray-500'
                }`}>
                  Capacity: {transport.capacity}
                </Text>
              </View>
              {transport.transport_id === form.transport_id && (
                <Ionicons name="checkmark-circle" size={24} color="#0EA5E9" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
          <Text className="text-lg font-bold text-white">New Transport Booking</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-sky-100">
          <SectionHeader title="BASIC INFORMATION" />
          
          <View className="mb-4">
            <Text className="text-sky-700 font-medium mb-2">PIC Name *</Text>
            {errors.pic && <Text className="text-orange-500 mb-1 text-xs">{errors.pic}</Text>}
            <View className={`flex-row items-center border ${errors.pic ? 'border-orange-500' : 'border-gray-200'} rounded-xl px-3 py-2 bg-sky-50`}>
              <Ionicons name="person" size={20} color="#0EA5E9" />
              <InputField
                value={form.pic}
                onChangeText={(text: string) => {
                  setForm(prev => ({ ...prev, pic: text }));
                  if (text.trim() && errors.pic) {
                    setErrors(prev => ({ ...prev, pic: undefined }));
                  }
                }}
                placeholder="Enter person in charge"
                containerStyle={{ flex: 1, marginLeft: 8, borderWidth: 0 }}
                style={{ backgroundColor: 'transparent', borderWidth: 0 }}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sky-700 font-medium mb-2">Section *</Text>
            {errors.section && <Text className="text-orange-500 mb-1 text-xs">{errors.section}</Text>}
            <View className={`flex-row items-center border ${errors.section ? 'border-orange-500' : 'border-gray-200'} rounded-xl px-3 py-2 bg-sky-50`}>
              <Ionicons name="pencil" size={20} color="#0EA5E9" />
              <InputField
                value={form.section}
                onChangeText={(text: string) => {
                  setForm(prev => ({ ...prev, section: text }));
                  if (text.trim() && errors.section) {
                    setErrors(prev => ({ ...prev, section: undefined }));
                  }
                }}
                placeholder="Enter section name"
                containerStyle={{ flex: 1, marginLeft: 8, borderWidth: 0 }}
                style={{ backgroundColor: 'transparent', borderWidth: 0 }}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sky-700 font-medium mb-2">Destination *</Text>
            {errors.destination && <Text className="text-orange-500 mb-1 text-xs">{errors.destination}</Text>}
            <View className={`flex-row items-center border ${errors.destination ? 'border-orange-500' : 'border-gray-200'} rounded-xl px-3 py-2 bg-sky-50`}>
              <Ionicons name="location" size={20} color="#0EA5E9" />
              <InputField
                value={form.destination}
                onChangeText={(text: string) => {
                  setForm(prev => ({ ...prev, destination: text }));
                  if (text.trim() && errors.destination) {
                    setErrors(prev => ({ ...prev, destination: undefined }));
                  }
                }}
                placeholder="Enter destination"
                containerStyle={{ flex: 1, marginLeft: 8, borderWidth: 0 }}
                style={{ backgroundColor: 'transparent', borderWidth: 0 }}
              />
            </View>
          </View>

          {renderTransports()}

          <SectionHeader title="DATE & TIME" />

          <View className="mb-6">
            <Text className="text-sky-700 font-medium mb-3">Booking Date *</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePickerModal(true)}
              className="flex-row items-center space-x-2 bg-sky-50 border border-gray-200 rounded-xl p-4"
            >
              <Ionicons name="calendar" size={20} color="#0EA5E9" className="mr-3" />
              <Text className="text-gray-900">{form.booking_date.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-6 space-x-4">
            <View className="flex-1">
              <Text className="text-sky-700 font-medium mb-2">Start Time *</Text>
              {errors.start_time && <Text className="text-orange-500 mb-1 text-xs">{errors.start_time}</Text>}
              <TouchableOpacity 
                onPress={() => setShowStartTimePickerModal(true)}
                className={`flex-row items-center space-x-2 bg-sky-50 border ${errors.start_time ? 'border-orange-500' : 'border-gray-200'} rounded-xl p-4`}
              >
                <Ionicons name="time" size={20} color="#0EA5E9" className="mr-3" />
                <Text className="text-gray-900">{form.start_time || 'Select time'}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <Text className="text-sky-700 font-medium mb-2">End Time *</Text>
              {errors.end_time && <Text className="text-orange-500 mb-1 text-xs">{errors.end_time}</Text>}
              <TouchableOpacity 
                onPress={() => setShowEndTimePickerModal(true)}
                className={`flex-row items-center space-x-2 bg-sky-50 border ${errors.end_time ? 'border-orange-500' : 'border-gray-200'} rounded-xl p-4`}
              >
                <Ionicons name="time" size={20} color="#0EA5E9" className="mr-3" />
                <Text className="text-gray-900">{form.end_time || 'Select time'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <SectionHeader title="ADDITIONAL DETAILS" />

          <View className="mb-4">
            <Text className="text-sky-700 font-medium mb-2">Description</Text>
            <View className="border border-gray-200 rounded-xl p-3 bg-sky-50">
              <InputField
                value={form.description}
                onChangeText={(text: string) => setForm(prev => ({ ...prev, description: text }))}
                placeholder="Enter booking description (optional)"
                multiline
                numberOfLines={4}
                style={{ backgroundColor: 'transparent', borderWidth: 0, height: 100, textAlignVertical: 'top' }}
                containerStyle={{ borderWidth: 0 }}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-orange-500 py-4 rounded-xl mb-6 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? ( 
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-base">Submit Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <Modal isVisible={showDatePickerModal} onBackdropPress={() => setShowDatePickerModal(false)} animationIn="fadeIn" animationOut="fadeOut">
        <View className="bg-white rounded-xl p-4">
          <Text className="text-sky-700 font-bold text-lg text-center mb-4">Select Date</Text>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-sky-700 text-center">Day</Text>
              <Picker selectedValue={selectedDay} onValueChange={(itemValue) => setSelectedDay(itemValue)}>
                {dayOptions.map((day) => (
                  <Picker.Item key={day} label={day.toString()} value={day} />
                ))}
              </Picker>
            </View>
            <View className="flex-1">
              <Text className="text-sky-700 text-center">Month</Text>
              <Picker selectedValue={selectedMonth} onValueChange={(itemValue) => setSelectedMonth(itemValue)}>
                {MONTHS.map((month, index) => (
                  <Picker.Item key={index} label={month} value={index} />
                ))}
              </Picker>
            </View>
            <View className="flex-1">
              <Text className="text-sky-700 text-center">Year</Text>
              <Picker selectedValue={selectedYear} onValueChange={(itemValue) => setSelectedYear(itemValue)}>
                {generateYearOptions().map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year} />
                ))}
              </Picker>
            </View>
          </View>
          <View className="flex-row mt-2 space-x-2">
            <TouchableOpacity 
              onPress={() => setShowDatePickerModal(false)}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={confirmDateSelection}
              className="flex-1 bg-sky-500 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Start Time Picker Modal */}
      <Modal isVisible={showStartTimePickerModal} onBackdropPress={() => setShowStartTimePickerModal(false)}>
        <View className="bg-white rounded-xl p-4">
          <Text className="text-sky-700 font-bold text-lg text-center mb-4">Select Start Time</Text>
          <Picker
            selectedValue={form.start_time}
            onValueChange={(itemValue) => setForm(prev => ({ ...prev, start_time: itemValue }))}
          >
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
          <View className="flex-row mt-2 space-x-2">
            <TouchableOpacity 
              onPress={() => setShowStartTimePickerModal(false)}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => confirmStartTimeSelection(form.start_time)}
              className="flex-1 bg-sky-500 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom End Time Picker Modal */}
      <Modal isVisible={showEndTimePickerModal} onBackdropPress={() => setShowEndTimePickerModal(false)}>
        <View className="bg-white rounded-xl p-4">
          <Text className="text-sky-700 font-bold text-lg text-center mb-4">Select End Time</Text>
          <Picker
            selectedValue={form.end_time}
            onValueChange={(itemValue) => setForm(prev => ({ ...prev, end_time: itemValue }))}
          >
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
          <View className="flex-row mt-2 space-x-2">
            <TouchableOpacity 
              onPress={() => setShowEndTimePickerModal(false)}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => confirmEndTimeSelection(form.end_time)}
              className="flex-1 bg-sky-500 py-3 rounded-lg"
            >
              <Text className="text-center font-semibold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} animationIn="fadeIn" animationOut="fadeOut">
        <View className={`flex-col items-center justify-center bg-white rounded-xl p-6 shadow-lg ${alertType === 'error' ? 'border-orange-500' : 'border-sky-500'}`}>
          <Ionicons 
            name={alertType === 'error' ? 'close-circle' : 'checkmark-circle'} 
            size={75} 
            color={alertType === 'error' ? '#F97316' : '#0EA5E9'} 
          />
          <Text 
            className={`text-xl font-bold mt-1 ${alertType === 'error' ? 'text-orange-500' : 'text-sky-500'}`}
          >
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

export default TransportBooking;