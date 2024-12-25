import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import Header from "@/components/Header";

// 1) Import data dummy dan assetIcons
import { rooms, transportation, assetIcons, TimeSlot, Room, Transport } from "@/lib/dummyData"; 

const Explore = () => {
  const [activeTab, setActiveTab] = useState("Rooms");
  const [showTimeSlots, setShowTimeSlots] = useState<string | null>(null);

  // 2) Buat helper function seperti sebelumnya (bisa dideklarasikan di sini atau di file utils terpisah)
  const getCapacityInterval = (capacity: number) => {
    if (capacity <= 5) return "3-5";
    if (capacity <= 10) return "5-10";
    return "10-15";
  };

  // 3) Memperbarui data rooms agar capacity-nya lebih informatif
  const updatedRooms = rooms.map((room) => ({
    ...room,
    capacity: getCapacityInterval(room.capacity),
  }));

  const TimeSlotsList = ({ timeSlots }: { timeSlots: TimeSlot[] }) => (
    <View className="mt-4 bg-slate-50 rounded-xl p-4">
      <Text className="text-lg font-semibold mb-3 text-gray-800">Today's Schedule</Text>
      <View className="space-y-2">
        {timeSlots.map((slot, index) => (
          <View 
            key={index} 
            className={`flex-row justify-between items-center p-3 rounded-lg ${
              slot.status === "Available" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <View className="flex-row items-center space-x-2">
              <View
                className={`w-2 h-2 rounded-full ${
                  slot.status === "Available" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {/* Menampilkan startTime - endTime */}
              <Text className="font-medium text-gray-800">
                {slot.startTime} - {slot.endTime}
              </Text>
            </View>
            <View>
              <Text
                className={`font-medium ${
                  slot.status === "Available" ? "text-green-700" : "text-red-700"
                }`}
              >
                {slot.status}
              </Text>
              {slot.bookedBy && (
                <Text className="text-xs text-gray-600">
                  {slot.bookedBy}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
  

  // 5) Fungsi untuk ambil status booking
  const getCurrentStatus = (timeSlots: TimeSlot[]) => {
    const availableSlots = timeSlots.filter(
      (slot) => slot.status === "Available"
    ).length;
    const totalSlots = timeSlots.length;

    if (availableSlots === 0) return "Fully Booked";
    if (availableSlots === totalSlots) return "Fully Available";
    return `${availableSlots}/${totalSlots} slots available`;
  };

  // 6) Komponen StatusBadge (label hijau/merah di pojok)
  const StatusBadge = ({ timeSlots }: { timeSlots: TimeSlot[] }) => {
    const status = getCurrentStatus(timeSlots);
    const isAvailable = status !== "Fully Booked";

    return (
      <View
        className={`absolute top-4 left-4 px-3 py-1 rounded-full z-10 ${
          isAvailable ? "bg-green-500" : "bg-red-500"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text className="text-white font-semibold text-sm">{status}</Text>
      </View>
    );
  };

  // 7) Komponen Card untuk Room
  const RoomCard = ({ room }: { room: Room }) => (
    <View className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden">
      <StatusBadge timeSlots={room.timeSlots} />

      <View className="relative h-48 mb-6 overflow-hidden rounded-xl">
        <Image
          source={room.image}
          className="w-full h-full rounded-lg object-cover"
          resizeMode="cover"
        />
      </View>

      <View className="space-y-4">
        <View className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 space-y-2">
              <View className="space-y-1">
                <Text className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  Meeting Room
                </Text>
                <Text className="text-2xl font-bold text-gray-800">
                  {room.name}
                </Text>
              </View>

              <View className="flex-row items-center space-x-2 mt-1">
                <View className="bg-blue-100 rounded-lg p-1">
                  <Image
                    source={icons.door}
                    className="w-4 h-4"
                    tintColor="#1e40af"
                  />
                </View>
                <Text className="text-sm font-medium text-gray-600">
                  {room.size}
                </Text>
              </View>
            </View>

            <View className="bg-blue-900 h-10 w-10 rounded-full items-center justify-center">
              <Text className="text-white font-bold">
                {String(room.id).padStart(2, "0")}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-slate-50 rounded-xl p-4">
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-row items-center space-x-2 bg-blue-100 px-3 py-1.5 rounded-full mr-2 mb-2">
              <Image source={icons.member} className="w-4 h-4" tintColor="#003580" />
              <Text className="text-sm font-medium text-gray-700">
                {room.capacity} persons
              </Text>
            </View>

            {room.assets.map((asset, index) => (
              <View
                key={index}
                className="flex-row items-center bg-blue-100 px-3 py-1.5 rounded-full mr-2 mb-2"
              >
                <Image
                  source={assetIcons[asset]}
                  className="w-4 h-4 mr-2"
                  tintColor="#003580"
                />
                <Text className="text-blue-900 text-xs font-medium">
                  {asset}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowTimeSlots(showTimeSlots === room.id ? null : room.id)}
          className="bg-blue-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-blue-900 font-semibold text-center">
            {showTimeSlots === room.id ? "Hide Schedule" : "View Schedule"}
          </Text>
        </TouchableOpacity>

        {showTimeSlots === room.id && <TimeSlotsList timeSlots={room.timeSlots} />}
      </View>
    </View>
  );

  // 8) Komponen Card untuk Transport
  const TransportationCard = ({ transport }: { transport: Transport }) => (
    <View className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden">
      <StatusBadge timeSlots={transport.timeSlots} />

      <View className="relative h-48 mb-4 overflow-hidden rounded-xl">
        <Image
          source={transport.image}
          className="w-full h-full rounded-lg object-cover"
          resizeMode="cover"
        />
      </View>

      <View className="space-y-3">
        <Text className="text-xl font-bold text-gray-800">{transport.name}</Text>

        <View className="flex flex-row items-center space-x-6">
          <View className="space-x-2 flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
            <Image source={icons.seat} className="w-5 h-5" tintColor="#003580" />
            <Text className="text-sm text-blue-900 font-medium">
              {transport.capacity}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowTimeSlots(showTimeSlots === transport.id ? null : transport.id)}
          className="bg-blue-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-blue-900 font-semibold text-center">
            {showTimeSlots === transport.id ? "Hide Schedule" : "View Schedule"}
          </Text>
        </TouchableOpacity>

        {showTimeSlots === transport.id && (
          <TimeSlotsList timeSlots={transport.timeSlots} />
        )}
      </View>
    </View>
  );

  // 9) Render utama
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <Header />

      <View className="flex-row justify-around py-3 bg-slate-100">
        <TouchableOpacity
          onPress={() => setActiveTab("Rooms")}
          className={
            activeTab === "Rooms"
              ? "border-b-2 border-blue-900 pb-2"
              : "pb-2"
          }
        >
          <Text
            className={
              activeTab === "Rooms"
                ? "text-blue-900 font-bold"
                : "text-gray-800 font-medium"
            }
          >
            Rooms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("Transportation")}
          className={
            activeTab === "Transportation"
              ? "border-b-2 border-blue-900 pb-2"
              : "pb-2"
          }
        >
          <Text
            className={
              activeTab === "Transportation"
                ? "text-blue-900 font-bold"
                : "text-gray-800 font-medium"
            }
          >
            Transportation
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 mb-[100px]">
        {activeTab === "Rooms" &&
          updatedRooms.map((room) => <RoomCard key={room.id} room={room} />)}

        {activeTab === "Transportation" &&
          transportation.map((transport) => (
            <TransportationCard key={transport.id} transport={transport} />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;
