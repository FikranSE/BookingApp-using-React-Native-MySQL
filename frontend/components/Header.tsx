import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { INotification, notifications as dummyNotifications } from "@/lib/dummyData";
import { icons } from "@/constants";

const Header = () => {
  const router = useRouter();
  const [notifications] = useState<INotification[]>(dummyNotifications);
  const [scale] = useState(new Animated.Value(1));

  const notificationCount = notifications.length;

  const pulseAnimation = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (notificationCount > 0) {
        setTimeout(pulseAnimation, 3000);
      }
    });
  };

  useEffect(() => {
    if (notificationCount > 0) {
      startRadarAnimation();
    }
  }, [notificationCount]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi..";
    if (hour < 15) return "Selamat Siang..";
    if (hour < 19) return "Selamat Sore..";
    return "Selamat Malam";
  };

  return (
    <View className="bg-slate-100 rounded-b-2xl py-4 px-5 shadow-md mb-2">
      <View className="flex-row justify-between items-center">
        {/* Left Section: Greetings */}
        <View>
          <Text className="text-slate-500 text-sm italic font-medium">{timeOfDay()}</Text>
          <Text className="text-slate-800 text-lg font-bold">John Doe</Text>
        </View>

        {/* Right Section: Profile and Notifications */}
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity onPress={() => router.push("/(root)/profile")}>
            <Image
              source={{ uri: userAvatar }}
              className="w-10 h-10 rounded-full border border-white shadow-md"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(root)/notifikasi")}
            className="bg-white p-3 rounded-full shadow-sm"
          >
            <Animated.Image
              source={icons.bell}
              className="w-5 h-5 opacity-80"
              style={{ transform: [{ scale }] }}
            />
            {notificationCount > 0 && (
              <View className="absolute top-[-4px] right-[-4px] bg-blue-500 rounded-full min-w-[20px] h-[20px] flex justify-center items-center shadow-md">
                <Text className="text-white text-xs font-semibold">{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Header;

