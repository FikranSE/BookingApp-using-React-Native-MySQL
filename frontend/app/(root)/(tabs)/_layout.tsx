import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";

import { icons } from "@/constants";

const TabIcon = ({
  source,
  focused,
  label,
}: {
  source: ImageSourcePropType;
  focused: boolean;
  label: string;
}) => (
  <View className="flex items-center">
    <View
      className={`rounded-full w-12 h-12 items-center justify-start`}
    >
      <Image
        source={source}
        tintColor={focused ? "#0EA5E9" : "#9ca3af"} // Changed focus color to dark blue
        resizeMode="contain"
        style={{
          width: 20, // Icon width
          height: 20, // Icon height
        }}
      />
    </View>
    <Text
      className={`text-xs mt-[-25px] ${
        focused ? "text-[#0EA5E9]" : "text-[#9ca3af]"
      }`}
    >
      {label}
    </Text>
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#0EA5E9", // Updated to dark blue
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          position: "absolute",
          height: 70, // Added height for menu name
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.compass} focused={focused} label="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="opsi-booking"
        options={{
          title: "Add Booking",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 35,
                backgroundColor: "#0EA5E9", // Changed to dark blue
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40, 
                borderWidth: 8, 
                borderColor: "white", 
                // Add shadow for more depth
                shadowColor: "#0EA5E9",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
              }}
            >
              <Image
                source={icons.plus}
                style={{
                  width: 18, 
                  height: 18, 
                  tintColor: "white",
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-booking"
        options={{
          title: "my booking",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.calendar} focused={focused} label="My Booking" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.person} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}