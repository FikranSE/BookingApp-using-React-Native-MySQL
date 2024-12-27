import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { icons, images } from "@/constants";

const Header = () => {
  const [notificationCount, setNotificationCount] = useState(3);

  // Refs for radar animation
  const radarScale = useRef(new Animated.Value(0)).current;
  const radarOpacity = useRef(new Animated.Value(1)).current;

  // Function to start radar animation
  const startRadarAnimation = () => {
    radarScale.setValue(0);
    radarOpacity.setValue(1);

    Animated.loop(
      Animated.parallel([
        Animated.timing(radarScale, {
          toValue: 1.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(radarOpacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (notificationCount > 0) {
      startRadarAnimation();
    }
  }, [notificationCount]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 15) return "Good Afternoon";
    if (hour < 19) return "Good Evening";
    return "Good Night";
  };

  return (
    <View className="px-6 py-5 bg-slate-100 rounded-b-2xl shadow mb-5">
      <View className="flex-row justify-between items-center">
        {/* Left Section: User Info */}
        <View className="flex-row items-center space-x-4">
          <View className="relative">
            <Image
              source={images.profile1}
              className="w-14 h-14 rounded-full border-2 border-white shadow"
              resizeMode="cover"
            />
          </View>

          <View>
            <Text className="text-sm italic font-medium text-blue-900/80">
              {getGreeting()}
            </Text>
            <Text className="text-2xl font-bold text-blue-900">
              Fikran Manis
            </Text>
          </View>
        </View>

        {/* Right Section: Notifications */}
        <TouchableOpacity
          className="relative"
          accessible={true}
          accessibilityLabel="Notifications"
        >
          {/* Radar Animation */}
          {notificationCount > 0 && (
            <Animated.View
              className="absolute"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: '#1e3a8a', // blue-900
                backgroundColor: 'rgba(30, 58, 138, 0.2)', // semi-transparent blue
                transform: [{ scale: radarScale }],
                opacity: radarOpacity,
              }}
            />
          )}

          {/* Bell Icon */}
          <Animated.View
            className="w-12 h-12 items-center justify-center rounded-full bg-white border border-blue-900 shadow"
            style={{ transform: [{ scale: 1 }] }} // Skala tetap untuk ikon lonceng
          >
            <Image
              source={icons.bell}
              className="w-6 h-6"
              tintColor="#1e3a8a" // blue-900
            />
          </Animated.View>

          {/* Notification Badge */}
          {notificationCount > 0 && (
            <View className="absolute -top-2 -right-2 flex-row items-center justify-center w-6 h-6 rounded-full bg-red-500 border-2 border-slate-100">
              <Text className="text-xs font-bold text-white text-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
