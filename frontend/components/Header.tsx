import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { icons } from "@/constants";

const Header = () => {
  const [notificationCount, setNotificationCount] = useState(3);
  const [scale] = useState(new Animated.Value(1));

  // Animation for bell icon when there are notifications
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

  React.useEffect(() => {
    if (notificationCount > 0) {
      pulseAnimation();
    }
  }, [notificationCount]);

  const userAvatar = "https://via.placeholder.com/150/003580/ffffff?text=User";

  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <View className="px-5 py-4 bg-slate-100 mb-5">
      <View className="flex-row justify-between items-center">
        {/* Left Section: User Info */}
        <View className="flex-row items-center space-x-4">
          <View className="relative">
            <Image
              source={{ uri: userAvatar }}
              className="w-12 h-12 rounded-full border-2 border-blue-900"
              resizeMode="cover"
            />
          </View>
          
          <View>
            <Text className="text-[13px] tracking-wide italic font-medium font-Jakarta text-blue-900/70">
              {timeOfDay()}
            </Text>
            <Text className="text-2xl tracking-tight font-black text-blue-900 ">
              John Doe
            </Text>
          </View>
        </View>

        {/* Right Section: Notifications */}
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="relative">
            <Animated.View 
              className="w-11 h-11 items-center justify-center rounded-full bg-white shadow-sm"
              style={{ transform: [{ scale }] }}
            >
              <Image
                source={icons.bell}
                className="w-6 h-6"
                tintColor="#1e3a8a"  // blue-900
              />
            </Animated.View>
            {notificationCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center border border-slate-100">
                <Text className="text-xs font-bold text-white">
                  {notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Header;