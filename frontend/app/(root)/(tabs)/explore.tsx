// Explore.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { LinearGradient } from "expo-linear-gradient"; // Dihilangkan karena tidak lagi digunakan
import { icons } from "@/constants";
import Header from "@/components/Header";

import {
  rooms as dummyRooms,
  transportList,
  assetIcons,
  ITimeSlot,
  IRoom,
  ITransport,
} from "@/lib/dummyData";

// ============================================================
// Helper functions
// ============================================================
const getCapacityInterval = (capacity: number) => {
  if (capacity <= 5) return "3-5";
  if (capacity <= 10) return "5-10";
  return "10-15";
};

const getCurrentStatus = (timeSlots: ITimeSlot[]) => {
  const availableSlots = timeSlots.filter(
    (slot) => slot.status === "Available"
  ).length;
  const totalSlots = timeSlots.length;

  if (availableSlots === 0) return "Fully Booked";
  if (availableSlots === totalSlots) return "Fully Available";
  return `${availableSlots}/${totalSlots} slots available`;
};

// ============================================================
// Komponen TimeSlotsList
// ============================================================
const TimeSlotsList = ({ timeSlots }: { timeSlots: ITimeSlot[] }) => (
  <View className="mt-4 bg-slate-50 rounded-xl p-4">
    <Text className="text-lg font-semibold mb-3 text-gray-800">
      Today's Schedule
    </Text>
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
            {slot.bookedByUserId && (
              <Text className="text-xs text-gray-600">
                {slot.bookedByUserId}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  </View>
);

// ============================================================
// Komponen StatusBadge
// ============================================================
const StatusBadge = ({ timeSlots }: { timeSlots: ITimeSlot[] }) => {
  const status = getCurrentStatus(timeSlots);
  const isAvailable = status !== "Fully Booked";

  return (
    <View
      className={`absolute top-4 left-4 px-3 py-1 rounded-full z-10 ${
        isAvailable ? "bg-green-500" : "bg-red-500"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text className="text-white font-semibold text-sm">{status}</Text>
    </View>
  );
};

// ============================================================
// Komponen Card untuk Room
// ============================================================
const RoomCard = ({ room }: { room: IRoom }) => {
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  return (
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
                  {room.roomName}
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
                  {room.sizeName} meeting room
                </Text>
              </View>
            </View>

            <View className="bg-blue-900 h-10 w-10 rounded-full items-center justify-center">
              <Text className="text-white font-bold">{room.roomId}</Text>
            </View>
          </View>
        </View>

        {/* Asset / Capacity Info */}
        <View className="bg-slate-50 rounded-xl p-4">
          <View className="flex-row flex-wrap gap-4">
            {/* Kapasitas → convert ke interval */}
            <View className="flex-row items-center space-x-2 bg-blue-100 px-3 py-1.5 rounded-full">
              <Image
                source={icons.member}
                className="w-4 h-4"
                tintColor="#003580"
              />
              <Text className="text-xs font-medium text-blue-900">
                {getCapacityInterval(room.capacity)} Persons
              </Text>
            </View>

            {room.assetList.map((asset, index) => (
              <View
                key={index}
                className="flex-row items-center bg-blue-100 px-3 py-1.5 rounded-full"
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

        {/* Button Show/Hide Time Slots */}
        <TouchableOpacity
          onPress={() => setShowTimeSlots(!showTimeSlots)}
          className="bg-blue-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-blue-900 font-semibold text-center">
            {showTimeSlots ? "Hide Schedule" : "View Schedule"}
          </Text>
        </TouchableOpacity>

        {showTimeSlots && <TimeSlotsList timeSlots={room.timeSlots} />}
      </View>
    </View>
  );
};

// ============================================================
// Komponen Card untuk Transport (disederhanakan sesuai standar profesional)
// ============================================================
const TransportationCard = ({ transport }: { transport: ITransport }) => {
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  return (
    <View className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden">
      {/* Badge Status */}
      <StatusBadge timeSlots={transport.timeSlots} />

      {/* Gambar Kendaraan */}
      <View className="relative h-48 mb-4 overflow-hidden rounded-xl">
        <Image
          source={transport.image}
          className="w-full h-full rounded-lg object-cover"
          resizeMode="cover"
        />
      </View>

      {/* Nama Mobil & Driver */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-slate-900">
          {transport.transportName}
        </Text>
        {transport.driverName && (
          <Text className="text-base text-slate-600">
            Driven by: {transport.driverName}
          </Text>
        )}
      </View>

      <View className="space-y-4">
        {/* Kapasitas (Seats) */}
        <View className="flex-row items-center space-x-2 bg-blue-100 px-3 py-1.5 rounded-full self-start">
          <Image source={icons.seat} className="w-5 h-5" tintColor="#003580" />
          <Text className="text-sm text-blue-900 font-medium">
            {transport.capacity} Seats
          </Text>
        </View>

        {/* Tombol Tampilkan/Sembunyikan Jadwal */}
        <TouchableOpacity
          onPress={() => setShowTimeSlots(!showTimeSlots)}
          className="bg-blue-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-blue-900 font-semibold text-center">
            {showTimeSlots ? "Hide Schedule" : "View Schedule"}
          </Text>
        </TouchableOpacity>

        {/* Daftar Jadwal */}
        {showTimeSlots && <TimeSlotsList timeSlots={transport.timeSlots} />}
      </View>
    </View>
  );
};

// ============================================================
// Komponen Utama Explore
// ============================================================
const Explore = () => {
  const [activeTab, setActiveTab] = useState<"Rooms" | "Transportation">("Rooms");

  return (
    <SafeAreaView className="flex-1 bg-slate-100 mt-5">
      {/* TAB SWITCHER */}
      <View className="flex-row justify-around py-3 bg-slate-100">
        <TouchableOpacity
          onPress={() => setActiveTab("Rooms")}
          className={
            activeTab === "Rooms" ? "border-b-2 border-blue-900 pb-2" : "pb-2"
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

      {/* CONTENT LIST */}
      <ScrollView className="flex-1 px-5 mb-[100px]">
        {activeTab === "Rooms" &&
          dummyRooms.map((room) => (
            <RoomCard key={room.roomId} room={room} />
          ))}

        {activeTab === "Transportation" &&
          transportList.map((transport) => (
            <TransportationCard
              key={transport.transportId}
              transport={transport}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;
