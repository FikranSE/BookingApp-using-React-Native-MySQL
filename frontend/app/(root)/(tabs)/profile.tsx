import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, icons } from "@/constants";

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="bg-slate-100 flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header Section - Matching Home page blue style */}
        <View className="bg-blue-900 px-4 pt-4 pb-8 rounded-b-[30px]">
          <View className="flex items-center mt-6">
            <View className="bg-white/10 p-1 rounded-full">
              <Image
                source={images.profile1}
                style={{ width: 90, height: 90, borderRadius: 45 }}
                className="border-2 border-white"
              />
            </View>
            <Text className="text-white text-xl font-bold mt-3">
              {user?.firstName} {user?.lastName || "User Example"}
            </Text>
            <Text className="text-blue-200 text-sm mt-1">
              {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
            </Text>
          </View>
        </View>

        {/* Quick Stats - Similar to Home dashboard cards */}
        <View className="flex-row mx-4 mt-4">
          <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-500 font-medium">Total Bookings</Text>
                <Text className="text-xl font-bold mt-1 text-blue-600">12</Text>
              </View>
              <View className="p-2 rounded-lg bg-blue-100">
                <Image source={icons.calendar} className="w-5 h-5" style={{ tintColor: '#2563eb' }} />
              </View>
            </View>
          </View>
          <View className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-500 font-medium">Active Bookings</Text>
                <Text className="text-xl font-bold mt-1 text-green-600">3</Text>
              </View>
              <View className="p-2 rounded-lg bg-green-100">
                <Image source={icons.clock} className="w-5 h-5" style={{ tintColor: '#16a34a' }} />
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Account Settings</Text>
          
          <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-lg mr-3">
                <Image source={icons.password} className="w-5 h-5" style={{ tintColor: '#2563eb' }} />
              </View>
              <Text className="text-gray-800 font-semibold">Change Password</Text>
            </View>
            <Image
              source={icons.arrowUp}
              className="w-5 h-5"
              style={{ transform: [{ rotate: '90deg' }], tintColor: '#64748b' }}
            />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-gray-800 mt-6 mb-3">Support</Text>
          
          <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-purple-100 p-2 rounded-lg mr-3">
                <Image source={icons.faq} className="w-5 h-5" style={{ tintColor: '#7c3aed' }} />
              </View>
              <Text className="text-gray-800 font-semibold">FAQ</Text>
            </View>
            <Image
              source={icons.arrowUp}
              className="w-5 h-5"
              style={{ transform: [{ rotate: '90deg' }], tintColor: '#64748b' }}
            />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl mb-6 shadow-sm flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-2 rounded-lg mr-3">
                <Image source={icons.cs} className="w-5 h-5" style={{ tintColor: '#ea580c' }} />
              </View>
              <Text className="text-gray-800 font-semibold">Customer Service</Text>
            </View>
            <Image
              source={icons.arrowUp}
              className="w-5 h-5"
              style={{ transform: [{ rotate: '90deg' }], tintColor: '#64748b' }}
            />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={handleSignOut} 
            className="bg-blue-900 py-4 rounded-xl shadow-sm"
          >
            <Text className="text-center text-white font-bold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;