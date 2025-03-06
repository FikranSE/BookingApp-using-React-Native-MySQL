import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  Modal,
  FlatList,
  TextInput
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

// Custom Alert Component
const CustomAlert = ({ 
  visible, 
  type = 'success',
  title = '', 
  message = '', 
  onClose = () => {},
  autoClose = true,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  // Default colors
  const SUCCESS_COLORS = {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'checkmark-circle'
  };
  
  const ERROR_COLORS = {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'close-circle'
  };
  
  // Info colors
  const INFO_COLORS = {
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    icon: 'information-circle'
  };
  
  // Select the color scheme based on alert type
  const colors = type === 'success' 
    ? SUCCESS_COLORS 
    : type === 'error' 
      ? ERROR_COLORS 
      : INFO_COLORS;

  // Effect to handle auto-close
  useEffect(() => {
    setIsVisible(visible);
    
    // Auto close timer
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-20">
        <View className={`w-11/12 rounded-xl p-5 ${colors.bgLight} ${colors.border} border shadow-lg`}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className={`w-8 h-8 ${colors.bg} rounded-full items-center justify-center mr-3`}>
                <Ionicons name={colors.icon} size={18} color="white" />
              </View>
              <Text className={`${colors.text} font-bold text-lg`}>
                {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {/* Message */}
          <Text className="text-gray-700 mb-4 pl-11">{message}</Text>
          
          {/* Action Button */}
          <TouchableOpacity
            onPress={onClose}
            className={`py-3 ${colors.bg} rounded-lg items-center mt-2`}
          >
            <Text className="text-white font-medium">
              {type === 'error' ? 'Try Again' : 'Got It'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Improved date picker with a cleaner interface
const DatePickerModal = ({ visible, onClose, date, onDateChange }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [activeTab, setActiveTab] = useState('day'); // 'day', 'month', or 'year'
  
  useEffect(() => {
    if (date) {
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          setSelectedYear(dateObj.getFullYear());
          setSelectedMonth(dateObj.getMonth());
          setSelectedDay(dateObj.getDate());
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
  }, [date, visible]);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate 5 years starting from current year
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onDateChange(selectedDate);
    onClose();
  };
  
  // Calculate days of week header (Sun, Mon, Tue, etc.)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Function to render the calendar grid with proper week alignment
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    
    // Create an array for all the day cells, including empty ones for proper alignment
    const days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10 m-1" />);
    }
    
    // Add cells for actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <TouchableOpacity 
          key={i}
          className={`w-10 h-10 items-center justify-center rounded-full m-1 ${
            selectedDay === i 
              ? 'bg-orange-500' 
              : 'bg-gray-100'
          }`}
          onPress={() => setSelectedDay(i)}
        >
          <Text className={`${
            selectedDay === i 
              ? 'text-white' 
              : 'text-gray-800'
          } font-medium`}>{i}</Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white w-11/12 rounded-2xl p-5 shadow-xl">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-lg">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {/* Current selected date display */}
          <View className="bg-sky-50 p-3 rounded-xl mb-4">
            <Text className="text-center text-sky-800 font-medium text-lg">
              {months[selectedMonth]} {selectedDay}, {selectedYear}
            </Text>
          </View>
          
          {/* Navigation tabs */}
          <View className="flex-row mb-4 border-b border-gray-200">
            <TouchableOpacity 
              className={`flex-1 py-2 ${activeTab === 'day' ? 'border-b-2 border-orange-500' : ''}`}
              onPress={() => setActiveTab('day')}
            >
              <Text className={`text-center font-medium ${activeTab === 'day' ? 'text-orange-500' : 'text-gray-500'}`}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-2 ${activeTab === 'month' ? 'border-b-2 border-orange-500' : ''}`}
              onPress={() => setActiveTab('month')}
            >
              <Text className={`text-center font-medium ${activeTab === 'month' ? 'text-orange-500' : 'text-gray-500'}`}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-2 ${activeTab === 'year' ? 'border-b-2 border-orange-500' : ''}`}
              onPress={() => setActiveTab('year')}
            >
              <Text className={`text-center font-medium ${activeTab === 'year' ? 'text-orange-500' : 'text-gray-500'}`}>Year</Text>
            </TouchableOpacity>
          </View>
          
          {/* Content based on active tab */}
          {activeTab === 'day' && (
            <View>
              {/* Month/Year selector for day view */}
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity 
                  className="flex-row items-center bg-sky-50 py-1 px-3 rounded-full"
                  onPress={() => setActiveTab('month')}
                >
                  <Text className="text-sky-800 font-medium">{months[selectedMonth]}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#0EA5E9" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-row items-center bg-sky-50 py-1 px-3 rounded-full"
                  onPress={() => setActiveTab('year')}
                >
                  <Text className="text-sky-800 font-medium">{selectedYear}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
              
              {/* Weekday headers */}
              <View className="flex-row justify-around mb-2">
                {weekDays.map(day => (
                  <Text key={day} className="w-10 text-center text-gray-500 font-medium">{day}</Text>
                ))}
              </View>
              
              {/* Calendar grid */}
              <View className="flex-row flex-wrap justify-center mb-4">
                {renderCalendarGrid()}
              </View>
            </View>
          )}
          
          {activeTab === 'month' && (
            <View className="flex-row flex-wrap justify-center mb-4">
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  className={`w-24 h-12 items-center justify-center m-1 rounded-lg ${
                    selectedMonth === index ? 'bg-orange-500' : 'bg-gray-100'
                  }`}
                  onPress={() => {
                    setSelectedMonth(index);
                    setActiveTab('day');
                  }}
                >
                  <Text className={`${
                    selectedMonth === index ? 'text-white' : 'text-gray-800'
                  } font-medium`}>{month.substring(0, 3)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {activeTab === 'year' && (
            <View className="flex-row flex-wrap justify-center mb-4">
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  className={`w-24 h-12 items-center justify-center m-1 rounded-lg ${
                    selectedYear === year ? 'bg-orange-500' : 'bg-gray-100'
                  }`}
                  onPress={() => {
                    setSelectedYear(year);
                    setActiveTab('day');
                  }}
                >
                  <Text className={`${
                    selectedYear === year ? 'text-white' : 'text-gray-800'
                  } font-medium`}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            onPress={handleConfirm}
            className="mt-2 py-3 bg-orange-500 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">Confirm Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Improved time picker with grid-based selection
const TimePickerModal = ({ visible, onClose, time, onTimeChange, title }) => {
  const [hours, setHours] = useState('09');
  const [minutes, setMinutes] = useState('00');
  const [showHours, setShowHours] = useState(true); // Toggle between hours and minutes view
  
  useEffect(() => {
    if (time) {
      const [h, m] = time.split(':');
      setHours(h || '09');
      setMinutes(m || '00');
    }
  }, [time, visible]);
  
  const handleConfirm = () => {
    const newTime = `${hours}:${minutes}`;
    onTimeChange(newTime);
    onClose();
  };
  
  const renderTimeGrid = (isHours) => {
    const items = isHours 
      ? Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
      : Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    
    const selectedValue = isHours ? hours : minutes;
    
    return (
      <FlatList
        data={items}
        numColumns={6}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`w-14 h-14 items-center justify-center m-1 rounded-lg ${
              selectedValue === item ? 'bg-orange-500' : 'bg-gray-100'
            }`}
            onPress={() => {
              if (isHours) {
                setHours(item);
              } else {
                setMinutes(item);
              }
            }}
          >
            <Text className={`${
              selectedValue === item ? 'text-white' : 'text-gray-800'
            } font-medium text-lg`}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    );
  };
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white w-11/12 rounded-2xl p-5 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 font-bold text-lg">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-center items-center py-3 mb-2">
            <TouchableOpacity
              onPress={() => setShowHours(true)}
              className={`px-5 py-2 rounded-lg mr-2 ${showHours ? 'bg-sky-500' : 'bg-gray-200'}`}
            >
              <Text className={showHours ? 'text-white font-medium' : 'text-gray-700'}>Hours</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowHours(false)}
              className={`px-5 py-2 rounded-lg ml-2 ${!showHours ? 'bg-sky-500' : 'bg-gray-200'}`}
            >
              <Text className={!showHours ? 'text-white font-medium' : 'text-gray-700'}>Minutes</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-center items-center mb-3">
            <TouchableOpacity
              onPress={() => setShowHours(true)}
              className="items-center"
            >
              <Text className={`text-2xl font-medium ${showHours ? 'text-sky-500' : 'text-gray-800'}`}>{hours}</Text>
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-gray-800 mx-2">:</Text>
            
            <TouchableOpacity
              onPress={() => setShowHours(false)}
              className="items-center"
            >
              <Text className={`text-2xl font-medium ${!showHours ? 'text-sky-500' : 'text-gray-800'}`}>{minutes}</Text>
            </TouchableOpacity>
          </View>
          
          <View className="border border-gray-200 rounded-lg p-2 bg-white max-h-56">
            {renderTimeGrid(showHours)}
          </View>
          
          <TouchableOpacity
            onPress={handleConfirm}
            className="mt-4 py-3 bg-orange-500 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">Confirm Time</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SectionHeader = ({ title, icon }) => (
  <View className="flex-row items-center mb-4 mt-4">
    <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
      <Ionicons name={icon} size={18} color="white" />
    </View>
    <Text className="text-gray-800 font-bold text-lg ml-3">{title}</Text>
  </View>
);

// Modern input field component with animation and validation
const ModernTextInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  error, 
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View className="mb-4">
      <View className={`flex-row items-center bg-white border ${error ? 'border-red-500' : isFocused ? 'border-sky-500' : 'border-gray-200'} 
        rounded-xl ${multiline ? 'py-3' : 'py-0'} px-3 shadow-sm`}>
        <MaterialIcons name={icon} size={22} color={isFocused ? "#0EA5E9" : "#94A3B8"} />
        <TextInput
          className={`flex-1 ml-3 text-gray-700 ${multiline ? 'min-h-[80px] text-base py-1' : 'h-12 text-base'}`}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
        />
        {error && (
          <Ionicons name="alert-circle" size={22} color="#EF4444" />
        )}
      </View>
      {error && <Text className="text-red-500 text-xs ml-1 mt-1">{error}</Text>}
    </View>
  );
};

const BookingRoom = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    room_id: null,
    booking_date: new Date(),
    start_time: '',
    end_time: '',
    pic: '',
    section: '',
    description: '',
  });
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Modal visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // Function to show custom alert
  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const authToken = await fetchAuthToken();
        if (!authToken) {
          showAlert('error', 'Not authenticated');
          router.push('/(auth)/sign-in');
          return;
        }

        const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.data && Array.isArray(response.data)) {
          setRooms(response.data);
        } else {
          showAlert('error', 'Invalid room data received.');
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        showAlert('error', 'Failed to load rooms. Please try again.');
      }
    };
    fetchRooms();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
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
      newErrors.room_id = 'Please select a room';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      showAlert('error', firstError);
      return;
    }

    setLoading(true);

    try {
      const authToken = await fetchAuthToken();
      if (!authToken) {
        showAlert('error', 'Not authenticated');
        return;
      }

      // Format the date to the expected format for the API
      const formattedDate = formatDateForAPI(form.booking_date);
      
      const bookingData = {
        ...form,
        booking_date: formattedDate
      };

      const response = await axios.post('https://j9d3hc82-3001.asse.devtunnels.ms/api/room-bookings', bookingData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 201) {
        showAlert('success', 'Booking submitted successfully');
        setTimeout(() => {
          router.replace('/(root)/(tabs)/my-booking');
        }, 2000);
      } else {
        showAlert('error', 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response) {
        showAlert('error', error.response.data.message || 'Failed to submit booking. Please try again.');
      } else {
        showAlert('error', 'Failed to submit booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const isValidTimeRange = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-sky-500 shadow-md rounded-b-3xl">
        <View className="flex-row items-center space-x-3 px-6 pt-6 pb-8">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 justify-center items-center bg-white/20 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Book a Room</Text>
            <Text className="text-white text-opacity-90 mt-1">Reserve a meeting space</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        <View className="mt-6">
          <SectionHeader title="Basic Information" icon="person-outline" />
          
          <ModernTextInput
            icon="person"
            placeholder="Enter person in charge"
            value={form.pic}
            onChangeText={(text) => {
              setForm(prev => ({ ...prev, pic: text }));
              if (errors.pic) {
                setErrors(prev => ({ ...prev, pic: null }));
              }
            }}
            error={errors.pic}
          />
          
          <ModernTextInput
            icon="business"
            placeholder="Enter section name"
            value={form.section}
            onChangeText={(text) => {
              setForm(prev => ({ ...prev, section: text }));
              if (errors.section) {
                setErrors(prev => ({ ...prev, section: null }));
              }
            }}
            error={errors.section}
          />
          
          <ModernTextInput
            icon="description"
            placeholder="Enter meeting description (optional)"
            value={form.description}
            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
            multiline={true}
          />

          <SectionHeader title="Room Selection" icon="business-outline" />
          
          {errors.room_id && <Text className="text-red-500 text-xs mb-2">{errors.room_id}</Text>}
          <View className="mb-6">
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.room_id}
                onPress={() => {
                  setForm(prev => ({ ...prev, room_id: room.room_id }));
                  if (errors.room_id) {
                    setErrors(prev => ({ ...prev, room_id: null }));
                  }
                }}
                className={`p-4 mb-4 rounded-xl border ${
                  room.room_id === form.room_id 
                    ? 'bg-sky-50 border-sky-500' 
                    : 'bg-white border-gray-200'
                } shadow-sm`}
              >
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: room.image }}
                    style={{ width: 60, height: 60, borderRadius: 10 }}
                    className="mr-4"
                  />
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
                  </View>
                  {room.room_id === form.room_id && (
                    <Ionicons name="checkmark-circle" size={24} color="#0EA5E9" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <SectionHeader title="Date & Time" icon="calendar-outline" />
          
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">Booking Date *</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <MaterialIcons name="calendar-today" size={22} color="#0EA5E9" />
              <Text className="ml-3 text-gray-700 font-medium">{formatDateDisplay(form.booking_date)}</Text>
            </TouchableOpacity>
            {errors.booking_date && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.booking_date}</Text>}
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">Start Time *</Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="flex-row items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <MaterialIcons name="access-time" size={22} color="#0EA5E9" />
              <Text className="ml-3 text-gray-700 font-medium">{form.start_time || 'Select start time'}</Text>
            </TouchableOpacity>
            {errors.start_time && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.start_time}</Text>}
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">End Time *</Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="flex-row items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <MaterialIcons name="access-time" size={22} color="#0EA5E9" />
              <Text className="ml-3 text-gray-700 font-medium">{form.end_time || 'Select end time'}</Text>
            </TouchableOpacity>
            {errors.end_time && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.end_time}</Text>}
          </View>

          {/* Alert Component */}
          <CustomAlert
            visible={alertVisible}
            type={alertType}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />

          {/* Date and Time Pickers Modals */}
          <DatePickerModal
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            date={form.booking_date}
            onDateChange={(date) => setForm({ ...form, booking_date: date })}
          />

          <TimePickerModal
            visible={showStartTimePicker}
            onClose={() => setShowStartTimePicker(false)}
            time={form.start_time}
            onTimeChange={(time) => setForm({ ...form, start_time: time })}
            title="Select Start Time"
          />

          <TimePickerModal
            visible={showEndTimePicker}
            onClose={() => setShowEndTimePicker(false)}
            time={form.end_time}
            onTimeChange={(time) => setForm({ ...form, end_time: time })}
            title="Select End Time"
          />
          
          {/* Submit Button with loading state */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-6 py-4 ${loading ? 'bg-sky-400' : 'bg-sky-500'} rounded-xl items-center shadow-md mb-8`}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold text-lg">Submit Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingRoom;