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
    minute: '2-digit',
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
];

const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * colorPalette.length);
  return colorPalette[randomIndex];
};

const Home = () => {
  const today = new Date();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Removed tab states and logic

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
  };

  // Dashboard Card Component
  const DashboardCard = ({
    title,
    value,
    icon,
    color
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
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
  const BookingCard = ({
    item,
    isQuickBooking = false
  }: {
    item: IMeeting | ITransportBooking,
    isQuickBooking?: boolean
  }) => {
    const isRoom = 'roomId' in item;
    const location = isRoom
      ? getRoomName(item.roomId)
      : getTransportName((item as ITransportBooking).transportId);

    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        onPress={() => isQuickBooking ? handleQuickBook(item) : setSelectedItem(item)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">{location}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              isQuickBooking
                ? 'bg-green-100'
                : item.isOngoing
                ? 'bg-green-100'
                : 'bg-blue-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isQuickBooking
                  ? 'text-green-700'
                  : item.isOngoing
                  ? 'text-green-700'
                  : 'text-blue-700'
              }`}
            >
              {isQuickBooking ? 'Book Again' : item.isOngoing ? 'NOW' : item.startTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      <Header />

      {/* 
        Removed the tab code. Everything below is now 
        shown by default (formerly the "overview" section).
      */}

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Welcome Section */}
        <View className="bg-blue-900 rounded-2xl p-5 mb-4">
          <Text className="text-white text-xl font-bold">Welcome! 👋</Text>
          <Text className="text-blue-200 mt-1">Here's your booking overview</Text>
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

        <View className="flex-row mb-6">
          <DashboardCard
            title="Upcoming"
            value={upcomingMeetings.length}
            icon={icons.door}
            color="#8B5CF6"
          />
          <DashboardCard
            title="Upcoming"
            value={upcomingTransports.length}
            icon={icons.car}
            color="#F59E0B"
          />
        </View>

        {/* Recent Bookings */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Recent Bookings</Text>
            <TouchableOpacity
              onPress={() => router.push('/(root)/my-booking')}
              className="bg-blue-900 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          {[...roomsData, ...transportData]
            .sort(
              (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            )
            .slice(0, 3)
            .map((item, index) => (
              <BookingCard key={index} item={item} />
            ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-[200px]">
          <Text className="text-lg font-bold text-gray-800 mb-3">Quick Booking</Text>
          <View className="space-y-2">
            {[...roomsData, ...transportData]
              .sort(
                (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
              )
              .slice(0, 4)
              .map((item, index) => (
                <BookingCard key={index} item={item} isQuickBooking={true} />
              ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal for Selected Item Details */}
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
                    <Text
                      numberOfLines={2}
                      className="text-xl font-extrabold text-blue-900"
                    >
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
                          <Text className="text-[10px] text-purple-500 font-semibold">
                            ROOM
                          </Text>
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
                        <Text className="text-[10px] text-orange-500 font-semibold">
                          STATUS
                        </Text>
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

      {/* DatePicker */}
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
