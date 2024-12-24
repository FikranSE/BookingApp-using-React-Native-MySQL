import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons, images } from "@/constants";

const NewMeeting = () => {
  const [name, setName] = useState("Grooming");
  const [date, setDate] = useState(new Date("2021-12-08"));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [room, setRoom] = useState("Big meeting room №3");
  const [members] = useState([
    {
      id: 1,
      name: "Flora Brown",
      role: "Team Lead UX/UI Designer",
      isOrganizer: true,
      avatar: images.avatar1
    },
    {
      id: 2,
      name: "Christopher Waters",
      role: "UI/UX Designer",
      isOrganizer: false,
      avatar: images.avatar2
    }
  ]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const InputLabel = ({ children }) => (
    <Text className="text-gray-400 text-sm mb-1">{children}</Text>
  );

  const InputField = ({ value, placeholder, icon, rightIcon, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl p-4 mb-4"
    >
      {icon && (
        <Image source={icon} className="w-5 h-5 mr-3" tintColor="#6B7280" />
      )}
      <TextInput
        className="flex-1 text-base text-gray-900"
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        editable={!onPress}
      />
      {rightIcon && (
        <Image source={rightIcon} className="w-5 h-5 ml-3" tintColor="#6B7280" />
      )}
    </TouchableOpacity>
  );

  const MemberItem = ({ member }) => (
    <View className="flex-row items-center justify-between bg-white rounded-xl p-3 mb-2">
      <View className="flex-row items-center">
        <Image 
          source={member.avatar} 
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="text-gray-900 font-medium">{member.name}</Text>
          <Text className="text-gray-500 text-sm">{member.role}</Text>
        </View>
      </View>
      {member.isOrganizer ? (
        <Text className="text-purple-500">Organizer</Text>
      ) : (
        <TouchableOpacity>
          <Image source={icons.close} className="w-5 h-5" tintColor="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity>
          <Image source={icons.back} className="w-6 h-6" tintColor="#6B7280" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-medium text-xl">MBook</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-2xl font-semibold my-4">New Meeting</Text>

        <View className="space-y-4">
          <View>
            <InputLabel>Name of meeting</InputLabel>
            <InputField
              value={name}
              placeholder="Enter meeting name"
              icon={icons.title}
            />
          </View>

          <View>
            <InputLabel>Date</InputLabel>
            <InputField
              value={formatDate(date)}
              icon={icons.calendar}
              onPress={() => setShowDatePicker(true)}
            />
          </View>

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <InputLabel>Start time</InputLabel>
              <InputField
                value={startTime}
                icon={icons.clock}
              />
            </View>
            <View className="flex-1">
              <InputLabel>End time</InputLabel>
              <InputField
                value={endTime}
                icon={icons.clock}
              />
            </View>
          </View>

          <View>
            <InputLabel>Room</InputLabel>
            <InputField
              value={room}
              icon={icons.location}
              rightIcon={icons.chevronDown}
            />
          </View>

          <View>
            <InputLabel>Members</InputLabel>
            {members.map(member => (
              <MemberItem key={member.id} member={member} />
            ))}
            <TouchableOpacity className="flex-row items-center mt-2">
              <Image source={icons.plus} className="w-5 h-5" tintColor="#2563EB" />
              <Text className="text-blue-600 font-medium ml-2">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="p-4">
        <TouchableOpacity className="bg-blue-600 py-4 rounded-xl">
          <Text className="text-white text-center font-medium text-lg">Create</Text>
        </TouchableOpacity>
      </View>

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