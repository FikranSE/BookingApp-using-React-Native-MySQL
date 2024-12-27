// Home.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "react-native-date-picker";

// Import data & icons dari @/lib/dummyData dan @/constants
import {
  IMeeting,
  ITransportBooking,
  meetings as dummyMeetings,
  transportBookings as dummyTransportBookings,
  rooms,
  transportList,
  monthNames,
  dayNames,
} from "@/lib/dummyData";
import {icons} from "@/constants";
function getRoomName(roomId: string): string {
  const found = rooms.find((r) => r.roomId === roomId);
  return found ? `${found.sizeName} meeting room - ${found.roomName}` : roomId;
}

function getTransportName(transportId: string): string {
  const found = transportList.find((t) => t.transportId === transportId);
  return found ? found.transportName : transportId;
}

// Palet warna
const colorPalette = [
  "#1E3A8A",
  "#5C6AC4",
  "#15803D",
  "#B91C1C",
  "#3B82F6",
  "#C026D3",
  "#DB2777",
  "#EA580C",
];

// Ambil warna acak dari palet
const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * colorPalette.length);
  return colorPalette[randomIndex];
};

/**
 * Mengembalikan string "X seconds/minutes/hours/days/weeks/months/years left/ago"
 * @param diffMs selisih waktu (dalam milidetik) => "past" bila positif, "future" bila negatif
 */
function formatTimeDiff(diffMs: number): string {
  // Past = diffMs > 0 (now - endTime)
  // Future = diffMs < 0 (startTime - now)
  // Kita ambil abs untuk magnitude
  const absDiff = Math.abs(diffMs);

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day; // simplifying 1 month = 30 days
  const year = 365 * day; // simplifying 1 year = 365 days

  let result = "";
  if (absDiff < minute) {
    // kurang dari 1 menit -> seconds
    const s = Math.floor(absDiff / second);
    result = `${s} second${s > 1 ? "s" : ""}`;
  } else if (absDiff < hour) {
    // minutes
    const m = Math.floor(absDiff / minute);
    result = `${m} minute${m > 1 ? "s" : ""}`;
  } else if (absDiff < day) {
    // hours
    const h = Math.floor(absDiff / hour);
    result = `${h} hour${h > 1 ? "s" : ""}`;
  } else if (absDiff < week) {
    // days
    const d = Math.floor(absDiff / day);
    result = `${d} day${d > 1 ? "s" : ""}`;
  } else if (absDiff < month) {
    // weeks
    const w = Math.floor(absDiff / week);
    result = `${w} week${w > 1 ? "s" : ""}`;
  } else if (absDiff < year) {
    // months
    const mo = Math.floor(absDiff / month);
    result = `${mo} month${mo > 1 ? "s" : ""}`;
  } else {
    // years
    const y = Math.floor(absDiff / year);
    result = `${y} year${y > 1 ? "s" : ""}`;
  }

  if (diffMs > 0) {
    // Sudah lewat
    return `${result} ago`;
  } else {
    // Belum mulai
    return `${result} left`;
  }
}

/**
 * Status:
 *   - Sebelum startTime => X left
 *   - Antara startTime & endTime => NOW
 *   - Setelah endTime => X ago
 */
function getItemStatus(item: IMeeting | ITransportBooking): string {
  // Ambil tanggal item
  const itemDateStr = "meetingId" in item ? item.meetingDate : item.bookingDate;

  // Parse waktu
  const parseTime = (time: string) => {
    const [hh, mm] = time.split(":").map(Number);
    return { hh, mm };
  };
  const { hh: startH, mm: startM } = parseTime(item.startTime);
  const { hh: endH, mm: endM } = parseTime(item.endTime);

  // Bentuk Date start & end
  const startDateTime = new Date(itemDateStr);
  startDateTime.setHours(startH, startM, 0, 0);

  const endDateTime = new Date(itemDateStr);
  endDateTime.setHours(endH, endM, 0, 0);

  // Waktu sekarang
  const now = new Date();

  // Jika masih belum mulai => perbedaan (start - now) < 0 => future
  if (now < startDateTime) {
    const diffMs = startDateTime.getTime() - now.getTime();
    return formatTimeDiff(-diffMs); // negatif => left
  }
  // Jika sedang berlangsung
  else if (now >= startDateTime && now <= endDateTime) {
    return "NOW";
  }
  // Jika sudah lewat
  else {
    const diffMs = now.getTime() - endDateTime.getTime();
    return formatTimeDiff(diffMs); // positif => ago
  }
}

