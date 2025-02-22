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
      className={`rounded-full w-12 h-12 items-center justify-start ${
        focused ? "bg-white" : ""
      }`}
    >
      <Image
        source={source}
        tintColor={focused ? "#003580" : "#9ca3af"} // Ubah warna saat fokus
        resizeMode="contain"
        style={{
          width: 20, // Ukuran lebar ikon
          height: 20, // Ukuran tinggi ikon
          
        }}
      />
    </View>
    <Text
      className={`text-xs mt-[-25px] ${
        focused ? "text-[#003580]" : "text-[#9ca3af]"
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
        tabBarActiveTintColor: "#003580",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          position: "absolute",
          height: 70, // Tambahkan tinggi untuk nama menu
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
                backgroundColor: "#003580",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40, 
                borderWidth: 8, 
                borderColor: "white", 
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
