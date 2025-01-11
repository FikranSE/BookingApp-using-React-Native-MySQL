import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { icons } from "@/constants";
import {
  IMeeting,
  ITransportBooking,
  meetings as dummyMeetings,
  transportBookings as dummyTransportBookings,
  rooms,
  transportList,
} from "@/lib/dummyData";

// Helper functions from Home screen
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

const MyBooking = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<"ALL" | "ROOM" | "TRANSPORT">("ALL");
  const [selectedItem, setSelectedItem] = useState<IMeeting | ITransportBooking | null>(null);

  // Combine and sort all bookings
  const allBookings = [...dummyMeetings, ...dummyTransportBookings].sort((a, b) => {
    const dateA = "meetingDate" in a ? a.meetingDate : a.bookingDate;
    const dateB = "meetingDate" in b ? b.meetingDate : b.bookingDate;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Filter bookings based on selected type
  const filteredBookings = allBookings.filter(booking => {
    if (selectedType === "ALL") return true;
    if (selectedType === "ROOM") return "meetingId" in booking;
    return "transportBookingId" in booking;
  });

  // Group bookings by status
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const status = getItemStatus(booking);
    if (!acc[status]) acc[status] = [];
    acc[status].push(booking);
    return acc;
  }, {} as Record<string, (IMeeting | ITransportBooking)[]>);

  // Booking Card Component
  const BookingCard = ({ item }: { item: IMeeting | ITransportBooking }) => {
    const isRoom = "roomId" in item;
    const location = isRoom ? getRoomName(item.roomId) : getTransportName((item as ITransportBooking).transportId);
    const date = isRoom ? item.meetingDate : item.bookingDate;
    
    return (
      <TouchableOpacity 
        className="bg-white p-4 rounded-xl mb-3 shadow-sm"
        onPress={() => setSelectedItem(item)}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>{item.title}</Text>
            <Text className="text-xs text-gray-500 mt-1">{location}</Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-xs font-medium text-blue-700">
              {item.startTime} - {item.endTime}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="bg-gray-100 px-2 py-1 rounded-lg mr-2">
            <Text className="text-xs text-gray-600">{date}</Text>
          </View>
          <View className={`px-2 py-1 rounded-lg ${isRoom ? 'bg-purple-100' : 'bg-green-100'}`}>
            <Text className={`text-xs ${isRoom ? 'text-purple-700' : 'text-green-700'}`}>
              {isRoom ? 'Room' : 'Transport'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingTypeText = (type: string) => {
    const displayText = type === "ALL" ? type : type.charAt(0) + type.slice(1).toLowerCase();
    return <Text className={`text-sm font-semibold ${selectedType === type ? 'text-white' : 'text-gray-600'}`}>
      {displayText}
    </Text>;
  };

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">My Bookings</Text>
        <View className="w-6"></View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 py-3">
        {(["ALL", "ROOM", "TRANSPORT"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            className={`mr-2 px-4 py-2 rounded-lg ${
              selectedType === type ? 'bg-blue-900' : 'bg-white'
            }`}
          >
            {renderBookingTypeText(type)}
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView className="flex-1 px-4">
        {Object.entries(groupedBookings).map(([status, bookings]) => (
          <View key={status} className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">{status}</Text>
            {bookings.map((booking, index) => (
              <BookingCard key={index} item={booking} />
            ))}
          </View>
        ))}
        {Object.keys(groupedBookings).length === 0 && (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 text-center">No bookings found</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
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
                            source={icons.car}
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

                  {/* Close Button */}
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
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyBooking;