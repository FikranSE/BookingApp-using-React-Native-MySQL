import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { icons } from "@/constants";
import Header from "@/components/Header";
import { rooms, commonTimeSlots } from "@/lib/dummyData"; 
import InputField from "@/components/InputField";

// Fungsi bantu: cek apakah date1 < date2 (hanya bandingkan Y/M/D, tanpa jam)
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function isBeforeDay(d1: Date, d2: Date) {
  // Apakah d1 < d2 untuk Y/M/D
  if (d1.getFullYear() < d2.getFullYear()) return true;
  if (d1.getFullYear() > d2.getFullYear()) return false;

  // same year, cek month
  if (d1.getMonth() < d2.getMonth()) return true;
  if (d1.getMonth() > d2.getMonth()) return false;

  // same month, cek day
  return d1.getDate() < d2.getDate();
}

function isAfterDay(d1: Date, d2: Date) {
  // kebalikan isBeforeDay, plus tidak sama
  return isBeforeDay(d2, d1);
}

const NewMeeting = () => {
  const [activeTab, setActiveTab] = useState("rooms");
  const [name, setName] = useState("Grooming");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State Start/End Time
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);

  // State Room
  const [room, setRoom] = useState<string | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  // Ambil "hari ini" (tanpa jam) dan "waktu sekarang (menit)"
  const today = new Date();                       // jam sekarang
  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  // Format date => dd/mm/yyyy
  const formatDate = (dateVal: Date) => {
    return dateVal.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Konversi "09:00 AM" → total menit
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    else if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Cek apakah timeslot < jam sekarang, jika date = hari ini
  function isSlotInPast(selectedDate: Date, slotTime: string) {
    // Jika selectedDate < hari ini => slot past
    if (isBeforeDay(selectedDate, todayWithoutTime)) {
      return true; // semuana past
    }
    // Jika selectedDate > hari ini => semuana future => false
    if (isAfterDay(selectedDate, todayWithoutTime)) {
      return false; 
    }
    // Kalau selectedDate = hari ini, cek slotTime < now
    const slotMinutes = timeToMinutes(slotTime);
    return slotMinutes < nowMinutes;
  }

  // Cek ketersediaan slot untuk room
  function isTimeSlotAvailable(roomId: number, slotTime: string, isStartTime = true) {
    const selectedRoom = rooms.find((r) => Number(r.id) === roomId);
    if (!selectedRoom) return true;

    const slotMins = timeToMinutes(slotTime);

    // Bandingkan dengan booking existing
    return !selectedRoom.timeSlots.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      if (isStartTime) {
        return slotMins >= bStart && slotMins < bEnd;
      } else {
        const st = startTime ? timeToMinutes(startTime) : 0;
        return (st < bEnd && slotMins > bStart);
      }
    });
  }

  // Cek ketersediaan room (butuh startTime & endTime)
  function isRoomAvailable(roomId: number) {
    if (!startTime || !endTime) return true;
    const selectedRoom = rooms.find((r) => Number(r.id) === roomId);
    if (!selectedRoom) return true;
    const stM = timeToMinutes(startTime);
    const etM = timeToMinutes(endTime);
    return !selectedRoom.timeSlots.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return (stM < bEnd && etM > bStart);
    });
  }

  // Reset endTime jika tak valid
  const handleStartTimeSelect = (time: string) => {
    setStartTime(time);
    if (endTime) {
      const endMins = timeToMinutes(endTime);
      const startMins = timeToMinutes(time);
      if (endMins <= startMins || endMins > startMins + 240) {
        setEndTime(null);
      }
    }
  };

  // ---- TimeDropdown
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

    // Cek room availability
    const getRoomAvailability = (timeStr: string) => {
      return rooms.filter((rm) =>
        isTimeSlotAvailable(Number(rm.id), timeStr, isStartTime)
      );
    };

    // Validasi End Time => end > start & max 4 jam
    const isValidEndTime = (timeStr: string) => {
      if (isStartTime) return true;
      if (!startTime) return false;
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
          // 1) Apakah slotTime di masa lalu?
          const inPast = isSlotInPast(date, slotTime);
          // 2) Apakah endTime valid?
          const validEnd = isValidEndTime(slotTime);
          // 3) Apakah room tersedia?
          const availableRooms = getRoomAvailability(slotTime);

          // canSelect => slot tidak di masa lalu & endTime valid
          // serta jika endTime => startTime sudah diisi
          let canSelect = !inPast && validEnd;
          if (!isStartTime && !startTime) canSelect = false; // EndTime butuh startTime

          const disabled = !canSelect || availableRooms.length === 0;
          return (
            <TouchableOpacity
              key={idx}
              className={`p-4 border-b border-gray-100 ${
                disabled ? "opacity-50" : ""
              }`}
              onPress={() => {
                if (!disabled) {
                  if (isStartTime) handleStartTimeSelect(slotTime);
                  else onSelect(slotTime);
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

                  {/* Tampilkan info "past time" jika inPast */}
                  {inPast && (
                    <Text className="text-sm text-gray-500 ml-2">
                      (Past time)
                    </Text>
                  )}

                  {/* Info invalid endTime range */}
                  {!validEnd && !isStartTime && !inPast && (
                    <Text className="text-sm text-gray-500 ml-2">
                      Invalid range
                    </Text>
                  )}
                </View>
              </View>

              {/* Tampilkan rooms info jika canSelect & availableRooms.length>0 */}
              {canSelect && availableRooms.length > 0 && (
                <View className="mt-1">
                  <Text className="text-sm text-gray-500">
                    Available:{" "}
                    {availableRooms.map((r) => r.name.split(" ")[0]).join(", ")}
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

  // ---- RoomDropdown
  const RoomDropdown = () => (
    <View className="absolute z-50 w-full bg-white rounded-xl mt-1 shadow-lg">
      <ScrollView className="max-h-48">
        {rooms.map((roomItem) => {
          const available = isRoomAvailable(Number(roomItem.id));
          return (
            <TouchableOpacity
              key={roomItem.id}
              className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${
                !available ? "opacity-50" : ""
              }`}
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
                <Text className="text-gray-500 text-sm">
                  Capacity: {roomItem.capacity}
                </Text>
              </View>
              <Text
                className={`text-sm ${
                  available ? "text-green-600" : "text-red-500"
                }`}
              >
                {available ? "Available" : "Booked"}
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
                activeTab === "transportation"
                  ? "text-blue-900"
                  : "text-gray-500"
              }`}
            >
              Transportation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
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
                      ? rooms.find((r) => r.id.toString() === room)?.name
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
                  onPress={() => console.log("Creating meeting...")}
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
              <Text className="text-gray-500">
                Transportation booking form coming soon
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* DateTimePicker */}
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
