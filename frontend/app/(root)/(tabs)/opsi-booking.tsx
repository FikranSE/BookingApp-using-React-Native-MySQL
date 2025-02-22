import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";

const AddBooking = () => {
  const router = useRouter();

  const handleBooking = (type: "Room" | "Transportation") => {
    if (type === "Room") {
      router.push('/(root)/booking-room');
    } else if (type === "Transportation") {
      router.push('/(root)/booking-transport');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-5 pt-4">
        <Text className="text-2xl font-semibold text-blue-900 mb-6">
          Select Booking Type
        </Text>
        
        <TouchableOpacity
          onPress={() => handleBooking("Room")}
          className="bg-blue-900 rounded-full py-3 px-8 mb-4"
        >
          <Text className="text-white text-lg font-semibold">Book a Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleBooking("Transportation")}
          className="bg-blue-900 rounded-full py-3 px-8"
        >
          <Text className="text-white text-lg font-semibold">Book Transportation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddBooking;
