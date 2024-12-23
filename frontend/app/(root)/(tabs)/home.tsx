import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "react-native-date-picker";
import { icons, images } from "@/constants";
import Header from "@/components/Header";

interface Meeting {
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
  title: string;
  room: string;
  now: boolean;
  borderColor: string;
}

const Home = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const meetings: Meeting[] = [
    {
      date: "2024-12-21",
      startTime: "09:30",
      endTime: "11:00",
      title: "Designers Meeting",
      room: "Small meeting room",
      now: true,
      borderColor: "border-blue-900",
    },
    {
      date: "2024-12-21",
      startTime: "12:00",
      endTime: "14:00",
      title: "Daily Project Meeting",
      room: "Big meeting room",
      now: false,
      borderColor: "border-yellow-600",
    },
    {
      date: "2024-12-22",
      startTime: "10:00",
      endTime: "12:00",
      title: "Team Retrospective",
      room: "Main Hall",
      now: false,
      borderColor: "border-green-700",
    },
  ];

  // Function to handle date selection
  const handleDateSelection = (date: Date) => {
    try {
      setSelectedDate(date);
      setIsDatePickerOpen(false);
    } catch (error) {
      console.error("DatePicker error:", error);
    }
  };

  // Function to check if selected date is today
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  // Get date components
  const day = selectedDate.getDate();
  const month = monthNames[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();
  const dayName = dayNames[selectedDate.getDay()];

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculatePosition = (startTime: string, endTime: string, hourHeight: number = 100) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const startOffset = startMinutes - (9 * 60);
    const duration = endMinutes - startMinutes;

    return {
      top: (startOffset / 60) * hourHeight,
      height: (duration / 60) * hourHeight,
    };
  };

  // Filter meetings by selected date
  const filteredMeetings = meetings.filter(
    (meeting) => meeting.date === selectedDate.toISOString().split("T")[0]
  );

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Static Content Section */}
      <View>
        {/* Header Section */}
        <Header/>

        {/* Date Section */}
        <View className="px-6 mt-6">
          {isToday(selectedDate) && (
            <Text className="text-blue-900 font-JakartaBold text-sm shadow-sm">TODAY</Text>
          )}
          <Text className="text-3xl font-JakartaMedium text-blue-900 mb-1">{month} {day}, {year}</Text>
          <Text className="text-lg font-JakartaMedium text-blue-700 italic">{dayName}</Text>

          {/* Month ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            {monthNames.map((monthName, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(index);
                  setSelectedDate(newDate);
                }}
                className={`border px-4 py-2 rounded-full mx-2 transition-transform duration-300 shadow-lg ${
                  index === selectedDate.getMonth() ? "border-blue-900 bg-blue-900" : "bg-white border-blue-900"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    index === selectedDate.getMonth() ? "text-white" : "text-blue-900"
                  }`}
                >
                  {monthName.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Days ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            {Array.from({ length: new Date(year, selectedDate.getMonth() + 1, 0).getDate() }, (_, index) => {
              const tempDay = index + 1;
              const isSelected = tempDay === selectedDate.getDate();
              const dayName = dayNames[new Date(year, selectedDate.getMonth(), tempDay).getDay()].substring(0, 3);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(tempDay);
                    setSelectedDate(newDate);
                  }}
                  className="mx-3 flex items-center transition-transform duration-300 hover:scale-105"
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-blue-900" : "text-blue-900"
                    }`}
                  >
                    {dayName}
                  </Text>
                  <View
                    className={`rounded-full px-5 py-2 mt-1 shadow-lg transition-all duration-300 ${
                      isSelected ? "bg-blue-900" : "bg-white border border-blue-900"
                    }`}
                  >
                    <Text
                      className={`text-lg font-bold ${
                        isSelected ? "text-white" : "text-blue-800"
                      }`}
                    >
                      {tempDay}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Year ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingHorizontal: 15 }}
          >
            {Array.from({ length: 10 }, (_, index) => {
              const tempYear = today.getFullYear() - 5 + index;
              const isSelected = tempYear === selectedDate.getFullYear();

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(tempYear);
                    setSelectedDate(newDate);
                  }}
                  className="mx-3 flex items-center transition-transform duration-300 hover:scale-105"
                >
                  <Text
                    className={`text-lg font-semibold ${
                      isSelected ? "text-blue-900" : "text-blue-900 opacity-20"
                    }`}
                  >
                    {tempYear}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>




      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="p-5 mt-5 bg-white">
        <View className="relative" style={{ height: 1500 }}>
          {Array.from({ length: 15 }, (_, index) => {
            const hour = 9 + index;
            return (
              <View key={index} className="flex flex-row items-start absolute left-0 right-0" style={{ top: index * 100 }}>
                <View className="w-12">
                  <Text className="text-gray-400 text-sm">
                    {`${hour}:00`}
                  </Text>
                </View>
                <View className="flex-1 relative">
                  <View className="absolute left-3 top-0 w-full h-[1px] bg-gray-200" />
                </View>
              </View>
            );
          })}

          {filteredMeetings.map((meeting, idx) => {
            const { top, height } = calculatePosition(meeting.startTime, meeting.endTime);
            return (
              <TouchableOpacity
                key={idx}
                className={`absolute left-16 right-0 ${meeting.borderColor} border-l-4 bg-white shadow-md rounded-lg`}
                style={{
                  top,
                  height: 150,
                  maxHeight: 150,
                }}
                onPress={() => setSelectedMeeting(meeting)}
              >
                <View className="p-4 pt-2">
                  <View className="flex flex-row items-center justify-between mt-2">
                    <Text className="text-lg font-semibold text-gray-900 truncate">
                      {meeting.title}
                    </Text>
                    {meeting.now && (
                      <Text className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        NOW
                      </Text>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500 truncate">{meeting.room}</Text>
                  <View className="flex flex-row items-center justify-between mt-5">
                    <Text className="text-sm text-gray-500">
                      <Text>{meeting.startTime}</Text>
                      <Text> – </Text>
                      <Text>{meeting.endTime}</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
  visible={!!selectedMeeting}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setSelectedMeeting(null)}
>
  <View className="flex-1 bg-black/50">
    <View className="flex-1 justify-end">
      <View className="bg-white rounded-t-3xl p-6 shadow-lg">
        {selectedMeeting && (
          <>
            {/* Header with gradient background */}
            <View className=" -m-6 mb-2 p-6 rounded-t-3xl">
              <Text className="text-2xl font-bold text-blue-900 ">
                {selectedMeeting.title}
              </Text>
            </View>

            {/* Meeting Details Section */}
            <View className="space-y-4">
              {/* Date & Time Card */}
              <View className="bg-blue-50 p-4 rounded-xl flex-row items-center">
                <View className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Image
                    source={icons.calendar}
                    className="w-5 h-5"
                    resizeMode="contain"
                    tintColor="white"
                  />
                </View>
                <View>
                  <Text className="text-xs text-blue-500 font-medium">DATE & TIME</Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {selectedMeeting.date}, {selectedMeeting.startTime} – {selectedMeeting.endTime}
                  </Text>
                </View>
              </View>

              {/* Room Card */}
              <View className="bg-purple-50 p-4 rounded-xl flex-row items-center">
                <View className="bg-purple-500 p-2 rounded-lg mr-3">
                  <Image
                    source={icons.wide}
                    className="w-5 h-5"
                    resizeMode="contain"
                    tintColor="white"
                  />
                </View>
                <View>
                  <Text className="text-xs text-purple-500 font-medium">ROOM</Text>
                  <Text className="text-base text-gray-800 font-semibold">
                    {selectedMeeting.room}
                  </Text>
                </View>
              </View>

              {/* Participants Section */}
              <View className="bg-green-50 p-4 rounded-xl">
                <View className="flex-row items-center mb-3">
                  <View className="bg-green-500 p-2 rounded-lg mr-3">
                    <Image
                      source={icons.member}
                      className="w-5 h-5"
                      resizeMode="contain"
                      tintColor="white"
                    />
                  </View>
                  <Text className="text-xs text-green-500 font-medium">PARTICIPANTS</Text>
                </View>
                <Text className="text-base text-gray-800">
                  {selectedMeeting.participants.join(', ')}
                </Text>
              </View>
            </View>

            <Text className="text-xs text-center text-gray-400 my-4">
              We adhere entirely to the data security standards of the meeting system.
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSelectedMeeting(null)}
              className="bg-blue-900 py-4 rounded-xl mt-2"
            >
              <Text className="text-center text-white font-semibold text-base">
                Close
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  </View>
</Modal>


      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={isDatePickerOpen}
        date={selectedDate}
        onConfirm={(date) => {
          console.log("Selected date:", date);
          handleDateSelection(date);
        }}
        onCancel={() => {
          console.log("Date picker cancelled");
          setIsDatePickerOpen(false);
        }}
        mode="date"
        title="Select a Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
};

export default Home;
