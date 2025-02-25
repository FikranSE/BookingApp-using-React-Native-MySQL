import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

const OpsiBooking = () => {
  const router = useRouter();

  const handleBooking = (type: "Room" | "Transportation") => {
    if (type === "Room") {
      router.push('/(root)/booking-room');
    } else if (type === "Transportation") {
      router.push('/(root)/booking-transport');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Enhanced Header */}
      <View className="bg-white shadow-sm">
        <View className="px-4 pt-8 pb-6">
          <View className="flex-row items-center justify-center mb-2">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="calendar" size={24} color="#1E3A8A" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-blue-900 text-center">
            Choose Service
          </Text>
          <Text className="text-gray-500 text-center mt-1">
            Select the service you want to book
          </Text>
        </View>
      </View>

      {/* Cards Container */}
      <View className="flex-1 px-4 pt-6">
        <View className="flex-row justify-between px-2 gap-4">
          {/* Enhanced Room Card */}
          <TouchableOpacity
            onPress={() => handleBooking("Room")}
            className="bg-white flex-1 rounded-3xl shadow-lg overflow-hidden border border-gray-100"
            style={{
              elevation: 3
            }}
          >
            <View className="relative">
              <Image 
                source={images.smroom} 
                className="w-full h-40"
                resizeMode="cover"
              />
              <View className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
              <View className="absolute top-4 right-4">
                <View className="bg-white/30 backdrop-blur-lg rounded-full p-2">
                  <Ionicons name="business" size={24} color="white" />
                </View>
              </View>
            </View>
            
            <View className="p-4">
              <View className="mb-2">
                <Text className="text-xl font-bold text-blue-900 mb-1">
                  Room
                </Text>
                <Text className="text-sm text-gray-500 leading-tight">
                  Book meeting rooms and workspaces for your team
                </Text>
              </View>
              <View className="flex-row items-center mt-3">
                <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                  <Ionicons name="people" size={14} color="#1E3A8A" />
                  <Text className="text-blue-900 text-xs ml-1 font-medium">
                    For teams
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Enhanced Transport Card */}
          <TouchableOpacity
            onPress={() => handleBooking("Transportation")}
            className="bg-white flex-1 rounded-3xl shadow-lg overflow-hidden border border-gray-100"
            style={{
              elevation: 3
            }}
          >
            <View className="relative">
              <Image 
                source={images.car1} 
                className="w-full h-40"
                resizeMode="cover"
              />
              <View className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
              <View className="absolute top-4 right-4">
                <View className="bg-white/30 backdrop-blur-lg rounded-full p-2">
                  <Ionicons name="car" size={24} color="white" />
                </View>
              </View>
            </View>
            
            <View className="p-4">
              <View className="mb-2">
                <Text className="text-xl font-bold text-blue-900 mb-1">
                  Transport
                </Text>
                <Text className="text-sm text-gray-500 leading-tight">
                  Book vehicles and transportation services
                </Text>
              </View>
              <View className="flex-row items-center mt-3">
                <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                  <Ionicons name="time" size={14} color="#1E3A8A" />
                  <Text className="text-blue-900 text-xs ml-1 font-medium">
                    24/7 Available
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OpsiBooking;