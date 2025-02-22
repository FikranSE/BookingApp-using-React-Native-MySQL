import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // Correct import

const { width } = Dimensions.get("window");

const rooms = [
  {
    id: 1,
    name: "Executive Room A101",
    type: "Large Conference Room",
    location: "East Wing",
    rating: 4.9,
    bookings: 156,
    price: 50,
    image: "https://placeholder.com/400x250",
  },
  {
    id: 2,
    name: "Meeting Room B205",
    type: "Medium Meeting Room",
    location: "West Wing",
    rating: 5.0,
    bookings: 203,
    price: 35,
    image: "https://placeholder.com/400x250",
  },
];

const transports = [
  {
    id: 1,
    name: "Toyota Alphard",
    type: "Premium Van",
    location: "Main Terminal",
    rating: 4.8,
    trips: 91,
    price: 75,
    image: "https://placeholder.com/400x250",
  },
  {
    id: 2,
    name: "Mercedes E-Class",
    type: "Executive Sedan",
    location: "VIP Terminal",
    rating: 5.0,
    trips: 124,
    price: 65,
    image: "https://placeholder.com/400x250",
  },
];

const Home = () => {
  const [activeTab, setActiveTab] = useState("Rooms");
  const [notifications, setNotifications] = useState(3); // Mocked notification count
  const router = useRouter();

  const renderListingCard = (item: any) => {
    const isRoom = "bookings" in item;

    return (
      <View
        key={item.id}
        className="bg-white rounded-xl overflow-hidden shadow mb-4"
      >
        <Image
          source={{ uri: item.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="font-semibold text-blue-900 text-lg">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500">{item.type}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-yellow-500">★</Text>
              <Text className="ml-1 text-sm font-medium">{item.rating}</Text>
            </View>
          </View>

          <View className="flex-row items-center text-sm text-gray-500 mb-4">
            <Text className="text-gray-500">
              {isRoom ? `${item.bookings} Bookings` : `${item.trips} Trips`}
            </Text>
            <Text className="mx-2">•</Text>
            <Text className="text-gray-500">{item.location}</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-blue-900">
                ${item.price}
              </Text>
              <Text className="text-gray-500 ml-1">
                /{isRoom ? "hour" : "day"}
              </Text>
            </View>
            <TouchableOpacity className="bg-blue-900 px-6 py-2 rounded-lg">
              <Text className="text-white font-medium">Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 mt-6">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="mb-6 mt-4">
        <View className="mb-2 flex-row items-center justify-between">
            <TextInput
              placeholder="Search rooms, venues or vehicles..."
              className="flex-1 px-4 py-2 rounded-xl bg-white shadow border border-gray-100"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => router.push('/(root)/notifikasi')} className="ml-2">
              <View className="relative">
                <Ionicons name="notifications" size={24} color="#1E3A8A" />
                {notifications > 0 && (
                  <View className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 justify-center items-center">
                    <Text className="text-white text-xs font-semibold">{notifications}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <Text className="text-xl font-semibold text-gray-800">Hi, Joseph</Text>
          <Text className="text-3xl font-bold text-blue-900">
            Find Your Ideal Space
          </Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row gap-2">
            {["Rooms", "Transport", "Equipment", "Venues"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab
                    ? "bg-blue-900"
                    : "bg-white border border-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Listings */}
        <View className="mb-20">
          {activeTab === "Rooms"
            ? rooms.map(renderListingCard)
            : transports.map(renderListingCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
