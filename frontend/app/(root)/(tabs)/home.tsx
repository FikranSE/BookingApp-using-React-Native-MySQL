import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "react-native-date-picker";
import { useRouter } from "expo-router";
import { icons } from "@/constants";
import Header from "@/components/Header";
 
import {
  IMeeting,
  ITransportBooking,
  meetings as dummyMeetings,
  transportBookings as dummyTransportBookings,
  rooms,
  transportList,
  rooms,
  transportList,
  monthNames,
  dayNames,
} from "@/lib/dummyData";

// Helper functions
function getRoomName(roomId: string): string {
  const found = rooms.find((r) => r.roomId === roomId);
  return found ? `${found.sizeName} meeting room - ${found.roomName}` : roomId;
}

function getTransportName(transportId: string): string {
  const found = transportList.find((t) => t.transportId === transportId);
  return found ? found.transportName : transportId;
}

function getItemStatus(item: IMeeting | ITransportBooking): string {
  if (item.isOngoing) {
    return "In Progress";
  }

  const itemDate = "meetingDate" in item ? item.meetingDate : item.bookingDate;
  const today = formatDateToString(new Date());
  
  if (itemDate < today) {
    return "Completed";
  }
  
  if (itemDate > today) {
    return "Upcoming";
  }
  
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  
  if (item.startTime > currentTime) {
    return "Today, Starting Soon";
  }
  
  if (item.endTime < currentTime) {
    return "Completed Today";
  }
  
  return "In Progress";
}

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const colorPalette = [
  "#1E3A8A",
  "#5C6AC4",
  "#15803D",
  "#B91C1C",
  "#3B82F6",
  "#C026D3",
  "#DB2777",
  "#EA580C",
  "#1E3A8A",
  "#5C6AC4",
  "#15803D",
  "#B91C1C",
  "#3B82F6",
  "#C026D3",
  "#DB2777",
  "#EA580C",
];

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
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings">("overview");
  const screenWidth = Dimensions.get("window").width;

  // Existing states
  const [selectedScheduleType, setSelectedScheduleType] = useState<"ROOM" | "TRANSPORT">("ROOM");
  const [selectedItem, setSelectedItem] = useState<IMeeting | ITransportBooking | null>(null);
  const colorMapRef = useRef<Record<string, string>>({});
  
  // Data
  const roomsData: IMeeting[] = dummyMeetings;
  const transportData: ITransportBooking[] = dummyTransportBookings;

  // Calculate dashboard metrics
  const todayMeetings = roomsData.filter(m => m.meetingDate === formatDateToString(today));
  const todayTransports = transportData.filter(t => t.bookingDate === formatDateToString(today));
  const upcomingMeetings = roomsData.filter(m => new Date(m.meetingDate) > today);
  const upcomingTransports = transportData.filter(t => new Date(t.bookingDate) > today);
  const handleQuickBook = (item: IMeeting | ITransportBooking) => {
    // Here you would implement the actual booking logic
    // For now, we'll just show the details modal
    setSelectedItem(item);
    // You could also add a success message or confirmation
  };
  // Dashboard Card Component
  const DashboardCard = ({ title, value, icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-500 font-medium">{title}</Text>
          <Text className="text-xl font-bold mt-1" style={{ color }}>{value}</Text>
        </View>
        <View className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Image source={icon} className="w-5 h-5" style={{ tintColor: color }} />
        </View>
      </View>
    </View>
  );

  // Recent Booking Card Component
  const BookingCard = ({ item, isQuickBooking = false }: { item: IMeeting | ITransportBooking, isQuickBooking?: boolean }) => {
    const isRoom = 'roomId' in item;
    const location = isRoom ? getRoomName(item.roomId) : getTransportName((item as ITransportBooking).transportId);
    
    return (
      <TouchableOpacity 
        className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        onPress={() => isQuickBooking ? handleQuickBook(item) : setSelectedItem(item)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>{item.title}</Text>
            <Text className="text-xs text-gray-500 mt-1">{location}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${isQuickBooking ? 'bg-green-100' : item.isOngoing ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Text className={`text-xs font-medium ${isQuickBooking ? 'text-green-700' : item.isOngoing ? 'text-green-700' : 'text-blue-700'}`}>
              {isQuickBooking ? 'Book Again' : item.isOngoing ? 'NOW' : item.startTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header */}
      <Header />

      {/* ======= FILTER SECTION ======= */}
      <View className=" px-4">
        <View className="bg-white rounded-2xl shadow-md px-4 py-5 relative overflow-hidden">
          {/* Ornament bulat (opsional) */}
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

          {/* Filter Title & Toggle */}
          <View className="flex-row items-center justify-between mb-3 z-10">
            <View>
              <Text className="text-xl font-extrabold text-blue-900">Filter</Text>
              {isToday(selectedDate) && (
                <Text className="text-xs font-semibold text-green-600">It’s Today!</Text>
              )}
            </View>

            {/* Toggle ROOM vs TRANSPORT */}
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
                    selectedScheduleType === "TRANSPORT"
                      ? "text-white"
                      : "text-blue-900"
                  }`}
                >
                  Transport
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dashboard Metrics */}
            <View className="flex-row mb-4">
              <DashboardCard
                title="Today's"
                value={todayMeetings.length}
                icon={icons.door}
                color="#3B82F6"
              />
              <DashboardCard
                title="Today's"
                value={todayTransports.length}
                icon={icons.car}
                color="#10B981"
              />
            </View>

          {/* Date Info */}
          <View className="z-10">
            <Text className="text-sm font-bold text-blue-900">
              {month} {day}, {year}
            </Text>
            <Text className="text-xs text-blue-700 italic mb-2">{dayName}</Text>
          </View>

          {/* ScrollView: Bulan */}
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
                  <Text className="text-white text-sm font-medium">See All</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ScrollView: Hari */}
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

          {/* ScrollView: Tahun */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2 z-10"
            contentContainerStyle={{ paddingHorizontal: 2 }}
          >
            {Array.from({ length: 10 }, (_, idx) => {
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

      {/* ======= TIMELINE SECTION ======= */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-4 pt-3 mt-2"
      >
        <View className="relative" style={{ height: 1400 }}>
          {/* Garis waktu jam 9 - 23 (9 + 14 = 23) */}
          {Array.from({ length: 15 }, (_, idx) => {
            const hour = 9 + idx;
            return (
              <View
                key={idx}
                className="absolute left-0 right-0 flex-row items-start"
                style={{ top: idx * 90 }}
              >
                <View className="w-12">
                  <Text className="text-blue-300 text-[11px] font-semibold">{`${hour}:00`}</Text>
                </View>
                <View className="flex-1 relative">
                  <View className="absolute left-3 top-0 w-full h-[1px] bg-blue-100" />
                </View>
              </View>
            );
          })}

          {/* Render Jadwal */}
          {dataToRender.map((item, idx) => {
            const { startTime, endTime, title, isOngoing } = item;
            const dateStr = "meetingId" in item ? item.meetingDate : item.bookingDate;
            const { top } = calculatePosition(startTime, endTime, 90);
            const borderColor = getItemColor(item, idx);

            // ROOM vs TRANSPORT name
            const locationLabel =
              "roomId" in item
                ? getRoomName(item.roomId)
                : getTransportName(item.transportId);

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.9}
                className="absolute left-14 right-3 bg-white shadow rounded-xl"
                style={{
                  top,
                  height: 130,
                  borderLeftWidth: 5,
                  borderLeftColor: borderColor,
                  paddingBottom: 3,
                }}
                onPress={() => setSelectedItem(item)}
              >
                <View className="p-3 pt-2">
                  {/* Title & Badge NOW */}
                  <View className="flex-row items-start justify-between">
                    <Text
                      numberOfLines={1}
                      className="flex-1 pr-2 text-sm font-bold text-blue-900"
                    >
                      {title}
                    </Text>
                    {isOngoing && (
                      <Text className="px-2 text-[10px] font-bold text-blue-700 bg-blue-100 rounded-full">
                        NOW
                      </Text>
                    )}
                  </View>

                  {/* ROOM / VEHICLE */}
                  <Text className="text-[11px] mt-1 text-gray-600 font-medium">
                    {locationLabel}
                  </Text>

                  {/* Time range */}
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-[11px] text-gray-500 font-semibold">
                      {startTime} – {endTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ======= MODAL DETAIL ======= */}
      <Modal
        visible={!!selectedItem}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedItem(null)}
      >
        <View className="flex-1 bg-black/40">
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-3xl p-5 shadow-2xl">
              {selectedItem && (
                <>
                  {/* Title */}
                  <View className="-m-5 mb-2 p-5 rounded-t-3xl">
                    <Text numberOfLines={2} className="text-xl font-extrabold text-blue-900">
                      {selectedItem.title}
                    </Text>
                  </View>

                  <View className="space-y-3">
                    {/* DATE & TIME Card */}
                    <View className="bg-blue-50 p-3 rounded-xl flex-row items-center">
                      <View className="bg-blue-500 p-2 rounded-lg mr-3">
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

                    {/* ROOM / VEHICLE Card */}
                    {"roomId" in selectedItem ? (
                      <View className="bg-purple-50 p-3 rounded-xl flex-row items-center">
                        <View className="bg-purple-500 p-2 rounded-lg mr-3">
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
                      <View className="bg-purple-50 p-3 rounded-xl flex-row items-center">
                        <View className="bg-purple-500 p-2 rounded-lg mr-3">
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

                    {/* STATUS Card */}
                    <View className="bg-orange-50 p-3 rounded-xl flex-row items-center">
                      <View className="bg-orange-400 p-2 rounded-lg mr-3">
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

                  <Text className="mt-4 text-[10px] text-center text-gray-400">
                    We adhere entirely to the data security standards
                    of the booking system.
                  </Text>

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    className="bg-blue-900 mt-3 rounded-xl py-3"
                  >
                    <Text className="text-center text-white font-bold text-sm">
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* DatePicker (opsional) */}
      <DatePicker
        modal
        open={isDatePickerOpen}
        date={selectedDate}
        onConfirm={(date) => {
          setSelectedDate(date);
          setIsDatePickerOpen(false);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
        mode="date"
      />
    </SafeAreaView>
  );
};

export default Home;