// NewMeeting.tsx (Contoh penamaan, boleh juga "AddBooking.tsx")
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { icons } from "@/constants";

// Komponen re-usable, misal 'Header' dan 'InputField'
import Header from "@/components/Header";
import InputField from "@/components/InputField";

// Import data dummy
import { rooms, commonTimeSlots } from "@/lib/dummyData";
import type { IRoom } from "@/lib/dummyData";

// ------------------- Helper untuk membandingkan tanggal -------------------
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function isBeforeDay(d1: Date, d2: Date) {
  // Apakah d1 < d2 (secara Year/Month/Day) 
  if (d1.getFullYear() < d2.getFullYear()) return true;
  if (d1.getFullYear() > d2.getFullYear()) return false;

  if (d1.getMonth() < d2.getMonth()) return true;
  if (d1.getMonth() > d2.getMonth()) return false;

  return d1.getDate() < d2.getDate();
}

function isAfterDay(d1: Date, d2: Date) {
  // Kebalikan isBeforeDay, plus tidak sama
  return isBeforeDay(d2, d1);
}

// ------------------- Komponen Utama -------------------
const NewMeeting = () => {
  const [activeTab, setActiveTab] = useState<"rooms" | "transportation">("rooms");

  // Form Fields
  const [name, setName] = useState("Grooming");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Start & End Time
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);

  // Room
  const [room, setRoom] = useState<string | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  // Helper date/time
  const today = new Date(); // jam sekarang
  const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  // Format dd/mm/yyyy
  const formatDate = (dateVal: Date) => {
    return dateVal.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Konversi "09:00 AM" → total menit (0 s/d 1439)
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    else if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Cek apakah slotTime di masa lalu
  function isSlotInPast(selectedDate: Date, slotTime: string) {
    // Jika selectedDate < today => past
    if (isBeforeDay(selectedDate, todayWithoutTime)) {
      return true;
    }
    // Jika selectedDate > today => future
    if (isAfterDay(selectedDate, todayWithoutTime)) {
      return false;
    }
    // Jika selectedDate = today => bandingkan jam
    const slotMinutes = timeToMinutes(slotTime);
    return slotMinutes < nowMinutes;
  }

  // Cek ketersediaan "Start Time" atau "End Time" pada timeSlots
  function isTimeSlotAvailable(roomId: string, slotTime: string, isStartTime = true) {
    const selectedRoom = rooms.find((r) => r.roomId === roomId);
    if (!selectedRoom) return true;

    const slotMins = timeToMinutes(slotTime);

    // Bandingkan dengan booking existing
    return !selectedRoom.timeSlots.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      if (isStartTime) {
        // StartTime tidak boleh berada di dalam interval bStart...bEnd
        return slotMins >= bStart && slotMins < bEnd;
      } else {
        // EndTime: 
        const st = startTime ? timeToMinutes(startTime) : 0;
        // Apakah interval [st, slotMins) overlap dengan [bStart, bEnd)
        return st < bEnd && slotMins > bStart;
      }
    });
  }

  // Cek ketersediaan room untuk interval [startTime, endTime]
  function isRoomAvailable(roomId: string) {
    if (!startTime || !endTime) return true;
    const selectedRoom = rooms.find((r) => r.roomId === roomId);
    if (!selectedRoom) return true;

    const stM = timeToMinutes(startTime);
    const etM = timeToMinutes(endTime);

    // Apakah interval [stM, etM) overlap dengan booking2 existing
    return !selectedRoom.timeSlots.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return stM < bEnd && etM > bStart; 
    });
  }

  // Jika user ganti StartTime, cek EndTime
  const handleStartTimeSelect = (time: string) => {
    setStartTime(time);
    if (endTime) {
      const endMins = timeToMinutes(endTime);
      const startMins = timeToMinutes(time);
      // Pastikan endTime > startTime dan max 4 jam jaraknya
      if (endMins <= startMins || endMins > startMins + 240) {
        setEndTime(null);
      }
    }
  };

  // ------------------- TimeDropdown -------------------
  const TimeDropdown = ({
    options,
    onSelect,
    visible,
    onClose,
    isStartTime = true,
  }: {
    options: { morning: string[]; afternoon: string[] };
    onSelect: (time: string) => void;
    visible: boolean;
    onClose: () => void;
    isStartTime?: boolean;
  }) => {
    if (!visible) return null;

    // Dapatkan room mana yg available di jam slotTime
    const getRoomAvailability = (timeStr: string) => {
      return rooms.filter((rm) => isTimeSlotAvailable(rm.roomId, timeStr, isStartTime));
    };

    // Validasi endTime => harus > startTime & max 4 jam
    const isValidEndTime = (timeStr: string) => {
      if (isStartTime) return true; // startTime bebas
      if (!startTime) return false; // endTime butuh startTime
      const st = timeToMinutes(startTime);
      const et = timeToMinutes(timeStr);
      return et > st && et <= st + 240;
    };

    const renderTimeSection = (title: string, slots: string[]) => (
      <View key={title}>
        <Text className="px-4 py-2 bg-gray-100 font-medium text-gray-600">
          {title}
        </Text>
        {slots.map((slotTime, idx) => {
          // (1) Apakah slotTime di masa lalu
          const inPast = isSlotInPast(date, slotTime);
          // (2) EndTime valid
          const validEnd = isValidEndTime(slotTime);
          // (3) room yg available
          const availableRooms = getRoomAvailability(slotTime);

          // Bisa dipilih?
          let canSelect = !inPast && validEnd;
          if (!isStartTime && !startTime) canSelect = false; // endTime butuh startTime

          const disabled = !canSelect || availableRooms.length === 0;

          return (
            <TouchableOpacity
              key={idx}
              className={`p-4 border-b border-gray-100 ${
                disabled ? "opacity-50" : ""
              }`}
              onPress={() => {
                if (!disabled) {
                  if (isStartTime) {
                    handleStartTimeSelect(slotTime);
                  } else {
                    onSelect(slotTime);
                  }
                  onClose();
                }
              }}
              disabled={disabled}
            >
              <View className="flex-col justify-between items-start">
                <Text className="text-blue-900 text-base">{slotTime}</Text>

                {/* Info detail */}
                <View className="flex-row items-center mt-1">
                  {canSelect && (
                    <Text
                      className={`text-sm ${
                        availableRooms.length > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {availableRooms.length > 0
                        ? `${availableRooms.length} room${
                            availableRooms.length > 1 ? "s" : ""
                          } available`
                        : "No rooms available"}
                    </Text>
                  )}

                  {inPast && (
                    <Text className="text-sm text-gray-500 ml-2">(Past time)</Text>
                  )}

                  {!validEnd && !isStartTime && !inPast && (
                    <Text className="text-sm text-gray-500 ml-2">Invalid range</Text>
                  )}
                </View>
              </View>

              {/* Tampilkan rooms info jika canSelect & availableRooms>0 */}
              {canSelect && availableRooms.length > 0 && (
                <View className="mt-1">
                  <Text className="text-sm text-gray-500">
                    Available:{" "}
                    {availableRooms
                      .map((r) => r.roomName.split(" ")[0]) // misal: "Melati", "Mawar"
                      .join(", ")}
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
          {renderTimeSection("Morning", options.morning)}
          {renderTimeSection("Afternoon", options.afternoon)}
        </ScrollView>
      </View>
    );
  };

  // ------------------- RoomDropdown -------------------
  const RoomDropdown = () => (
    <View className="absolute z-50 w-full bg-white rounded-xl mt-1 shadow-lg">
      <ScrollView className="max-h-48">
        {rooms.map((roomItem) => {
          const available = isRoomAvailable(roomItem.roomId);
          return (
            <TouchableOpacity
              key={roomItem.roomId}
              className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${
                !available ? "opacity-50" : ""
              }`}
              onPress={() => {
                if (available) {
                  setRoom(roomItem.roomId);
                  setShowRoomDropdown(false);
                }
              }}
              disabled={!available}
            >
              <View>
                <Text className="text-blue-900 text-base">
                  {roomItem.roomName}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Capacity: {roomItem.capacity}
                </Text>
              </View>
              <Text
                className={`text-sm ${available ? "text-green-600" : "text-red-500"}`}
              >
                {available ? "Available" : "Booked"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ------------------- Render -------------------
  return (
    <SafeAreaView className="flex-1 bg-slate-100 mt-5">

      <ScrollView className="flex-1 px-4">
        {/* Tabs */}
        <View className="flex-row bg-white rounded-t-xl">
          <TouchableOpacity
            onPress={() => setActiveTab("rooms")}
            className={`flex-1 py-3 ${
              activeTab === "rooms"
                ? "border-b-2 border-blue-900"
                : "border-b border-gray-200"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === "rooms" ? "text-blue-900" : "text-gray-500"
              }`}
            >
              Rooms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("transportation")}
            className={`flex-1 py-3 ${
              activeTab === "transportation"
                ? "border-b-2 border-blue-900"
                : "border-b border-gray-200"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === "transportation" ? "text-blue-900" : "text-gray-500"
              }`}
            >
              Transportation
            </Text>
          </TouchableOpacity>
        </View>

        {/* FORM Card */}
        <View className="bg-white px-4 py-6 rounded-b-xl shadow-sm">
          {activeTab === "rooms" ? (
            <View className="space-y-6">
              {/* 1) Meeting Name */}
              <InputField
                label="Meeting Name"
                value={name}
                onChangeText={setName}
              />

              {/* 2) Date */}
              <InputField
                label="Select Date"
                value={formatDate(date)}
                icon={icons.calendar}
                editable={false}
                onPress={() => setShowDatePicker(true)}
              />

              {/* 3) Start & End Time */}
              <View className="flex-row">
                {/* Start Time */}
                <View className="flex-1 mr-2 relative overflow-visible">
                  <InputField
                    label="Start Time"
                    value={startTime || ""}
                    icon={icons.arrowDown}
                    editable={false}
                    onPress={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
                  />
                  <TimeDropdown
                    options={commonTimeSlots}
                    onSelect={handleStartTimeSelect}
                    visible={showStartTimeDropdown}
                    onClose={() => setShowStartTimeDropdown(false)}
                    isStartTime={true}
                  />
                </View>

                {/* End Time */}
                <View className="flex-1 ml-2 relative overflow-visible">
                  <InputField
                    label="End Time"
                    value={endTime || ""}
                    icon={icons.arrowDown}
                    editable={false}
                    onPress={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
                  />
                  <TimeDropdown
                    options={commonTimeSlots}
                    onSelect={(time) => setEndTime(time)}
                    visible={showEndTimeDropdown}
                    onClose={() => setShowEndTimeDropdown(false)}
                    isStartTime={false}
                  />
                </View>
              </View>

              {/* 4) Room */}
              <View className="relative overflow-visible">
                <InputField
                  label="Select Room"
                  value={
                    room
                      ? rooms.find((r) => r.roomId === room)?.roomName || ""
                      : ""
                  }
                  icon={icons.arrowDown}
                  editable={false}
                  onPress={() => setShowRoomDropdown(!showRoomDropdown)}
                />
                {showRoomDropdown && <RoomDropdown />}
              </View>

              {/* 5) Create Button */}
              <View className="pt-4">
                <TouchableOpacity
                  className={`bg-blue-900 py-4 rounded-xl ${
                    !name || !startTime || !endTime || !room
                      ? "opacity-50"
                      : "active:opacity-90"
                  }`}
                  onPress={() => {
                    console.log("Creating meeting with =>", {
                      name,
                      date: date.toISOString().split("T")[0],
                      startTime,
                      endTime,
                      roomId: room,
                    });
                    // Lakukan penyimpanan / API call dsb
                  }}
                  disabled={!name || !startTime || !endTime || !room}
                >
                  <Text className="text-white text-center font-medium text-base">
                    Create
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Transportation Tab (placeholder)
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500">
                Transportation booking form coming soon
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* DateTimePicker untuk Date */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
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
