import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { icons } from "@/constants";

// Dummy notifications data
const notifications = [
  {
    id: "001",
    title: "Meeting: Product Review",
    description: "Small meeting room - Workspace A",
    date: "Today, 10:00 - 11:30",
    type: "ROOM",
    status: "upcoming", // upcoming, ongoing, completed, cancelled
  },
  {
    id: "002",
    title: "Transport Booking",
    description: "Toyota Innova - B 1234 CD",
    date: "Today, 13:00 - 15:00",
    type: "TRANSPORT",
    status: "ongoing",
  },
  {
    id: "003",
    title: "Team Retrospective",
    description: "Large meeting room - Workspace B",
    date: "Tomorrow, 09:00 - 10:00",
    type: "ROOM",
    status: "upcoming",
  },
  {
    id: "004",
    title: "Client Meeting",
    description: "Medium meeting room - Workspace C",
    date: "Yesterday, 14:00 - 15:00",
    type: "ROOM",
    status: "completed",
  },
  {
    id: "005",
    title: "Site Visit Transportation",
    description: "Honda CR-V - B 5678 EF",
    date: "Yesterday, 09:00 - 12:00",
    type: "TRANSPORT",
    status: "cancelled",
  },
];

const NotificationScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "ROOM" | "TRANSPORT">("ALL");

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      selectedFilter === "ALL" || notif.type === selectedFilter;

    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 mt-5">
      {/* Header with blue card background */}
      <View className="bg-white rounded-2xl shadow-md mx-4 mt-4 p-4 relative overflow-hidden">
        {/* Decorative circles */}
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

        {/* Header Content */}
        <View className="flex-row items-center justify-between z-10">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="bg-blue-900 p-2 rounded-lg">
              <Image
                source={icons.arrowDown}
                className="w-6 h-6 origin-top rotate-90"
                tintColor="#fff"
              />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-extrabold text-blue-900">Notifications</Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center space-x-2 z-10">
          <View className="flex-1 bg-white border border-blue-200 rounded-xl flex-row items-center px-3 py-2">
            <Image
              source={icons.search}
              className="w-5 h-5 mr-2"
              tintColor="#64748b"
            />
            <TextInput
              placeholder="Search notifications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm"
            />
          </View>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row mt-3 space-x-2 z-10">
          <TouchableOpacity
            onPress={() => setSelectedFilter("ALL")}
            className={`rounded-full px-4 py-2 ${
              selectedFilter === "ALL"
                ? "bg-blue-900"
                : "bg-white border border-blue-900"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedFilter === "ALL" ? "text-white" : "text-blue-900"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter("ROOM")}
            className={`rounded-full px-4 py-2 flex-row items-center ${
              selectedFilter === "ROOM"
                ? "bg-blue-900"
                : "bg-white border border-blue-900"
            }`}
          >
            <Image
              source={icons.door}
              className="w-4 h-4 mr-1"
              style={{
                tintColor: selectedFilter === "ROOM" ? "#fff" : "#1e3a8a",
              }}
            />
            <Text
              className={`text-xs font-semibold ${
                selectedFilter === "ROOM" ? "text-white" : "text-blue-900"
              }`}
            >
              Rooms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter("TRANSPORT")}
            className={`rounded-full px-4 py-2 flex-row items-center ${
              selectedFilter === "TRANSPORT"
                ? "bg-blue-900"
                : "bg-white border border-blue-900"
            }`}
          >
            <Image
              source={icons.car}
              className="w-4 h-4 mr-1"
              style={{
                tintColor: selectedFilter === "TRANSPORT" ? "#fff" : "#1e3a8a",
              }}
            />
            <Text
              className={`text-xs font-semibold ${
                selectedFilter === "TRANSPORT" ? "text-white" : "text-blue-900"
              }`}
            >
              Transport
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView className="px-4 pt-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => (
            <TouchableOpacity
              key={index}
              className="mb-3 bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-900"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-blue-900">
                    {notification.title}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-1">
                    {notification.description}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-2">
                    {notification.date}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getStatusColor(notification.status)}`}>
                  <Text className="text-[10px] font-bold capitalize">
                    {notification.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-gray-500 text-center">
              No notifications found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;