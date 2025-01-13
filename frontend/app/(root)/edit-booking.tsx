import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { icons } from "@/constants";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';

// Types
interface IBooking {
  id: string;
  type: 'ROOM' | 'TRANSPORT';
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

const EditBooking = () => {
  const navigation = useNavigation();

  // Initial booking data - replace with actual data from route params or API
  const [booking, setBooking] = useState<IBooking>({
    id: "1",
    type: "ROOM",
    title: "Team Meeting",
    date: "2025-01-13",
    startTime: "09:00",
    endTime: "10:00",
    location: "Meeting Room A",
  });

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedType, setSelectedType] = useState<"ROOM" | "TRANSPORT">(booking.type);

  const handleSave = () => {
    // Validate inputs
    if (!booking.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!booking.location.trim()) {
      Alert.alert("Error", "Please enter a location");
      return;
    }

    // Add your API call here to update the booking
    Alert.alert(
      "Success",
      "Booking updated successfully",
      [
        {
          text: "OK",
          onPress: () => router.replace('/(root)/detail-booking')
        }
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBooking({
        ...booking,
        date: selectedDate.toISOString().split('T')[0]
      });
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setBooking({
        ...booking,
        startTime: selectedTime.toLocaleTimeString().slice(0, 5)
      });
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setBooking({
        ...booking,
        endTime: selectedTime.toLocaleTimeString().slice(0, 5)
      });
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder,
    onPress,
    editable = true
  }: { 
    label: string;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    onPress?: () => void;
    editable?: boolean;
  }) => (
    <View className="mb-4">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <TouchableOpacity 
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
      >
        <TextInput
          className="bg-white px-4 py-3 rounded-lg text-gray-800 border border-gray-200"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Edit Booking</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Type Selection */}
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-2">Booking Type</Text>
          <View className="flex-row">
            {(["ROOM", "TRANSPORT"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                className={`mr-2 px-4 py-2 rounded-lg ${
                  selectedType === type ? 'bg-blue-900' : 'bg-white'
                }`}
              >
                <Text className={`text-sm font-semibold ${
                  selectedType === type ? 'text-white' : 'text-gray-600'
                }`}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Fields */}
        <InputField
          label="Title"
          value={booking.title}
          onChangeText={(text) => setBooking({ ...booking, title: text })}
          placeholder="Enter booking title"
        />

        <InputField
          label="Location"
          value={booking.location}
          onChangeText={(text) => setBooking({ ...booking, location: text })}
          placeholder={selectedType === "ROOM" ? "Enter room name" : "Enter vehicle details"}
        />

        <InputField
          label="Date"
          value={booking.date}
          onPress={() => setShowDatePicker(true)}
          editable={false}
        />

        <InputField
          label="Start Time"
          value={booking.startTime}
          onPress={() => setShowStartTimePicker(true)}
          editable={false}
        />

        <InputField
          label="End Time"
          value={booking.endTime}
          onPress={() => setShowEndTimePicker(true)}
          editable={false}
        />

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(booking.date)}
            mode="date"
            onChange={handleDateChange}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={new Date(`2024-01-01T${booking.startTime}:00`)}
            mode="time"
            onChange={handleStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={new Date(`2024-01-01T${booking.endTime}:00`)}
            mode="time"
            onChange={handleEndTimeChange}
          />
        )}

        {/* Save Button */}
        <View className="mt-6">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-blue-900 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditBooking;