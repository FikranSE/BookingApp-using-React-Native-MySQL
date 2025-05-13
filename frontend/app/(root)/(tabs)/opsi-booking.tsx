import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { images } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header Section */}
        <Animated.View 
          entering={FadeInDown.delay(50)}
          className="bg-white pt-2 pb-4"
        >
          <View className="px-4 pt-2">
            <View className="flex-row items-center justify-center mb-2">
              <View className="w-12 h-12 bg-sky-50 rounded-full items-center justify-center border border-sky-100">
                <Ionicons name="calendar" size={24} color="#0ea5e9" />
              </View>
            </View>
            <Text className="text-xl font-bold text-gray-800 text-center">
              Choose Service
            </Text>
            <Text className="text-gray-500 text-center mt-1 text-sm">
              Select the service you want to book
            </Text>
          </View>
        </Animated.View>

        {/* Cards Container */}
        <View className="flex-1 px-4 pt-6">
          <View className="flex-row justify-between px-2 gap-4">
            {/* Room Card */}
            <Animated.View
              entering={FadeInDown.delay(100)}
              className="flex-1"
            >
              <TouchableOpacity
                onPress={() => handleBooking("Room")}
                className="bg-white rounded-xl overflow-hidden"
                style={{
                  shadowColor: "#0ea5e9",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                <View className="relative">
                  <Image 
                    source={images.smroom} 
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 right-3">
                    <View className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md">
                      <Text className="text-xs font-medium text-sky-500">
                        Room
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View className="p-4">
                  <View className="mb-3">
                    <Text className="text-gray-800 text-lg font-medium mb-1">
                      Meeting Rooms
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Book meeting rooms and workspaces for your team
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-sky-50 rounded-full items-center justify-center mr-2">
                        <Ionicons name="people" size={16} color="#0ea5e9" />
                      </View>
                      <Text className="text-gray-700 text-sm">
                        For teams
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Transport Card */}
            <Animated.View
              entering={FadeInDown.delay(150)}
              className="flex-1"
            >
              <TouchableOpacity
                onPress={() => handleBooking("Transportation")}
                className="bg-white rounded-xl overflow-hidden"
                style={{
                  shadowColor: "#0ea5e9",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 2
                }}
              >
                <View className="relative">
                  <Image 
                    source={images.car1} 
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 right-3">
                    <View className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md">
                      <Text className="text-xs font-medium text-sky-500">
                        Transport
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View className="p-4">
                  <View className="mb-3">
                    <Text className="text-gray-800 text-lg font-medium mb-1">
                      Transportation
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Book vehicles and transportation services
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-sky-50 rounded-full items-center justify-center mr-2">
                        <Ionicons name="time" size={16} color="#0ea5e9" />
                      </View>
                      <Text className="text-gray-700 text-sm">
                        24/7 Available
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default OpsiBooking;
