import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

const Header = () => {
  return (
    <View className="px-5 py-4 flex-row justify-between items-center bg-slate-100 shadow-sm">
      <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-white">
        <Image
          source={icons.menu}
          className="w-5 h-5"
          tintColor="#003580"
        />
      </TouchableOpacity>
      <Text className="text-xl font-bold">
        <Text className="text-blue-900">M</Text>
        <Text className="text-gray-800">Book</Text>
      </Text>
      <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-white">
        <Image
          source={icons.bell}
          className="w-5 h-5"
          tintColor="#003580"
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
