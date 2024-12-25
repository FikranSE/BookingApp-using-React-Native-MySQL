import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from "@/constants";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import { Image } from "react-native";

const NewMeeting = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [name, setName] = useState("Grooming");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [room, setRoom] = useState(null);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);

 

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-3 ${isActive ? 'border-b-2 border-blue-900' : 'border-b border-gray-200'}`}
    >
      <Text className={`text-center font-medium ${isActive ? 'text-blue-900' : 'text-gray-500'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const rooms = [
    { 
      id: 1, 
      name: "Big room (Melati)", 
      capacity: 15,
      bookings: [
        { date: "25/12/2024", startTime: "09:00 AM", endTime: "11:00 AM" },
        { date: "25/12/2024", startTime: "02:00 PM", endTime: "04:00 PM" },
      ]
    },
    { 
      id: 2, 
      name: "Middle room (Mawar)", 
      capacity: 10,
      bookings: [
        { date: "25/12/2024", startTime: "10:00 AM", endTime: "12:00 PM" },
        { date: "25/12/2024", startTime: "03:00 PM", endTime: "05:00 PM" },
      ]
    },
    { 
      id: 3, 
      name: "Small room (Anggrek)", 
      capacity: 5,
      bookings: [
        { date: "25/12/2024", startTime: "11:00 AM", endTime: "01:00 PM" },
        { date: "25/12/2024", startTime: "04:00 PM", endTime: "06:00 PM" },
      ]
    },
  ];

  const timeSlots = {
    morning: [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM"
    ],
    afternoon: [
      "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM",
      "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
      "04:30 PM", "05:00 PM", "05:30 PM"
    ]
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Convert time string to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  // Get available end times based on selected start time
  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    
    const startMinutes = timeToMinutes(startTime);
    return timeSlots.filter(time => {
      const endMinutes = timeToMinutes(time);
      // Ensure end time is after start time and within reasonable duration (e.g., max 4 hours)
      return endMinutes > startMinutes && endMinutes <= startMinutes + 240;
    });
  };

  const isTimeSlotAvailable = (roomId, time, isStartTime = true) => {
    const selectedRoom = rooms.find(r => r.id === roomId);
    if (!selectedRoom) return true;

    const currentDate = formatDate(date);
    const timeMinutes = timeToMinutes(time);
    
    return !selectedRoom.bookings.some(booking => {
      if (booking.date !== currentDate) return false;
      
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingEndMinutes = timeToMinutes(booking.endTime);
      
      if (isStartTime) {
        // For start time: check if the selected time is within any booking
        return timeMinutes >= bookingStartMinutes && timeMinutes < bookingEndMinutes;
      } else {
        // For end time: check if the time slot would create an overlap
        const selectedStartMinutes = startTime ? timeToMinutes(startTime) : 0;
        return (selectedStartMinutes < bookingEndMinutes && timeMinutes > bookingStartMinutes);
      }
    });
  };

  const isRoomAvailable = (roomId) => {
    if (!startTime || !endTime) return true;
    
    const selectedRoom = rooms.find(r => r.id === roomId);
    if (!selectedRoom) return true;

    const currentDate = formatDate(date);
    const selectedStartMinutes = timeToMinutes(startTime);
    const selectedEndMinutes = timeToMinutes(endTime);
    
    return !selectedRoom.bookings.some(booking => {
      if (booking.date !== currentDate) return false;
      
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingEndMinutes = timeToMinutes(booking.endTime);
      
      return (selectedStartMinutes < bookingEndMinutes && selectedEndMinutes > bookingStartMinutes);
    });
  };

  // Handle start time selection and reset end time if needed
  const handleStartTimeSelect = (time) => {
    setStartTime(time);
    // Reset end time if it's no longer valid with the new start time
    if (endTime) {
      const endMinutes = timeToMinutes(endTime);
      const startMinutes = timeToMinutes(time);
      if (endMinutes <= startMinutes || endMinutes > startMinutes + 240) {
        setEndTime(null);
      }
    }
  };



  const CustomInputField = ({ value, placeholder, rightIcon, onPress, disabled }) => (
    <View className={`flex-row items-center bg-white rounded-full border border-blue-900 p-4 mb-4 ${disabled ? 'opacity-50' : ''}`}>
      
      <TouchableOpacity onPress={disabled ? null : onPress} className="flex-1">
        <Text className="text-base text-blue-900">
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {rightIcon && (
        <View className="ml-3">
          <TouchableOpacity onPress={disabled ? null : onPress}>
            <Image source={rightIcon} className="w-5 h-5" tintColor="#334155" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const TimeDropdown = ({ options, onSelect, visible, onClose, isStartTime = true }) => {
    if (!visible) return null;

    const getRoomAvailability = (time) => {
      const availableRooms = rooms.filter(roomItem => {
        if (!isTimeSlotAvailable(roomItem.id, time, isStartTime)) {
          return false;
        }
        return true;
      });
      return availableRooms;
    };

    const isValidEndTime = (time) => {
      if (isStartTime) return true;
      if (!startTime) return false;
      
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(time);
      return endMinutes > startMinutes && endMinutes <= startMinutes + 240;
    };

    const renderTimeSection = (title, slots) => (
      <View>
        <Text className="px-4 py-2 bg-gray-100 font-medium text-gray-600">{title}</Text>
        {slots.map((time, index) => {
          const availableRooms = getRoomAvailability(time);
          const isValid = isValidEndTime(time);
          const showDetails = isValid && (!isStartTime ? startTime : true);
          
          return (
            <TouchableOpacity
              key={index}
              className={`p-4 border-b border-gray-100 ${(!showDetails || availableRooms.length === 0) ? 'opacity-50' : ''}`}
              onPress={() => {
                if (showDetails && availableRooms.length > 0) {
                  if (isStartTime) {
                    handleStartTimeSelect(time);
                  } else {
                    onSelect(time);
                  }
                  onClose();
                }
              }}
              disabled={!showDetails || availableRooms.length === 0}
            >
              <View className="flex-col justify-between items-start">
                <Text className="text-blue-900 text-base">{time}</Text>
                <View className="flex-row items-center">
                  {showDetails && (
                    <Text className={`text-sm ${availableRooms.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {availableRooms.length > 0 
                        ? `${availableRooms.length} room${availableRooms.length > 1 ? 's' : ''} available`
                        : 'No rooms available'}
                    </Text>
                  )}
                  {!isValid && isStartTime === false && (
                    <Text className="text-sm text-gray-500">Invalid time range</Text>
                  )}
                </View>
              </View>
              {showDetails && availableRooms.length > 0 && (
                <View className="mt-1">
                  <Text className="text-sm text-gray-500">
                    Available: {availableRooms.map(r => r.name.split(' ')[0]).join(', ')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );

    return (
      <View className="absolute z-50 w-full bg-white rounded-xl mt-1 shadow-lg">
        <ScrollView className="max-h-72">
          {renderTimeSection('Morning', timeSlots.morning)}
          {renderTimeSection('Afternoon', timeSlots.afternoon)}
        </ScrollView>
      </View>
    );
  };

  const RoomDropdown = () => (
    <View className="absolute z-50 w-full bg-white rounded-xl mt-1 shadow-lg">
      <ScrollView className="max-h-48">
        {rooms.map((roomItem) => {
          const available = isRoomAvailable(roomItem.id);
          
          return (
            <TouchableOpacity
              key={roomItem.id}
              className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${!available ? 'opacity-50' : ''}`}
              onPress={() => {
                if (available) {
                  setRoom(roomItem.id.toString());
                  setShowRoomDropdown(false);
                }
              }}
              disabled={!available}
            >
              <View>
                <Text className="text-blue-900 text-base">{roomItem.name}</Text>
                <Text className="text-gray-500 text-sm">Capacity: {roomItem.capacity}</Text>
              </View>
              <Text className={`text-sm ${available ? 'text-green-600' : 'text-red-500'}`}>
                {available ? 'Available' : 'Booked'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <Header />
      
      <ScrollView className="flex-1 px-4">
        {/* Tabs */}
        <View className="flex-row bg-white rounded-t-xl">
          <TabButton
            title="Rooms"
            isActive={activeTab === 'rooms'}
            onPress={() => setActiveTab('rooms')}
          />
          <TabButton
            title="Transportation"
            isActive={activeTab === 'transportation'}
            onPress={() => setActiveTab('transportation')}
          />
        </View>

        {/* Form Card */}
        <View className="bg-white px-4 py-6 rounded-b-xl shadow-sm">
          {activeTab === 'rooms' ? (
            <View className="space-y-6">
              <InputField
                label="Name of meeting"
                value={name}
                onChangeText={setName}
                placeholder=""
                containerStyle="mb-2"
              />

              <View>
                <Text className="text-gray-500 text-sm mb-1">Date</Text>
                <CustomInputField
                  value={formatDate(date)}
                  icon={icons.calendar}
                  onPress={() => setShowDatePicker(true)}
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2 relative">
                  <Text className="text-gray-500 text-sm mb-1">Start time</Text>
                  <CustomInputField
                    value={startTime}
                    placeholder="Select"
                    icon={icons.clock}
                    rightIcon={icons.arrowDown}
                    onPress={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
                  />
                  <TimeDropdown
                    options={timeSlots}
                    onSelect={handleStartTimeSelect}
                    visible={showStartTimeDropdown}
                    onClose={() => setShowStartTimeDropdown(false)}
                    isStartTime={true}
                  />
                </View>

                <View className="flex-1 ml-2 relative">
                  <Text className="text-gray-500 text-sm mb-1">End time</Text>
                  <CustomInputField
                    value={endTime}
                    placeholder="Select"
                    icon={icons.clock}
                    rightIcon={icons.arrowDown}
                    onPress={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
                    disabled={!startTime}
                  />
                  <TimeDropdown
                    options={timeSlots}
                    onSelect={setEndTime}
                    visible={showEndTimeDropdown}
                    onClose={() => setShowEndTimeDropdown(false)}
                    isStartTime={false}
                  />
                </View>
              </View>

              <View className="relative">
                <Text className="text-gray-500 text-sm mb-1">Room</Text>
                <CustomInputField
                  value={room ? rooms.find(r => r.id.toString() === room)?.name : null}
                  placeholder="Select a room"
                  icon={icons.location}
                  rightIcon={icons.arrowDown}
                  onPress={() => setShowRoomDropdown(!showRoomDropdown)}
                />
                {showRoomDropdown && <RoomDropdown />}
              </View>

              <View className="pt-4">
                <TouchableOpacity 
                  className={`bg-blue-900 py-4 rounded-xl ${(!name || !startTime || !endTime || !room) ? 'opacity-50' : 'active:opacity-90'}`}
                  onPress={() => console.log('Creating meeting...')}
                  disabled={!name || !startTime || !endTime || !room}
                >
                  <Text className="text-white text-center font-medium text-base">
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Transportation Tab Content
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500">Transportation booking form coming soon</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default NewMeeting;