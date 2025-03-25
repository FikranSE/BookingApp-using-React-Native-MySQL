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

// ==================
// Custom Alert Component
// ==================
const CustomAlert = ({ 
  visible, 
  type = 'success',
  title = '', 
  message = '', 
  onClose = () => {},
  autoClose = true,
  duration = 3000,
  bookingType = 'ROOM'
}) => {
  const [isVisible, setIsVisible] = useState(visible);

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
  
  const INFO_COLORS = {
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    icon: 'information-circle'
  };
  
  const colors = type === 'success' ? SUCCESS_COLORS : type === 'error' ? ERROR_COLORS : INFO_COLORS;

  useEffect(() => {
    setIsVisible(visible);
    if (visible && autoClose) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-20">
        <View className={`w-11/12 rounded-xl p-5 ${colors.bgLight} ${colors.border} border shadow-lg`}>
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
          <Text className="text-gray-700 mb-4 pl-11">{message}</Text>
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


const getBookedDates = (existingBookings: any[] = []) => {
  if (!existingBookings || existingBookings.length === 0) return {};
  
  const bookedDatesMap: Record<string, boolean> = {};
  
  existingBookings.forEach(booking => {
    if (booking.booking_date) {
      const date = booking.booking_date;
      bookedDatesMap[date] = true;
    }
  });
  
  return bookedDatesMap;
};
const timeToMinutes = (timeString: string) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const validateBookingAvailability = async () => {
  // Basic validations first
  if (!newDate || !newStartTime || !newEndTime) {
    showAlert("error", "Please select date and time for your booking");
    return false;
  }
  
  if (isDateInPast(newDate)) {
    showAlert("error", "Please select a date that is not in the past");
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(newDate);
  selectedDate.setHours(0, 0, 0, 0);
  
  if (selectedDate.getTime() === today.getTime() && isTimeInPast(newDate, newStartTime)) {
    showAlert("error", "Please select a start time that is not in the past");
    return false;
  }
  
  // Validate time formats and sequence
  const [startHours, startMinutes] = newStartTime.split(":").map(Number);
  const [endHours, endMinutes] = newEndTime.split(":").map(Number);
  
  if (startHours > endHours || (startHours === endHours && startMinutes >= endMinutes)) {
    showAlert("error", "End time must be after start time");
    return false;
  }
  
  // Only check for conflicts if we actually found existing bookings
  if (existingBookings.length > 0) {
    console.log(`Checking for conflicts among ${existingBookings.length} existing bookings on ${newDate}`);
    
    // Check for any conflicts with existing bookings
    if (hasTimeConflict(newDate, newStartTime, newEndTime, existingBookings, id)) {
      const conflict = getConflictDetails(newDate, newStartTime, newEndTime, existingBookings, id);
      let errorMessage =
        bookingType === "ROOM"
          ? "Booking time conflicts with another reservation for this room"
          : "Booking time conflicts with another transport reservation";
      
      if (conflict) {
        errorMessage += ` (${conflict.startTime} - ${conflict.endTime})`;
        
        // Add details about who booked the conflicting slot if available
        if (conflict.pic) {
          errorMessage += `, booked by ${conflict.pic}`;
        }
        
        if (conflict.section) {
          errorMessage += ` from ${conflict.section}`;
        }
      }
      
      showAlert("error", errorMessage);
      return false;
    }
  } else {
    console.log("No existing bookings to check for conflicts");
  }
  
  // Calculate duration in minutes
  const startTimeMinutes = timeToMinutes(newStartTime);
  const endTimeMinutes = timeToMinutes(newEndTime);
  const durationMinutes = endTimeMinutes - startTimeMinutes;
  
  // Check if booking duration is reasonable
  if (durationMinutes > 8 * 60) { // 8 hours
    showAlert("warning", "Your booking is quite long (over 8 hours). Please confirm this is correct.");
    // Not blocking, just warning
  }
  
  // Business hours check (common for most resources)
  const businessStartTime = "08:00";
  const businessEndTime = "17:00";
  
  if (newStartTime < businessStartTime || newEndTime > businessEndTime) {
    // Just log this but don't block - allows for legitimate after-hours bookings
    console.log("Booking is outside standard business hours");
  }
  
  // Resource-specific validations
  if (bookingType === "ROOM" && bookingDetails.room_details) {
    try {
      // Check if room has specific availability restrictions
      const roomDetails = bookingDetails.room_details;
      
      // Example: Check if room is available on weekends
      const bookingDay = new Date(newDate).getDay();
      if ((bookingDay === 0 || bookingDay === 6) && roomDetails.weekend_available === false) {
        showAlert("error", "This room is not available for booking on weekends");
        return false;
      }
      
      // Check operating hours if available
      if (roomDetails.operating_hours) {
        const { open_time, close_time } = roomDetails.operating_hours;
        if (open_time && close_time) {
          if (newStartTime < open_time) {
            showAlert("error", `This room is only available starting from ${open_time}`);
            return false;
          }
          
          if (newEndTime > close_time) {
            showAlert("error", `This room must be vacated by ${close_time}`);
            return false;
          }
        }
      }
    } catch (error) {
      console.log("Error during room-specific validation:", error);
      // Continue with booking process even if validation fails
    }
  } else if (bookingType === "TRANSPORT" && bookingDetails.vehicle_details) {
    try {
      // Check if vehicle has specific availability restrictions
      const vehicleDetails = bookingDetails.vehicle_details;
      
      // Example: Check if vehicle is in maintenance
      if (vehicleDetails.maintenance_status === "active") {
        showAlert("error", "This vehicle is currently under maintenance");
        return false;
      }
      
      // Example: Check if driver is available (if applicable)
      if (vehicleDetails.requires_driver && !vehicleDetails.driver_available) {
        showAlert("error", "No driver is available for this vehicle during selected time");
        return false;
      }
    } catch (error) {
      console.log("Error during vehicle-specific validation:", error);
      // Continue with booking process even if validation fails
    }
  }
  
  return true;
};

const hasBookingsOnDate = (date: string, existingBookings: any[] = []) => {
  if (!date || existingBookings.length === 0) return false;
  const formattedDate = formatApiDate(new Date(date));
  return existingBookings.some(booking => booking.booking_date === formattedDate);
};

// Function to get all bookings for a specific date
const getBookingsForDate = (date: string, existingBookings: any[] = [], currentBookingId: any = null) => {
  if (!date || existingBookings.length === 0) return [];
  const formattedDate = formatApiDate(new Date(date));
  return existingBookings.filter(b => 
    b.booking_date === formattedDate && (currentBookingId === null || b.id !== currentBookingId)
  );
};

const hasTimeConflict = (
  bookingDate: string,
  startTime: string,
  endTime: string,
  existingBookings: any[] = [],
  currentBookingId: any = null
) => {
  if (!bookingDate || !startTime || !endTime || existingBookings.length === 0) return false;
  const formattedDate = formatApiDate(new Date(bookingDate));
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Filter to only include bookings on the selected date and exclude the current booking
  const bookingsOnDate = existingBookings.filter(b => 
    b.booking_date === formattedDate && (currentBookingId === null || b.id !== currentBookingId)
  );
  
  // Return true if there's any time conflict with existing bookings
  return bookingsOnDate.some(booking => {
    const bookingStart = timeToMinutes(booking.start_time);
    const bookingEnd = timeToMinutes(booking.end_time);
    return (
      (startMinutes >= bookingStart && startMinutes < bookingEnd) ||
      (endMinutes > bookingStart && endMinutes <= bookingEnd) ||
      (startMinutes <= bookingStart && endMinutes >= bookingEnd)
    );
  });
};

const getConflictDetails = (
  bookingDate: string,
  startTime: string,
  endTime: string,
  existingBookings: any[] = [],
  currentBookingId: any = null
) => {
  if (!bookingDate || !startTime || !endTime || existingBookings.length === 0) return null;
  const formattedDate = formatApiDate(new Date(bookingDate));
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Filter to only include bookings on the selected date and exclude the current booking
  const bookingsOnDate = existingBookings.filter(b => 
    b.booking_date === formattedDate && (currentBookingId === null || b.id !== currentBookingId)
  );
  
  // Find the conflicting booking
  const conflictingBooking = bookingsOnDate.find(booking => {
    const bookingStart = timeToMinutes(booking.start_time);
    const bookingEnd = timeToMinutes(booking.end_time);
    return (
      (startMinutes >= bookingStart && startMinutes < bookingEnd) ||
      (endMinutes > bookingStart && endMinutes <= bookingEnd) ||
      (startMinutes <= bookingStart && endMinutes >= bookingEnd)
    );
  });
  
  if (conflictingBooking) {
    return {
      bookingId: conflictingBooking.id || conflictingBooking.booking_id,
      startTime: conflictingBooking.start_time,
      endTime: conflictingBooking.end_time,
      pic: conflictingBooking.pic || "Unknown",
      section: conflictingBooking.section || "Unknown",
      bookingDate: conflictingBooking.booking_date
    };
  }
  return null;
};

const isDateInPast = (date: string | Date) => {
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate < today;
};

const isTimeInPast = (date: string | Date, timeString: string) => {
  if (!date || !timeString) return false;
  const [hours, minutes] = timeString.split(":").map(Number);
  const selectedDateTime = new Date(date);
  selectedDateTime.setHours(hours, minutes, 0, 0);
  const now = new Date();
  return selectedDateTime < now;
};

const formatApiDate = (date: Date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidTimeRange = (start: string, end: string) => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  if (startHour > endHour) return false;
  if (startHour === endHour && startMinute >= endMinute) return false;
  return true;
};


const DatePickerModal = ({ 
  visible, 
  onClose, 
  date, 
  onDateChange, 
  existingBookings = [] 
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [bookedDates, setBookedDates] = useState({});

  // Set up selected date when component mounts or date changes
  useEffect(() => {
    if (date && visible) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        if (isDateInPast(dateObj)) {
          setSelectedYear(today.getFullYear());
          setSelectedMonth(today.getMonth());
          setSelectedDay(today.getDate());
        } else {
          setSelectedYear(dateObj.getFullYear());
          setSelectedMonth(dateObj.getMonth());
          setSelectedDay(dateObj.getDate());
        }
      }
    }
  }, [date, visible]);

  // Process existingBookings to identify booked dates
  useEffect(() => {
    if (!visible) return; // Only process when modal is visible
    
    // Log the incoming data to verify what we're working with
    console.log(`Processing ${existingBookings.length} bookings to mark dates`);
    
    // Create a map of dates that have bookings
    const bookedDatesMap = {};
    
    if (existingBookings && existingBookings.length > 0) {
      existingBookings.forEach(booking => {
        if (booking.booking_date) {
          const dateKey = booking.booking_date;
          bookedDatesMap[dateKey] = true;
        }
      });
    }
    
    console.log(`Marked ${Object.keys(bookedDatesMap).length} dates as booked`);
    setBookedDates(bookedDatesMap);
  }, [existingBookings, visible]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    
    if (isDateInPast(new Date(selectedYear, selectedMonth, selectedDay))) {
      onClose();
      return;
    }
    
    onDateChange(formattedDate);
    onClose();
  };

  // Function to check if a specific date has any bookings
  const isDateBooked = (year, month, day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookedDates[formattedDate] === true;
  };

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const renderCalendarGrid = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    // Empty cells for days of the week before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10 m-1" />);
    }

    // Render each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(selectedYear, selectedMonth, i);
      const isPastDate = isDateInPast(currentDate);
      const hasBookings = isDateBooked(selectedYear, selectedMonth, i);
      
      let bgColor = "bg-gray-100";
      let textColor = "text-gray-800";
      
      if (selectedDay === i) {
        bgColor = "bg-orange-500";
        textColor = "text-white";
      } else if (isPastDate) {
        bgColor = "bg-gray-200";
        textColor = "text-gray-400";
      } else if (hasBookings) {
        // Highlight dates with existing bookings
        bgColor = "bg-red-100";
        textColor = "text-red-800";
      }
      
      days.push(
        <TouchableOpacity
          key={i}
          className={`w-10 h-10 items-center justify-center rounded-full m-1 ${bgColor}`}
          onPress={() => {
            if (!isPastDate) {
              setSelectedDay(i);
            }
          }}
          disabled={isPastDate}
        >
          <Text className={textColor}>{i}</Text>
          {hasBookings && (
            <View className="absolute bottom-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </TouchableOpacity>
      );
    }
    return days;
  };

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white w-11/12 rounded-2xl p-5 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 font-bold text-lg">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {/* Date selection status */}
          <View className="bg-sky-50 p-3 rounded-xl mb-4">
            <Text className="text-center text-sky-800 font-medium text-lg">
              {months[selectedMonth]} {selectedDay}, {selectedYear}
            </Text>
          </View>
          
          {/* Legend for booked dates */}
          <View className="flex-row justify-center items-center mb-4 bg-gray-50 p-2 rounded-lg">
            <View className="flex-row items-center mr-4">
              <View className="w-3 h-3 bg-red-100 rounded-full mr-2" />
              <Text className="text-gray-600 text-xs">Booked dates</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
              <Text className="text-gray-600 text-xs">Selected date</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="chevron-back" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text className="text-gray-800 font-medium text-lg">
              {months[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="chevron-forward" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-around mb-2">
            {weekDays.map(day => (
              <Text key={day} className="w-10 text-center font-medium text-gray-500">
                {day}
              </Text>
            ))}
          </View>
          <View className="flex-row flex-wrap justify-around">
            {renderCalendarGrid()}
          </View>
          <View className="mt-4 flex-row">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 bg-gray-200 rounded-lg items-center mr-2"
            >
              <Text className="text-gray-800 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 py-3 bg-orange-500 rounded-lg items-center ml-2"
            >
              <Text className="text-white font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================
// TimePickerModal Component
// ==================
const TimePickerModal = ({ 
  visible, 
  onClose, 
  time, 
  onTimeChange, 
  title, 
  dateString,
  existingBookings = [],
  currentBookingId = null,
  onAlert = () => {} // Add a prop for alert function with default empty function
}) => {
  const now = new Date();
  const [hours, setHours] = useState("09");
  const [minutes, setMinutes] = useState("00");
  const [showHours, setShowHours] = useState(true);
  const [conflictingSlots, setConflictingSlots] = useState({});

  const isToday = () => {
    if (!dateString) return false;
    const today = new Date();
    const bookingDate = new Date(dateString);
    return (
      today.getDate() === bookingDate.getDate() &&
      today.getMonth() === bookingDate.getMonth() &&
      today.getFullYear() === bookingDate.getFullYear()
    );
  };

  useEffect(() => {
    if (time && visible) {
      const [h, m] = time.split(":");
      setHours(h || "09");
      setMinutes(m || "00");
    } else if (visible) {
      const defaultHour = (now.getHours() + 1).toString().padStart(2, "0");
      setHours(defaultHour);
      setMinutes("00");
    }
  }, [time, visible]);

  // Calculate conflicting time slots based on existing bookings
  useEffect(() => {
    if (!dateString || !visible || existingBookings.length === 0) {
      setConflictingSlots({});
      return;
    }

    const formattedDate = formatApiDate(new Date(dateString));
    const bookingsOnDate = existingBookings.filter(b => 
      b.booking_date === formattedDate && (currentBookingId === null || b.id !== currentBookingId)
    );

    // Generate map of conflicting hours
    const conflicts = {};
    
    // Mark each hour that has a booking
    bookingsOnDate.forEach(booking => {
      const startTime = booking.start_time;
      const endTime = booking.end_time;
      
      if (startTime && endTime) {
        const [startHour] = startTime.split(':').map(Number);
        const [endHour] = endTime.split(':').map(Number);
        
        // Mark all hours from start to end as conflicting
        for (let h = startHour; h <= endHour; h++) {
          conflicts[h.toString().padStart(2, '0')] = true;
        }
      }
    });
    
    setConflictingSlots(conflicts);
  }, [dateString, existingBookings, currentBookingId, visible]);

  const handleConfirm = () => {
    const newTime = `${hours}:${minutes}`;
    
    if (isToday()) {
      const selectedTime = new Date();
      selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (selectedTime < now) {
        onAlert("error", "Cannot select a time that has already passed");
        return;
      }
    }
    
    // Warn user if selecting a potentially conflicting time slot
    if (conflictingSlots[hours]) {
      onAlert("warning", "This hour may have existing bookings. Please check if your exact time slot is available.");
    }
    
    onTimeChange(newTime);
    onClose();
  };

  const renderTimeGrid = (isHours) => {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const items = isHours
      ? Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
      : Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    const selectedValue = isHours ? hours : minutes;
    
    return (
      <FlatList
        data={items}
        numColumns={6}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isPastTime = isToday() && (
            (isHours && parseInt(item) < currentHour) ||
            (!isHours && parseInt(hours) === currentHour && parseInt(item) < currentMinute)
          );
          
          // Check if this hour has potential conflicts
          const hasConflict = isHours && conflictingSlots[item];
          
          let bgColor = "bg-gray-100";
          let textColor = "text-gray-800";
          
          if (selectedValue === item) {
            bgColor = "bg-orange-500";
            textColor = "text-white";
          } else if (isPastTime) {
            bgColor = "bg-gray-200";
            textColor = "text-gray-400";
          } else if (hasConflict) {
            // Highlight hours with existing bookings
            bgColor = "bg-red-100";
            textColor = "text-red-800";
          }
          
          return (
            <TouchableOpacity
              className={`w-10 h-10 items-center justify-center m-1 rounded-lg ${bgColor}`}
              onPress={() => {
                if (!isPastTime) {
                  if (isHours) {
                    setHours(item);
                    if (isToday() && parseInt(item) === currentHour) {
                      const newMinutes = Math.max(currentMinute, parseInt(minutes))
                        .toString()
                        .padStart(2, "0");
                      setMinutes(newMinutes);
                    }
                  } else {
                    setMinutes(item);
                  }
                }
              }}
              disabled={isPastTime}
            >
              <Text
                className={`${textColor} font-medium text-lg`}
              >
                {item}
              </Text>
              {hasConflict && (
                <View className="absolute bottom-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    );
  };

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
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
          
          {isToday() && (
            <View className="mb-2 bg-sky-50 p-2 rounded-lg">
              <Text className="text-sky-700 text-sm text-center">
                Booking for today - past times are disabled
              </Text>
            </View>
          )}
          
          {/* Legend for conflicting time slots */}
          <View className="mb-2 bg-red-50 p-2 rounded-lg">
            <Text className="text-red-700 text-sm text-center">
              Hours marked in red have existing bookings
            </Text>
          </View>
          
          <View className="flex-row justify-center items-center py-3 mb-2">
            <TouchableOpacity
              onPress={() => setShowHours(true)}
              className={`px-5 py-2 rounded-lg mr-2 ${showHours ? "bg-sky-500" : "bg-gray-200"}`}
            >
              <Text className={showHours ? "text-white font-medium" : "text-gray-700"}>
                Hours
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowHours(false)}
              className={`px-5 py-2 rounded-lg ml-2 ${!showHours ? "bg-sky-500" : "bg-gray-200"}`}
            >
              <Text className={!showHours ? "text-white font-medium" : "text-gray-700"}>
                Minutes
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center items-center mb-3">
            <TouchableOpacity onPress={() => setShowHours(true)} className="items-center">
              <Text className={`text-2xl font-medium ${showHours ? "text-sky-500" : "text-gray-800"}`}>{hours}</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800 mx-2">:</Text>
            <TouchableOpacity onPress={() => setShowHours(false)} className="items-center">
              <Text className={`text-2xl font-medium ${!showHours ? "text-sky-500" : "text-gray-800"}`}>{minutes}</Text>
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

// ==================
// RescheduleBooking Component
// ==================
const RescheduleBooking = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true); // Start with loading true
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [bookingType, setBookingType] = useState<string | null>(null); // "ROOM" or "TRANSPORT"
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [destination, setDestination] = useState("");
  const [resourceDetails, setResourceDetails] = useState<any>(null);
  const [bookedDates, setBookedDates] = useState<Record<string, boolean>>({});
  const [timeSlotConflicts, setTimeSlotConflicts] = useState<Record<string, any[]>>({});

  
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (type: string, message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Add useEffect to fetch booking details on component mount
  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    } else {
      setLoading(false);
      showAlert("error", "Booking ID not found");
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
      if (!authToken) {
        showAlert("error", "Not authenticated");
        router.push("/(auth)/sign-in");
        return;
      }
      const axiosInstance = axios.create({
        baseURL: "https://j9d3hc82-3001.asse.devtunnels.ms/api",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      try {
        // Try to fetch as room booking first
        const roomBookingResponse = await axiosInstance.get(`/room-bookings/${id}`);
        setBookingDetails(roomBookingResponse.data);
        setBookingType("ROOM");
        setNewDate(roomBookingResponse.data.booking_date);
        setNewStartTime(roomBookingResponse.data.start_time);
        setNewEndTime(roomBookingResponse.data.end_time);
        
        // Fetch room details
        if (roomBookingResponse.data.room_id) {
          try {
            const roomResponse = await axiosInstance.get(`/rooms/${roomBookingResponse.data.room_id}`);
            if (roomResponse.data) {
              // Update booking details with room info
              setBookingDetails(prevDetails => ({
                ...prevDetails,
                room_details: roomResponse.data
              }));
            }
          } catch (roomDetailError) {
            console.error("Error fetching room details:", roomDetailError);
          }
        }
        
        // Fetch all bookings for this room
        await fetchExistingBookings(roomBookingResponse.data.room_id, true);
      } catch (roomError) {
        try {
          // If not room booking, try as transport booking
          const transportBookingResponse = await axiosInstance.get(`/transport-bookings/${id}`);
          setBookingDetails(transportBookingResponse.data);
          setBookingType("TRANSPORT");
          setNewDate(transportBookingResponse.data.booking_date);
          setNewStartTime(transportBookingResponse.data.start_time);
          setNewEndTime(transportBookingResponse.data.end_time);
          setDestination(transportBookingResponse.data.destination || "");
          
          // Fetch vehicle details
          if (transportBookingResponse.data.vehicle_id) {
            try {
              const vehicleResponse = await axiosInstance.get(`/vehicles/${transportBookingResponse.data.vehicle_id}`);
              if (vehicleResponse.data) {
                // Update booking details with vehicle info
                setBookingDetails(prevDetails => ({
                  ...prevDetails,
                  vehicle_details: vehicleResponse.data
                }));
              }
            } catch (vehicleDetailError) {
              console.error("Error fetching vehicle details:", vehicleDetailError);
            }
          }
          
          // Fetch all bookings for this vehicle
          await fetchExistingBookings(transportBookingResponse.data.vehicle_id, false);
        } catch (transportError) {
          console.error("Error fetching booking details:", transportError);
          showAlert("error", "Failed to fetch booking details. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      showAlert("error", "Failed to fetch booking details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingBookings = async (resourceId: any, isRoom: boolean = true) => {
    if (!resourceId) return;
    try {
      setLoadingBookings(true);
      const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
      if (!authToken) {
        showAlert("error", "Not authenticated");
        return;
      }
      const axiosInstance = axios.create({
        baseURL: "https://j9d3hc82-3001.asse.devtunnels.ms/api",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      
      try {
        // Try to get all bookings first
        const allBookingsEndpoint = isRoom
          ? `/room-bookings`
          : `/transport-bookings`;
        
        console.log(`Trying to fetch all ${isRoom ? 'room' : 'transport'} bookings...`);
        const response = await axiosInstance.get(allBookingsEndpoint);
        
        if (response.data) {
          // Get all bookings
          const allBookings = Array.isArray(response.data)
            ? response.data
            : response.data.bookings || [];
          
          // Filter bookings for this specific resource and exclude current booking
          const relevantBookings = allBookings.filter(booking => {
            const bookingResourceId = isRoom ? booking.room_id : booking.vehicle_id;
            return bookingResourceId == resourceId && booking.id !== id;
          });
          
          console.log(`Found ${relevantBookings.length} existing bookings for this ${isRoom ? 'room' : 'vehicle'}`);
          setExistingBookings(relevantBookings);
          
          // Create a map of booked dates for the calendar
          const datesMap: Record<string, boolean> = {};
          const conflictsMap: Record<string, any[]> = {};
          
          relevantBookings.forEach(booking => {
            if (booking.booking_date) {
              // Mark date as having bookings
              datesMap[booking.booking_date] = true;
              
              // Group bookings by date for conflict checking
              if (!conflictsMap[booking.booking_date]) {
                conflictsMap[booking.booking_date] = [];
              }
              conflictsMap[booking.booking_date].push(booking);
            }
          });
          
          setBookedDates(datesMap);
          setTimeSlotConflicts(conflictsMap);
          console.log(`Marked ${Object.keys(datesMap).length} dates as having bookings`);
        }
      } catch (error: any) {
        console.log(`Error fetching all bookings:`, error);
        
        // Fall back to empty bookings array but don't show an error to the user
        setExistingBookings([]);
        setBookedDates({});
        setTimeSlotConflicts({});
        
        // Try to get resource details as last resort
        try {
          const resourceEndpoint = isRoom
            ? `/rooms/${resourceId}`
            : `/vehicles/${resourceId}`;
          
          const resourceResponse = await axiosInstance.get(resourceEndpoint);
          if (resourceResponse.data) {
            console.log(`Successfully retrieved ${isRoom ? 'room' : 'vehicle'} details`);
            if (isRoom) {
              setBookingDetails(prevDetails => ({
                ...prevDetails,
                room_details: resourceResponse.data
              }));
            } else {
              setBookingDetails(prevDetails => ({
                ...prevDetails,
                vehicle_details: resourceResponse.data
              }));
            }
          }
        } catch (resourceError) {
          console.log(`Could not fetch ${isRoom ? 'room' : 'vehicle'} details:`, resourceError);
        }
      }
    } catch (error: any) {
      console.error("Error in fetchExistingBookings:", error);
      // Don't show alert to user, just log it
      console.log("Failed to load existing bookings data.");
      
      // Set empty arrays/objects to avoid breaking the app flow
      setExistingBookings([]);
      setBookedDates({});
      setTimeSlotConflicts({});
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatDateForAPI = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateBookingAvailability = async () => {
    // Basic validations first
    if (!newDate || !newStartTime || !newEndTime) {
      showAlert("error", "Please select date and time for your booking");
      return false;
    }
    
    if (isDateInPast(newDate)) {
      showAlert("error", "Please select a date that is not in the past");
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(newDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate.getTime() === today.getTime() && isTimeInPast(newDate, newStartTime)) {
      showAlert("error", "Please select a start time that is not in the past");
      return false;
    }
    
    // Validate time formats and sequence
    const [startHours, startMinutes] = newStartTime.split(":").map(Number);
    const [endHours, endMinutes] = newEndTime.split(":").map(Number);
    
    if (startHours > endHours || (startHours === endHours && startMinutes >= endMinutes)) {
      showAlert("error", "End time must be after start time");
      return false;
    }
    
    // Only check for conflicts if we have existing bookings
    if (existingBookings.length > 0) {
      console.log(`Checking for conflicts among ${existingBookings.length} existing bookings on ${newDate}`);
      
      // Get bookings for this specific date
      const bookingsOnDate = timeSlotConflicts[newDate] || [];
      console.log(`Found ${bookingsOnDate.length} bookings on selected date`);
      
      if (bookingsOnDate.length > 0) {
        // Check for time conflicts with existing bookings
        if (hasTimeConflict(newDate, newStartTime, newEndTime, existingBookings, id)) {
          const conflict = getConflictDetails(newDate, newStartTime, newEndTime, existingBookings, id);
          let errorMessage =
            bookingType === "ROOM"
              ? "Booking time conflicts with another reservation for this room"
              : "Booking time conflicts with another transport reservation";
          
          if (conflict) {
            errorMessage += ` (${conflict.startTime} - ${conflict.endTime})`;
            
            // Add details about who booked the conflicting slot if available
            if (conflict.pic) {
              errorMessage += `, booked by ${conflict.pic}`;
            }
            
            if (conflict.section) {
              errorMessage += ` from ${conflict.section}`;
            }
          }
          
          showAlert("error", errorMessage);
          return false;
        }
      }
    }
    
    // Calculate duration in minutes
    const startTimeMinutes = timeToMinutes(newStartTime);
    const endTimeMinutes = timeToMinutes(newEndTime);
    const durationMinutes = endTimeMinutes - startTimeMinutes;
    
    // Check if booking duration is reasonable
    if (durationMinutes > 8 * 60) { // 8 hours
      showAlert("warning", "Your booking is quite long (over 8 hours). Please confirm this is correct.");
      // Not blocking, just warning
    }
    
    // Check if this is the same date and time as the original booking
    if (
      bookingDetails.booking_date === newDate &&
      bookingDetails.start_time === newStartTime &&
      bookingDetails.end_time === newEndTime &&
      (bookingType !== "TRANSPORT" || bookingDetails.destination === destination)
    ) {
      showAlert("info", "You haven't made any changes to the booking");
      return false;
    }
    
    // Check if the booking is outside business hours (but don't block it)
    const businessStartTime = "08:00";
    const businessEndTime = "17:00";
    
    if (newStartTime < businessStartTime || newEndTime > businessEndTime) {
      showAlert("warning", "This booking is outside standard business hours (8:00 - 17:00)");
      // Allow to continue - not a blocker
    }
    
    // Additional resource-specific validations
    if (bookingType === "ROOM" && bookingDetails.room_details) {
      // Room-specific validations (weekend availability, operating hours, etc.)
      try {
        const roomDetails = bookingDetails.room_details;
        
        // Check weekend availability
        const bookingDay = new Date(newDate).getDay();
        if ((bookingDay === 0 || bookingDay === 6) && roomDetails.weekend_available === false) {
          showAlert("error", "This room is not available for booking on weekends");
          return false;
        }
        
        // Check operating hours if available
        if (roomDetails.operating_hours) {
          const { open_time, close_time } = roomDetails.operating_hours;
          if (open_time && close_time) {
            if (newStartTime < open_time) {
              showAlert("error", `This room is only available starting from ${open_time}`);
              return false;
            }
            
            if (newEndTime > close_time) {
              showAlert("error", `This room must be vacated by ${close_time}`);
              return false;
            }
          }
        }
      } catch (error) {
        console.log("Error during room-specific validation:", error);
      }
    } else if (bookingType === "TRANSPORT" && bookingDetails.vehicle_details) {
      // Vehicle-specific validations
      try {
        const vehicleDetails = bookingDetails.vehicle_details;
        
        // Check if vehicle is in maintenance
        if (vehicleDetails.maintenance_status === "active") {
          showAlert("error", "This vehicle is currently under maintenance");
          return false;
        }
        
        // Check if driver is available (if applicable)
        if (vehicleDetails.requires_driver && !vehicleDetails.driver_available) {
          showAlert("error", "No driver is available for this vehicle during selected time");
          return false;
        }
        
        // Check if destination is provided for transport bookings
        if (!destination.trim()) {
          showAlert("error", "Please enter a destination for transport booking");
          return false;
        }
      } catch (error) {
        console.log("Error during vehicle-specific validation:", error);
      }
    }
    
    return true;
  };
  
  // Update DatePickerModal call to pass bookedDates
  {showDatePicker && (
    <DatePickerModal
  visible={showDatePicker}
  onClose={() => setShowDatePicker(false)}
  date={newDate}
  onDateChange={(date) => setNewDate(date)}
  existingBookings={existingBookings}
/>
  )}
  
  // Update TimePickerModal calls to work with time conflicts
  {showStartTimePicker && (
    <TimePickerModal
      visible={showStartTimePicker}
      onClose={() => setShowStartTimePicker(false)}
      time={newStartTime}
      onTimeChange={(time) => setNewStartTime(time)}
      title="Select Start Time"
      dateString={newDate}
      existingBookings={existingBookings}
      currentBookingId={id}
    />
  )}
  
  {showEndTimePicker && (
    <TimePickerModal
      visible={showEndTimePicker}
      onClose={() => setShowEndTimePicker(false)}
      time={newEndTime}
      onTimeChange={(time) => setNewEndTime(time)}
      title="Select End Time"
      dateString={newDate}
      existingBookings={existingBookings}
      currentBookingId={id}
    />
  )}

  const handleReschedule = async () => {
    if (!id) return;
    
    // First validate the booking
    const isValid = await validateBookingAvailability();
    if (!isValid) return;
    
    try {
      setLoading(true);
      const authToken = await tokenCache.getToken(AUTH_TOKEN_KEY);
      if (!authToken) {
        showAlert("error", "Not authenticated");
        router.push("/(auth)/sign-in");
        return;
      }
      
      const axiosInstance = axios.create({
        baseURL: "https://j9d3hc82-3001.asse.devtunnels.ms/api",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      
      const updatedBooking = {
        booking_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
      };
      
      if (bookingType === "TRANSPORT") {
        updatedBooking["destination"] = destination;
      }
      
      console.log("Sending reschedule request with data:", updatedBooking);
      
      const endpoint = bookingType === "ROOM" ? `/room-bookings/${id}` : `/transport-bookings/${id}`;
      const response = await axiosInstance.put(endpoint, updatedBooking);
      
      console.log("Reschedule response:", response.data);
      
      showAlert("success", "Booking rescheduled successfully");
      setTimeout(() => {
        router.replace("/(root)/(tabs)/my-booking");
      }, 1500);
    } catch (error: any) {
      console.error("Error rescheduling booking:", error);
      
      // Enhanced error handling
      let errorMessage = "Failed to reschedule booking. Please try again later.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Invalid booking data. Please check your inputs.";
        } else if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please login again.";
          setTimeout(() => {
            router.push("/(auth)/sign-in");
          }, 1500);
        } else if (error.response.status === 409) {
          errorMessage = "This time slot is no longer available. Please select another time.";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to reschedule this booking.";
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request);
        errorMessage = "No response from server. Please check your internet connection.";
      }
      
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text className="text-sky-700 mt-4 font-medium">Loading booking details...</Text>
      </View>
    );
  }
  
  if (!bookingDetails) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="alert-circle" size={32} color="#EF4444" />
        </View>
        <Text className="text-gray-800 text-xl font-bold mb-2">Booking Not Found</Text>
        <Text className="text-gray-500 text-center mb-6 px-8">
          We couldn't find the booking details. It may have been deleted or the ID is incorrect.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(root)/(tabs)/my-booking")}
          className="mt-2 px-6 py-3 bg-sky-500 rounded-xl"
        >
          <Text className="text-white font-medium">Go back to My Bookings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDateDisplay = (date: string) => {
    const d = new Date(date);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getThemeColors = () => {
    return bookingType === "TRANSPORT"
      ? {
          primary: "bg-sky-500",
          secondary: "bg-sky-100",
          text: "text-sky-800",
          icon: "car-outline",
        }
      : {
          primary: "bg-sky-500",
          secondary: "bg-sky-100",
          text: "text-sky-800",
          icon: "business-outline",
        };
  };

  const theme = getThemeColors();

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
            <Text className="text-white text-2xl font-bold">
              Reschedule {bookingType === "TRANSPORT" ? "Transport" : "Room"}
            </Text>
            <Text className="text-white text-opacity-90 mt-1">
              Update your {bookingType === "TRANSPORT" ? "transport" : "room"} reservation
            </Text>
          </View>
        </View>

        {/* Current Reservation Card */}
        <View className="mx-5 -mt-5 bg-white p-5 rounded-2xl border border-sky-100 shadow-lg">
          <Text className={`${theme.text} font-bold mb-3 text-lg`}>Current Reservation</Text>
          {bookingType === "TRANSPORT" ? (
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
                  <Text className="text-gray-800 font-medium text-base">
                    {bookingDetails.vehicle_name || "N/A"}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
                  <Ionicons name="navigate-outline" size={22} color="#0EA5E9" />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Destination</Text>
                  <Text className="text-gray-800 font-medium text-base">
                    {bookingDetails.destination}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="mb-4">
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
                  <Ionicons name="business-outline" size={22} color="#0EA5E9" />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Room</Text>
                  <Text className="text-gray-800 font-medium text-base">
                    {bookingDetails.room_name || "N/A"}
                  </Text>
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
              <Text className="text-gray-800 font-medium text-base">
                {formatDateDisplay(bookingDetails.booking_date)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mb-4">
            <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
              <Ionicons name="time-outline" size={22} color="#0EA5E9" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Start Time</Text>
              <Text className="text-gray-800 font-medium text-base">
                {bookingDetails.start_time}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className={`w-12 h-12 ${theme.secondary} rounded-full items-center justify-center mr-4`}>
              <Ionicons name="time-outline" size={22} color="#0EA5E9" />
            </View>
            <View>
              <Text className="text-gray-500 text-xs">End Time</Text>
              <Text className="text-gray-800 font-medium text-base">
                {bookingDetails.end_time}
              </Text>
            </View>
          </View>
        </View>

        {/* New Booking Form */}
        <View className="mx-5 mt-6 mb-6">
          <Text className="text-gray-800 font-bold text-lg mb-3">New Details</Text>
          {bookingType === "TRANSPORT" && (
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium">Destination</Text>
              <View className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <MaterialIcons name="location-on" size={22} color="#F97316" />
                <Text className="ml-3 text-gray-700">
                  {bookingDetails.destination || "N/A"}
                </Text>
              </View>
            </View>
          )}
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">New Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
            >
              <MaterialIcons name="event" size={22} color="#F97316" />
              <Text className="ml-3 text-gray-700 font-medium">
                {newDate ? formatDateDisplay(newDate) : "Select date"}
              </Text>
              <View className="ml-auto">
                <MaterialIcons name="arrow-drop-down" size={24} color="#F97316" />
              </View>
            </TouchableOpacity>
          </View>
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">New Start Time</Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
            >
              <MaterialIcons name="access-time" size={22} color="#F97316" />
              <Text className="ml-3 text-gray-700 font-medium">
                {newStartTime || "Select start time"}
              </Text>
              <View className="ml-auto">
                <MaterialIcons name="arrow-drop-down" size={24} color="#F97316" />
              </View>
            </TouchableOpacity>
          </View>
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-medium">New End Time</Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="flex-row items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
            >
              <MaterialIcons name="access-time" size={22} color="#F97316" />
              <Text className="ml-3 text-gray-700 font-medium">
                {newEndTime || "Select end time"}
              </Text>
              <View className="ml-auto">
                <MaterialIcons name="arrow-drop-down" size={24} color="#F97316" />
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleReschedule}
            className="bg-orange-500 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">Confirm Reschedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Pickers */}
      {showDatePicker && (
      <DatePickerModal
      visible={showDatePicker}
      onClose={() => setShowDatePicker(false)}
      date={newDate}
      onDateChange={(date) => setNewDate(date)}
      existingBookings={existingBookings}
    />
      )}
      {showStartTimePicker && (
        <TimePickerModal
          visible={showStartTimePicker}
          onClose={() => setShowStartTimePicker(false)}
          time={newStartTime}
          onTimeChange={(time) => setNewStartTime(time)}
          title="Select Start Time"
          dateString={newDate}
          existingBookings={existingBookings}
          currentBookingId={id}
          onAlert={showAlert}
        />
      )}
      {showEndTimePicker && (
        <TimePickerModal
          visible={showEndTimePicker}
          onClose={() => setShowEndTimePicker(false)}
          time={newEndTime}
          onTimeChange={(time) => setNewEndTime(time)}
          title="Select End Time"
          dateString={newDate}
          existingBookings={existingBookings}
          currentBookingId={id}
          onAlert={showAlert}
        />
      )}

      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        bookingType={bookingType || "ROOM"}
      />
    </View>
  );
};

export default RescheduleBooking;
