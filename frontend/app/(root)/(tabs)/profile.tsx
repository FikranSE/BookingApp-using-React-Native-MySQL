import { useContext, useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import api from "@/lib/api";
import { AuthContext } from "../../context/AuthContext";
import { router } from "expo-router";

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Gagal mengambil profil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await logout();
    // Navigasi kembali ke layar login sudah di-handle oleh context
  };

  // Fungsi untuk mendapatkan inisial dari email
  const getInitialFromEmail = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  // Fungsi untuk mendapatkan warna background avatar berdasarkan inisial
  const getAvatarBackgroundColor = (initial: string) => {
    const colors = [
      "bg-sky-500", "bg-orange-500", "bg-emerald-500", 
      "bg-violet-500", "bg-rose-500", "bg-amber-500"
    ];
    // Hash inisial ke salah satu warna
    const charCode = initial.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-white flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  const userInitial = getInitialFromEmail(user?.email || "user@example.com");
  const avatarBgColor = getAvatarBackgroundColor(userInitial);

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Header */}
        <View className="pt-8 pb-6 px-6">
          <View className="flex-row items-center">
            {/* Avatar dengan inisial */}
            <View className={`w-16 h-16 rounded-full ${avatarBgColor} items-center justify-center`}>
              <Text className="text-white text-2xl font-bold">{userInitial}</Text>
            </View>
            <View className="ml-4">
              <Text className="text-gray-900 text-xl font-medium">
                {user?.name || "User Example"}
              </Text>
              <Text className="text-gray-500 text-sm">
                {user?.email || "user@example.com"}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Divider */}
        <View className="h-px bg-gray-100 mx-6" />
        
        {/* Stats Cards - Minimal Design */}
        <View className="px-6 pt-6">
          <Text className="text-sm font-medium text-gray-500 mb-3">OVERVIEW</Text>
          <View className="flex-row justify-between">
            <View className="w-[48%] bg-sky-50 rounded-xl p-4">
              <Text className="text-sky-500 text-2xl font-bold">12</Text>
              <Text className="text-gray-600 text-sm mt-1">Total Bookings</Text>
            </View>
            <View className="w-[48%] bg-orange-50 rounded-xl p-4">
              <Text className="text-orange-500 text-2xl font-bold">3</Text>
              <Text className="text-gray-600 text-sm mt-1">Active Bookings</Text>
            </View>
          </View>
        </View>
        
        {/* Account Settings */}
        <View className="px-6 pt-8">
          <Text className="text-sm font-medium text-gray-500 mb-3">ACCOUNT</Text>
          
          <TouchableOpacity
            onPress={() => router.push('/(root)/change-password')}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center mr-3">
                <Image source={icons.password} className="w-4 h-4" style={{ tintColor: '#0ea5e9' }} />
              </View>
              <Text className="text-gray-800">Change Password</Text>
            </View>
            <Image
              source={icons.arrowUp}
              className="w-4 h-4"
              style={{ transform: [{ rotate: '90deg' }], tintColor: '#94a3b8' }}
            />
          </TouchableOpacity>
          
          <View className="h-px bg-gray-100" />
          
          {/* Support Options */}
          <TouchableOpacity
            onPress={() => router.push('/(root)/faq')}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-sky-100 items-center justify-center mr-3">
                <Image source={icons.faq} className="w-4 h-4" style={{ tintColor: '#0ea5e9' }} />
              </View>
              <Text className="text-gray-800">FAQ</Text>
            </View>
            <Image
              source={icons.arrowUp}
              className="w-4 h-4"
              style={{ transform: [{ rotate: '90deg' }], tintColor: '#94a3b8' }}
            />
          </TouchableOpacity>
          
          <View className="h-px bg-gray-100" />
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Image source={icons.cs} className="w-4 h-4" style={{ tintColor: '#f97316' }} />
              </View>
              <Text className="text-gray-800">Customer Service</Text>
            </View>
            <Image
              source={icons.arrowUp}
              className="w-4 h-4"
              style={{ transform: [{ rotate: '90deg' }], tintColor: '#94a3b8' }}
            />
          </TouchableOpacity>
        </View>
        
        {/* Sign Out Button - Minimal Design */}
        <View className="px-6 mt-10">
          <TouchableOpacity 
            onPress={handleSignOut} 
            className="bg-white border border-gray-200 py-4 rounded-xl"
          >
            <Text className="text-center text-sky-500 font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;