const Home = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedScheduleType, setSelectedScheduleType] = useState<"ROOM" | "TRANSPORT">("ROOM");
  const [selectedItem, setSelectedItem] = useState<IMeeting | ITransportBooking | null>(null);

  // Data dummy
  const roomsData: IMeeting[] = dummyMeetings;
  const transportData: ITransportBooking[] = dummyTransportBookings;

  // REF untuk menyimpan color agar tetap konsisten
  const colorMapRef = useRef<Record<string, string>>({});

  const getItemColor = (item: IMeeting | ITransportBooking, idx: number) => {
    const dateStr = "meetingId" in item ? item.meetingDate : item.bookingDate;
    const key = `${selectedScheduleType}_${dateStr}_${item.startTime}_${item.endTime}_${item.title}_${idx}`;
    if (!colorMapRef.current[key]) {
      colorMapRef.current[key] = getRandomColor();
    }
    return colorMapRef.current[key];
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const day = selectedDate.getDate();
  const month = monthNames[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();
  const dayName = dayNames[selectedDate.getDay()];

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Menghitung posisi card di timeline
  const calculatePosition = (startTime: string, endTime: string, hourHeight: number = 90) => {
    // Timeline dimulai jam 9:00 -> 9 * 60 = 540
    const startOffset = timeToMinutes(startTime) - 540;
    const duration = timeToMinutes(endTime) - timeToMinutes(startTime);

    return {
      top: (startOffset / 60) * hourHeight,
      height: (duration / 60) * hourHeight,
    };
  };

  // Filter data by date
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const filteredMeetings = roomsData.filter((m) => m.meetingDate === selectedDateStr);
  const filteredTransportBookings = transportData.filter((t) => t.bookingDate === selectedDateStr);
  const dataToRender = selectedScheduleType === "ROOM" ? filteredMeetings : filteredTransportBookings;

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header Sederhana */}
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-blue-900">Schedule Timeline</Text>
      </View>

      {/* FILTER SECTION */}
      <View className="px-4">
        <View className="bg-white rounded-2xl shadow-md px-4 py-5 relative overflow-hidden">
          {/* Dekorasi Latar (opsional) */}
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 120,
              height: 120,
              backgroundColor: "#dbeafe",
              borderRadius: 60,
              opacity: 0.4,
              transform: [{ scale: 1.5 }],
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -70,
              left: -50,
              width: 200,
              height: 200,
              backgroundColor: "#e0f2fe",
              borderRadius: 100,
              opacity: 0.4,
              transform: [{ scale: 1.2 }],
            }}
          />

          {/* Filter Atas */}
          <View className="flex-row items-center justify-between mb-3 z-10">
            <View>
              <Text className="text-xl font-extrabold text-blue-900">Filter</Text>
              {isToday(selectedDate) && (
                <Text className="text-xs font-semibold text-green-600">It's Today!</Text>
              )}
            </View>

            {/* Tombol Switcher */}
            <View className="flex-row">
              <TouchableOpacity
                className={`rounded-full px-3 py-2 mr-1 flex-row items-center ${
                  selectedScheduleType === "ROOM"
                    ? "bg-blue-900"
                    : "border border-blue-900 bg-white"
                }`}
                onPress={() => setSelectedScheduleType("ROOM")}
              >
                <Image
                  source={icons.door}
                  className="w-4 h-4 mr-1"
                  resizeMode="contain"
                  style={{
                    tintColor: selectedScheduleType === "ROOM" ? "#fff" : "#1E3A8A",
                  }}
                />
                <Text
                  className={`text-xs font-semibold ${
                    selectedScheduleType === "ROOM" ? "text-white" : "text-blue-900"
                  }`}
                >
                  Rooms
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`rounded-full px-3 py-2 flex-row items-center ${
                  selectedScheduleType === "TRANSPORT"
                    ? "bg-blue-900"
                    : "border border-blue-900 bg-white"
                }`}
                onPress={() => setSelectedScheduleType("TRANSPORT")}
              >
                <Image
                  source={icons.car}
                  className="w-4 h-4 mr-1"
                  resizeMode="contain"
                  style={{
                    tintColor: selectedScheduleType === "TRANSPORT" ? "#fff" : "#1E3A8A",
                  }}
                />
                <Text
                  className={`text-xs font-semibold ${
                    selectedScheduleType === "TRANSPORT" ? "text-white" : "text-blue-900"
                  }`}
                >
                  Transport
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Tanggal Pilihan */}
          <View className="z-10">
            <Text className="text-sm font-bold text-blue-900">
              {month} {day}, {year}
            </Text>
            <Text className="text-xs text-blue-700 italic mb-2">{dayName}</Text>
          </View>

          {/* Pilih Bulan */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2 z-10"
            contentContainerStyle={{ paddingHorizontal: 2 }}
          >
            {monthNames.map((mn, index) => {
              const isActive = index === selectedDate.getMonth();
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(index);
                    setSelectedDate(newDate);
                  }}
                  className={`px-3 py-1 rounded-full mr-1 mb-1 ${
                    isActive ? "bg-blue-800" : "border border-blue-700 bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? "text-white" : "text-blue-900/80"
                    }`}
                  >
                    {mn.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Pilih Tanggal (1..31) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-1 z-10"
            contentContainerStyle={{ paddingHorizontal: 2 }}
          >
            {Array.from(
              {
                length: new Date(year, selectedDate.getMonth() + 1, 0).getDate(),
              },
              (_, idx) => {
                const tempDay = idx + 1;
                const isSelected = tempDay === selectedDate.getDate();
                const shortDayName = dayNames[
                  new Date(year, selectedDate.getMonth(), tempDay).getDay()
                ].substring(0, 3);

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(tempDay);
                      setSelectedDate(newDate);
                    }}
                    className="items-center mr-2 mb-1"
                  >
                    <Text
                      className={`text-[10px] font-medium ${
                        isSelected ? "text-blue-900" : "text-blue-900/60"
                      }`}
                    >
                      {shortDayName}
                    </Text>
                    <View
                      className={`mt-1 rounded-full w-7 h-7 items-center justify-center ${
                        isSelected ? "bg-blue-800" : "bg-white border border-blue-700"
                      }`}
                    >
                      <Text
                        className={`text-[12px] font-bold ${
                          isSelected ? "text-white" : "text-blue-900"
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

          {/* Pilih Tahun */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2 z-10"
            contentContainerStyle={{ paddingHorizontal: 2 }}
          >
            {Array.from({ length: 10 }, (_, idx) => {
              // Range misal: currentYear - 5 s/d +4
              const tempYear = today.getFullYear() - 5 + idx;
              const isActive = tempYear === selectedDate.getFullYear();
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(tempYear);
                    setSelectedDate(newDate);
                  }}
                  className={`px-3 py-1 rounded-full mr-1 mb-1 ${
                    isActive ? "bg-blue-800" : "border border-blue-700 bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? "text-white" : "text-blue-900/80"
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

      {/* TIMELINE SECTION */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-4 pt-3 mt-2"
      >
        <View className="relative" style={{ height: 1400 }}>
          {/* Buat garis jam 9:00 s/d 23:00 */}
          {Array.from({ length: 15 }, (_, idx) => {
            const hour = 9 + idx;
            return (
              <View
                key={idx}
                className="absolute left-0 right-0 flex-row items-start"
                style={{ top: idx * 90 }}
              >
                <View className="w-12">
                  <Text className="text-blue-300 text-[11px] font-semibold">
                    {`${hour}:00`}
                  </Text>
                </View>
                <View className="flex-1 relative">
                  <View className="absolute left-3 top-0 w-full h-[1px] bg-blue-100" />
                </View>
              </View>
            );
          })}

          {/* Render Item (Meeting / Transport) */}
          {dataToRender.map((item, idx) => {
            const { startTime, endTime, title, description, participants, driverName } = item;
            const { top, height } = calculatePosition(startTime, endTime, 90);
            const borderColor = getItemColor(item, idx);
            const locationLabel =
              "roomId" in item ? getRoomName(item.roomId) : getTransportName(item.transportId);
            // Dapatkan status
            const status = getItemStatus(item);

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.9}
                className="absolute left-14 right-3 bg-white shadow-xl rounded-2xl overflow-hidden"
                style={{
                  top,
                  height: height < 90 ? 90 : height,
                }}
                onPress={() => setSelectedItem(item)}
              >
                {/* Garis tipis di atas */}
                <View
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ 
                    backgroundColor: borderColor,
                    opacity: 0.8 
                  }}
                />

                {/* Overlay Kaca (opsional) */}
                <View className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

                {/* Isi Card */}
                <View className="p-3 flex-1">
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-8 h-8 rounded-xl mr-2 items-center justify-center"
                        style={{
                          backgroundColor: borderColor,
                          shadowColor: borderColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 3,
                        }}
                      >
                        <Image
                          source={selectedScheduleType === "ROOM" ? icons.door : icons.car}
                          className="w-5 h-5"
                          resizeMode="contain"
                          tintColor="#ffffff"
                        />
                      </View>

                      {/* Title + Waktu */}
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-base font-bold text-gray-800">
                          {title}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {startTime} - {endTime}
                        </Text>
                      </View>
                    </View>

                    {/* STATUS BADGE */}
                    <View className="bg-green-500 px-3 py-1 rounded-full ml-2">
                      <Text className="text-[10px] font-bold text-white">{status}</Text>
                    </View>
                  </View>

                  {/* Location & Description */}
                  <View className="space-y-1.5">
                    <View className="flex-row items-center">
                      <View className="w-4 items-center mr-1">
                        <Image
                          source={icons.location}
                          className="w-3.5 h-3.5"
                          resizeMode="contain"
                          tintColor="#6B7280"
                        />
                      </View>
                      <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>
                        {locationLabel}
                      </Text>
                    </View>

                    {description && (
                      <View className="flex-row items-start">
                        <View className="w-4 items-center mr-1 mt-1">
                          <Image
                            source={icons.info}
                            className="w-3.5 h-3.5"
                            resizeMode="contain"
                            tintColor="#6B7280"
                          />
                        </View>
                        <Text className="text-xs text-gray-600 flex-1" numberOfLines={2}>
                          {description}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Participants or driver */}
                  <View className="mt-2 pt-2 border-t border-gray-100">
                    {participants && participants.length > 0 ? (
                      <View className="flex-row items-center">
                        <View className="flex-row">
                          {participants.slice(0, 3).map((participant, pIdx) => (
                            <View
                              key={pIdx}
                              className="rounded-full overflow-hidden border-2 border-white"
                              style={{
                                marginLeft: pIdx > 0 ? -8 : 0,
                                zIndex: 3 - pIdx,
                              }}
                            >
                              <Image
                                source={{ uri: participant.avatar }}
                                className="w-6 h-6"
                                resizeMode="cover"
                              />
                            </View>
                          ))}
                        </View>
                        {participants.length > 3 && (
                          <Text className="ml-2 text-xs text-gray-500">
                            +{participants.length - 3} more
                          </Text>
                        )}
                      </View>
                    ) : driverName && (
                      <View className="flex-row items-center">
                        <Image
                          source={icons.person}
                          className="w-4 h-4 mr-1"
                          resizeMode="contain"
                          tintColor="#6B7280"
                        />
                        <Text className="text-xs text-gray-600">
                          Driver: {driverName}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

    {/* Modal Detail */}
    <Modal
        visible={!!selectedItem}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="bg-white rounded-3xl p-6 w-11/12 shadow-lg">
            {selectedItem && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text numberOfLines={2} className="text-xl font-extrabold text-blue-900 flex-1">
                    {selectedItem.title}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedItem(null)}>
                    <Image
                      source={icons.close}
                      className="w-5 h-5"
                      resizeMode="contain"
                      tintColor="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  <View className="bg-blue-50 p-4 rounded-xl flex-row items-center">
                    <View className="bg-blue-500 p-3 rounded-lg mr-4">
                      <Image
                        source={icons.calendar}
                        className="w-4 h-4"
                        resizeMode="contain"
                        tintColor="white"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] text-blue-500 font-semibold">
                        DATE & TIME
                      </Text>
                      <Text className="text-[13px] text-gray-800 font-bold">
                        {"meetingId" in selectedItem
                          ? selectedItem.meetingDate
                          : selectedItem.bookingDate}
                        , {selectedItem.startTime} – {selectedItem.endTime}
                      </Text>
                    </View>
                  </View>

                  {"roomId" in selectedItem ? (
                    <View className="bg-purple-50 p-4 rounded-xl flex-row items-center">
                      <View className="bg-purple-500 p-3 rounded-lg mr-4">
                        <Image
                          source={icons.wide}
                          className="w-4 h-4"
                          resizeMode="contain"
                          tintColor="white"
                        />
                      </View>
                      <View>
                        <Text className="text-[10px] text-purple-500 font-semibold">ROOM</Text>
                        <Text className="text-[13px] text-gray-800 font-bold">
                          {getRoomName(selectedItem.roomId)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className="bg-purple-50 p-4 rounded-xl flex-row items-center">
                      <View className="bg-purple-500 p-3 rounded-lg mr-4">
                        <Image
                          source={icons.wide}
                          className="w-4 h-4"
                          resizeMode="contain"
                          tintColor="white"
                        />
                      </View>
                      <View>
                        <Text className="text-[10px] text-purple-500 font-semibold">
                          VEHICLE
                        </Text>
                        <Text className="text-[13px] text-gray-800 font-bold">
                          {getTransportName(selectedItem.transportId)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {"transportBookingId" in selectedItem && selectedItem.driverName && (
                    <View className="bg-green-50 p-4 rounded-xl flex-row items-center">
                      <View className="bg-green-500 p-3 rounded-lg mr-4">
                        <Image
                          source={icons.driver}
                          className="w-4 h-4"
                          resizeMode="contain"
                          tintColor="white"
                        />
                      </View>
                      <View>
                        <Text className="text-[10px] text-green-500 font-semibold">DRIVER</Text>
                        <Text className="text-[13px] text-gray-800 font-bold">
                          {selectedItem.driverName}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className="bg-orange-50 p-4 rounded-xl flex-row items-center">
                    <View className="bg-orange-400 p-3 rounded-lg mr-4">
                      <Image
                        source={icons.clock}
                        className="w-4 h-4"
                        resizeMode="contain"
                        tintColor="white"
                      />
                    </View>
                    <View>
                      <Text className="text-[10px] text-orange-500 font-semibold">STATUS</Text>
                      <Text className="text-[13px] text-gray-800 font-bold">
                        {getItemStatus(selectedItem)}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedItem.description && (
                  <View className="mt-4">
                    <Text className="text-sm text-gray-700">
                      {selectedItem.description}
                    </Text>
                  </View>
                )}

                {selectedItem.participants && selectedItem.participants.length > 0 && (
                  <View className="mt-4">
                    <Text className="text-xs font-semibold text-blue-900 mb-2">Participants</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedItem.participants.map((participant, pIdx) => (
                        <Image
                          key={pIdx}
                          source={{ uri: participant.avatar }}
                          className="w-10 h-10 rounded-full mr-2 border-2 border-white"
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setSelectedItem(null)}
                  className="bg-blue-900 mt-6 rounded-xl py-3"
                >
                  <Text className="text-center text-white font-bold text-sm">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* DatePicker (jika butuh pop-up) */}
      <DatePicker
        modal
        open={isDatePickerOpen}
        date={selectedDate}
        onConfirm={handleDateSelection}
        onCancel={() => setIsDatePickerOpen(false)}
        mode="date"
        title="Select a Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
};

export default Home;
