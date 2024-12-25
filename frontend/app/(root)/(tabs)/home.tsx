import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "react-native-date-picker";
import { icons } from "@/constants";
import Header from "@/components/Header";

// 1) Import Meetings dan nama bulan/hari dari dummyData
import { meetings as dummyMeetings, Meeting, monthNames, dayNames } from "@/lib/dummyData";

const Home = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // 2) Gunakan data meeting dari dummyData
  const meetings: Meeting[] = dummyMeetings;

  // 3) Fungsi handle date selection
  const handleDateSelection = (date: Date) => {
    try {
      setSelectedDate(date);
      setIsDatePickerOpen(false);
    } catch (error) {
      console.error("DatePicker error:", error);
    }
  };

  // 4) Fungsi mengecek apakah tanggal terpilih adalah hari ini
  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  // 5) Komponen penanggalan
  const day = selectedDate.getDate();
  const month = monthNames[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();
  const dayName = dayNames[selectedDate.getDay()];

  // 6) Fungsi mengonversi waktu (HH:mm) ke menit total
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // 7) Fungsi hitung posisi top & height untuk menempatkan card di timeline
  const calculatePosition = (startTime: string, endTime: string, hourHeight: number = 100) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Timeline mulai jam 9 pagi => 9 * 60 = 540
    const startOffset = startMinutes - 9 * 60;
    const duration = endMinutes - startMinutes;

    return {
      top: (startOffset / 60) * hourHeight,
      height: (duration / 60) * hourHeight,
    };
  };

  // 8) Fungsi untuk menentukan status (Past, Now, Upcoming) meeting
  const getMeetingStatus = (meeting: Meeting): string => {
    // Ubah "date" ke Date object, bandingkan dengan hari ini
    const meetingDate = new Date(meeting.date);
    const currentDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const meetingDateOnly = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());

    // Jika meetingDate < hari ini => Past
    if (meetingDateOnly < currentDateOnly) {
      return "Past";
    }
    // Jika meetingDate > hari ini => Upcoming
    if (meetingDateOnly > currentDateOnly) {
      return "Upcoming";
    }
    // Jika sama dengan hari ini, cek "now" property
    return meeting.now ? "Now" : "Today";
  };

  // 9) Filter meeting berdasarkan selectedDate
  const filteredMeetings = meetings.filter(
    (meeting) => meeting.date === selectedDate.toISOString().split("T")[0]
  );

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header Section */}
      <Header />

      {/* Date Section */}
      <View className="px-6 mt-6">
        {isToday(selectedDate) && (
          <Text className="text-blue-900 font-JakartaBold text-sm shadow-sm">TODAY</Text>
        )}
        <Text className="text-3xl font-JakartaMedium text-blue-900 mb-1">
          {month} {day}, {year}
        </Text>
        <Text className="text-lg font-JakartaMedium text-blue-700 italic">
          {dayName}
        </Text>

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
                index === selectedDate.getMonth()
                  ? "border-blue-900 bg-blue-900"
                  : "bg-white border-blue-900"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  index === selectedDate.getMonth()
                    ? "text-white"
                    : "text-blue-900"
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
          {Array.from(
            { length: new Date(year, selectedDate.getMonth() + 1, 0).getDate() },
            (_, index) => {
              const tempDay = index + 1;
              const isSelected = tempDay === selectedDate.getDate();
              const shortDayName = dayNames[new Date(year, selectedDate.getMonth(), tempDay).getDay()].substring(0, 3);

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
                    {shortDayName}
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
            }
          )}
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

      {/* Timeline / Content Section */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="p-5 mt-5 bg-white">
        <View className="relative" style={{ height: 1500 }}>
          {/* Baris waktu dari jam 9 pagi hingga jam 23 (9 + 14 = 23) */}
          {Array.from({ length: 15 }, (_, index) => {
            const hour = 9 + index;
            return (
              <View
                key={index}
                className="flex flex-row items-start absolute left-0 right-0"
                style={{ top: index * 100 }}
              >
                <View className="w-12">
                  <Text className="text-gray-400 text-sm">{`${hour}:00`}</Text>
                </View>
                <View className="flex-1 relative">
                  <View className="absolute left-3 top-0 w-full h-[1px] bg-gray-200" />
                </View>
              </View>
            );
          })}

          {/* Render jadwal dari filteredMeetings */}
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

                    {/* Tampilkan label "NOW" jika meeting.now = true */}
                    {meeting.now && (
                      <Text className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        NOW
                      </Text>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500 truncate">
                    {meeting.room}
                  </Text>
                  <View className="flex flex-row items-center justify-between mt-5">
                    <Text className="text-sm text-gray-500">
                      {meeting.startTime} – {meeting.endTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal Detail Meeting */}
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
                  {/* Header Title */}
                  <View className="-m-6 mb-2 p-6 rounded-t-3xl">
                    <Text className="text-2xl font-bold text-blue-900 ">
                      {selectedMeeting.title}
                    </Text>
                  </View>

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

                    {/* Status Meeting */}
                    <View className="bg-orange-50 p-4 rounded-xl flex-row items-center">
                      <View className="bg-orange-400 p-2 rounded-lg mr-3">
                        <Image
                          source={icons.clock}
                          className="w-5 h-5"
                          resizeMode="contain"
                          tintColor="white"
                        />
                      </View>
                      <View>
                        <Text className="text-xs text-orange-500 font-medium">STATUS</Text>
                        <Text className="text-base text-gray-800 font-semibold">
                          {getMeetingStatus(selectedMeeting)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Penjelasan Tambahan / Info */}
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
