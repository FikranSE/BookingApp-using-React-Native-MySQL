import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Modal,
  FlatList,
  Image
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { images } from "@/constants";

// Custom Alert Component
const CustomAlert = ({ 
  visible, 
  type = 'success', // 'success', 'error', 'info'
  title = '', 
  message = '', 
  onClose = () => {},
  autoClose = true,
  duration = 3000, // Auto close duration in ms
  bookingType = 'ROOM' // 'ROOM' or 'TRANSPORT'
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
  
  // Theme-based info colors
  const INFO_COLORS = bookingType === 'TRANSPORT' 
    ? {
        bg: 'bg-sky-500',
        bgLight: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-200',
        icon: 'information-circle'
      }
    : {
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
  }, [visible]);

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

// Helper function to check if a date is in the past
const isDateInPast = (dateString) => {
  if (!dateString) return false;
  
  // Create date objects without time component for comparison
  const selectedDate = new Date(dateString);
  selectedDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selectedDate < today;
};

// Helper function to check if a time is in the past for today's date
const isTimeInPast = (dateString, timeString) => {
  if (!dateString || !timeString) return false;
  
  // Create date objects for comparison
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const selectedDateTime = new Date(dateString);
  selectedDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  
  return selectedDateTime < now;
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
    
    // Check if the selected date is in the past
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      showAlert('error', 'Please select a date that is not in the past');
      return;
    }
    
    onDateChange(formattedDate);
    onClose();
  };
  
  // Calculate days of week header (Sun, Mon, Tue, etc.)
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Function to render the calendar grid with proper week alignment
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    
    // Determine if we're rendering the current month/year
    const currentDate = new Date();
    const isCurrentMonth = selectedYear === currentDate.getFullYear() && 
                           selectedMonth === currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    // Create an array for all the day cells, including empty ones for proper alignment
    const days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10 m-1" />);
    }
    
    // Add cells for actual days
    for (let i = 1; i <= daysInMonth; i++) {
      // Check if this day is in the past for the current month
      const isPastDay = isCurrentMonth && i < currentDay;
      
      days.push(
        <TouchableOpacity 
          key={i}
          className={`w-10 h-10 items-center justify-center rounded-full m-1 ${
            selectedDay === i 
              ? 'bg-orange-500' 
              : isPastDay 
                ? 'bg-gray-200' 
                : 'bg-gray-100'
          }`}
          onPress={() => {
            if (!isPastDay) {
              setSelectedDay(i);
            } else {
              // Optional: provide feedback that past dates can't be selected
              showAlert('error', 'Cannot select a date in the past');
            }
          }}
          disabled={isPastDay}
        >
          <Text className={`${
            selectedDay === i 
              ? 'text-white' 
              : isPastDay 
                ? 'text-gray-400' 
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
const TimePickerModal = ({ visible, onClose, time, onTimeChange, title, dateString }) => {
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
    
    // Check if the selected time is in the past for today's date
    if (dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDate = new Date(dateString);
      selectedDate.setHours(0, 0, 0, 0);
      
      // Only validate time if the selected date is today
      if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const selectedDateTime = new Date(dateString);
        selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (selectedDateTime < now) {
          showAlert('error', 'Please select a time that is not in the past');
          return;
        }
      }
    }
    
    onTimeChange(newTime);
    onClose();
  };
  
  const isTimeInPast = (hourValue, minuteValue) => {
    // Only check for past times if the date is today
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    // If not today, all times are valid
    if (selectedDate.getTime() !== today.getTime()) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convert to numbers for comparison
    const hour = parseInt(hourValue);
    const minute = parseInt(minuteValue);
    
    return (hour < currentHour || (hour === currentHour && minute < currentMinute));
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
        renderItem={({ item }) => {
          // Check if this time is in the past (when selecting hours)
          const isPastTime = isHours 
            ? isTimeInPast(item, minutes) 
            : isTimeInPast(hours, item);
            
          return (
            <TouchableOpacity
              className={`w-14 h-14 items-center justify-center m-1 rounded-lg ${
                selectedValue === item 
                  ? 'bg-orange-500' 
                  : isPastTime 
                    ? 'bg-gray-200' 
                    : 'bg-gray-100'
              }`}
              onPress={() => {
                if (!isPastTime) {
                  if (isHours) {
                    setHours(item);
                  } else {
                    setMinutes(item);
                  }
                } else {
                  // Optional: provide feedback that past times can't be selected
                  showAlert('error', 'Cannot select a time in the past');
                }
              }}
              disabled={isPastTime}
            >
              <Text className={`${
                selectedValue === item 
                  ? 'text-white' 
                  : isPastTime 
                    ? 'text-gray-400' 
                    : 'text-gray-800'
              } font-medium text-lg`}>{item}</Text>
            </TouchableOpacity>
          );
        }}
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

const RescheduleBooking = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingType, setBookingType] = useState(null); // "ROOM" or "TRANSPORT"
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [destination, setDestination] = useState(""); // For transport bookings
  
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

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
        
        if (!authToken) {
          showAlert('error', 'Not authenticated');
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

        // Try to fetch room booking details first
        try {
          const roomBookingResponse = await axiosInstance.get(`/room-bookings/${id}`);
          setBookingDetails(roomBookingResponse.data);
          setBookingType("ROOM");
          
          // Pre-fill the current booking details for rescheduling
          setNewDate(roomBookingResponse.data.booking_date);
          setNewStartTime(roomBookingResponse.data.start_time);
          setNewEndTime(roomBookingResponse.data.end_time);
        } catch (roomError) {
          // If room booking fetch fails, try transport booking
          try {
            const transportBookingResponse = await axiosInstance.get(`/transport-bookings/${id}`);
            setBookingDetails(transportBookingResponse.data);
            setBookingType("TRANSPORT");
            
            // Pre-fill the current booking details for rescheduling
            setNewDate(transportBookingResponse.data.booking_date);
            setNewStartTime(transportBookingResponse.data.start_time);
            setNewEndTime(transportBookingResponse.data.end_time);
            setDestination(transportBookingResponse.data.destination || "");
          } catch (transportError) {
            // If both fail, show an error
            console.error('Error fetching booking details:', transportError);
            showAlert('error', 'Failed to fetch booking details. Please try again later.');
          }
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        showAlert('error', 'Failed to fetch booking details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleReschedule = async () => {
    if (!id) {
      return;
    }

    // Validate inputs
    if (!newDate || !newStartTime || !newEndTime) {
      showAlert('error', 'Please select date and time for your booking');
      return;
    }
    
    // Validate date is not in the past
    if (isDateInPast(newDate)) {
      showAlert('error', 'Please select a date that is not in the past');
      return;
    }
    
    // Validate time is not in the past for today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(newDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    const isSameDay = selectedDate.getTime() === today.getTime();
    
    if (isSameDay && isTimeInPast(newDate, newStartTime)) {
      showAlert('error', 'Please select a start time that is not in the past');
      return;
    }
    
    // Validate that end time is after start time
    const [startHours, startMinutes] = newStartTime.split(':').map(Number);
    const [endHours, endMinutes] = newEndTime.split(':').map(Number);
    
    if (startHours > endHours || (startHours === endHours && startMinutes >= endMinutes)) {
      showAlert('error', 'End time must be after start time');
      return;
    }

    const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
    
    if (!authToken) {
      showAlert('error', 'Not authenticated');
      router.push('/(auth)/sign-in');
      return;
    }

    try {
      setLoading(true);

      const axiosInstance = axios.create({
        baseURL: 'https://j9d3hc82-3001.asse.devtunnels.ms/api',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Prepare the data for rescheduling
      const updatedBooking = {
        booking_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
      };

      // Add destination for transport bookings
      if (bookingType === "TRANSPORT") {
        updatedBooking.destination = destination;
      }

      // Send the PUT request to the appropriate endpoint based on booking type
      const endpoint = bookingType === "ROOM" ? `/room-bookings/${id}` : `/transport-bookings/${id}`;
      await axiosInstance.put(endpoint, updatedBooking);

      showAlert('success', 'Booking rescheduled successfully');
      
      // Navigate after a brief delay to allow the user to see the success message
      setTimeout(() => {
        const redirectPage = bookingType === "ROOM" ? '/(root)/(tabs)/my-booking' : '/(root)/(tabs)/my-booking';
        router.replace(redirectPage);
      }, 1500);
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      showAlert('error', 'Failed to reschedule booking. Please try again later.');
    } finally {
      setLoading(false);
    }
  }; 

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  };

  // Get color theme based on booking type
  const getThemeColors = () => {
    return bookingType === "TRANSPORT" 
      ? {
          primary: "bg-sky-500",
          secondary: "bg-sky-100",
          text: "text-sky-800",
          icon: "car-outline"
        } 
      : {
          primary: "bg-sky-500",
          secondary: "bg-sky-100",
          text: "text-sky-800",
          icon: "business-outline"
        };
  };

  const theme = getThemeColors();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!bookingDetails) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600 text-lg">Booking not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className={`flex-row items-center space-x-3 ${theme.primary} px-6 pt-12 pb-8 rounded-b-3xl shadow-lg`}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 justify-center items-center bg-white/20 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Reschedule {bookingType === "TRANSPORT" ? "Transport" : "Room"}</Text>
            <Text className="text-white text-opacity-90 mt-1">Update your {bookingType === "TRANSPORT" ? "transport" : "room"} reservation</Text>
          </View>
        </View>

        {/* Current Booking Card */}
        <View className="mx-5 -mt-5 bg-white p-5 rounded-2xl border border-sky-100 shadow-lg">
          <Text className={`${theme.text} font-bold mb-3 text-lg`}>Current Reservation</Text>
          
          {bookingType === "TRANSPORT" && (
            <View className="mb-4">
              <View className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  source={bookingDetails.image ? { uri: bookingDetails.image } : images.profile1}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
                  <Ionicons name="car-outline" size={22} color="#0EA5E9" />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Vehicle</Text>
                  <Text className="text-gray-800 font-medium text-base">{bookingDetails.vehicle_name || "N/A"}</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
                  <Ionicons name="navigate-outline" size={22} color="#0EA5E9" />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Destination</Text>
                  <Text className="text-gray-800 font-medium text-base">{bookingDetails.destination || "N/A"}</Text>
                </View>
              </View>
            </View>
          )}
          
          <View className="flex-row items-center mb-4">
            <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
              <Ionicons name="calendar-outline" size={22} color="#0EA5E9" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Date</Text>
              <Text className="text-gray-800 font-medium text-base">{formatDate(bookingDetails.booking_date)}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-4">
            <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
              <Ionicons name="time-outline" size={22} color="#0EA5E9" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Start Time</Text>
              <Text className="text-gray-800 font-medium text-base">{bookingDetails.start_time}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
              <Ionicons name="time-outline" size={22} color="#0EA5E9" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">End Time</Text>
              <Text className="text-gray-800 font-medium text-base">{bookingDetails.end_time}</Text>
            </View>
          </View>
        </View>

        {/* New Booking Form */}
        <View className="mx-5 mt-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
              <Text className="text-white font-bold">1</Text>
            </View>
            <Text className="text-gray-800 font-bold text-lg ml-3">New Details</Text>
          </View>
          
          {bookingType === "TRANSPORT" && (
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium">Destination</Text>
              <View className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <MaterialIcons name="location-on" size={22} color="#F97316" />
                <Text className="ml-3 text-gray-700">{destination}</Text>
              </View>
            </View>
          )}
          
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">New Date</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="event" size={22} color="#F97316" />
              <Text className="ml-3 text-gray-700">{formatDate(newDate) || "Select date"}</Text>
              <View className="ml-auto">
                <MaterialIcons name="arrow-drop-down" size={24} color="#F97316" />
              </View>
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">New Start Time</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              onPress={() => setShowStartTimePicker(true)}
            >
              <MaterialIcons name="access-time" size={22} color="#F97316" />
              <Text className="ml-3 text-gray-700">{newStartTime || "Select start time"}</Text>
              <View className="ml-auto">
                <MaterialIcons name="arrow-drop-down" size={24} color="#F97316" />
              </View>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">New End Time</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              onPress={() => setShowEndTimePicker(true)}
            >
              <MaterialIcons name="access-time" size={22} color="#F97316" />
              <Text className="ml-3 text-gray-700">{newEndTime || "Select end time"}</Text>
              <View className="ml-auto">
                <MaterialIcons name="arrow-drop-down" size={24} color="#F97316" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Section */}
        <View className="mx-5 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-gray-800 font-bold text-lg ml-3">Confirm Changes</Text>
          </View>
          
          <View className={`${theme.secondary} p-4 rounded-xl mb-5`}>
            <Text className={`${theme.text} text-sm`}>
              Please review your new booking details before confirming the changes. 
              Rescheduling may be subject to availability.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at Bottom */}
      <View className="px-5 py-4 bg-white border-t border-gray-100 shadow-lg">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 py-4 rounded-xl border border-sky-100 items-center justify-center bg-white"
          >
            <Text className={`${theme.text} font-semibold`}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleReschedule}
            className={`flex-1 py-4 rounded-xl ${theme.primary} items-center justify-center shadow-md`}
          >
            <Text className="text-white font-semibold">Confirm Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Date Picker Modal */}
      <DatePickerModal 
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        date={newDate}
        onDateChange={setNewDate}
      />

      {/* Custom Time Picker Modals */}
      <TimePickerModal 
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        time={newStartTime}
        onTimeChange={setNewStartTime}
        title="Select Start Time"
        dateString={newDate}
      />

      <TimePickerModal 
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        time={newEndTime}
        onTimeChange={setNewEndTime}
        title="Select End Time"
        dateString={newDate}
      />
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        bookingType={bookingType}
      />
    </View>
  );
};

export default RescheduleBooking;