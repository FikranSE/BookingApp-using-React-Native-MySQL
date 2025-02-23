import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from "@/lib/api";
import { images } from "@/constants";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

const { width } = Dimensions.get('window');

interface IRoom {
  room_id: number;
  room_name: string;
  room_type: string;
  capacity: string;
  facilities: string;
  image?: string;
}

interface ITransport {
  transport_id: number;
  vehicle_name: string;
  driver_name: string;
  capacity: number;
  image?: string;
}

interface IBooking {
  booking_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  section: string;
  description: string;
  type: 'room' | 'transport';
  itemName: string;
}

const BASE_URL = 'https://j9d3hc82-3001.asse.devtunnels.ms/api';

const Home = () => {
  const [activeTab, setActiveTab] = useState<"Rooms" | "Transport">("Rooms");
  const [notifications, setNotifications] = useState(3);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [user, setUser] = useState<any>(null);
  const [transports, setTransports] = useState<ITransport[]>([]);
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  const handleError = (error: any) => {
    if (error.response?.status === 401) {
      Alert.alert('Session Expired', 'Please log in again to continue.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }
      ]);
    } else {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const authToken = await fetchAuthToken();
      if (!authToken) {
        Alert.alert('Error', 'Not authenticated');
        router.push('/(auth)/sign-in');
        return;
      }

      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Fetch room data
      try {
        const roomsRes = await axios.get(`${BASE_URL}/rooms`, { headers });
        setRooms(roomsRes.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        handleError(error);
      }

      // Fetch transport data
      try {
        const transportsRes = await axios.get(`${BASE_URL}/transports`, { headers });
        setTransports(transportsRes.data);
      } catch (error) {
        console.error('Error fetching transports:', error);
        handleError(error);
      }

      // Fetch recent bookings
      try {
        const [roomBookingsRes, transportBookingsRes] = await Promise.all([
          axios.get(`${BASE_URL}/room-bookings`, { headers }),
          axios.get(`${BASE_URL}/transport-bookings`, { headers })
        ]);
        
        const allBookings = [
          ...(roomBookingsRes.data || []).map((booking: any) => ({
            ...booking,
            type: 'room' as const,
            itemName: rooms.find((room) => room.room_id === booking.room_id)?.room_name
          })),
          ...(transportBookingsRes.data || []).map((booking: any) => ({
            ...booking,
            type: 'transport' as const,
            itemName: transports.find((transport) => transport.transport_id === booking.transport_id)?.vehicle_name
          }))
        ].sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

        setRecentBookings(allBookings.slice(0, 5));
      } catch (error) {
        console.error('Error fetching bookings:', error);
        handleError(error);
        setRecentBookings([]);
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Booking Card
  const BookingCard = ({ booking }) => {
    const getTypeStyles = (type) => {
      if (type === 'room') {
        return {
          iconName: 'business',
          iconColor: '#0F2563',
          bgColor: 'bg-indigo-50'
        };
      }
      return {
        iconName: 'car',
        iconColor: '#0F766E',
        bgColor: 'bg-teal-50'
      };
    };
  
    const getStatusStyle = (status) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return 'bg-green-100 text-emerald-700';
        case 'pending':
          return 'bg-amber-100 text-amber-700';
        case 'rejected':
          return 'bg-red-100 text-rose-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    };
  
    const typeStyle = getTypeStyles(booking.type);
  
    return (
      <TouchableOpacity className=" bg-blue-100 flex-row items-center py-3 px-4 mx-4 mb-3 rounded-lg border-gray-100">
        {/* Icon and Name */}
        <View className={`${typeStyle.bgColor} w-10 h-10 rounded-full items-center justify-center mr-3`}>
          <Ionicons name={typeStyle.iconName} size={20} color={typeStyle.iconColor} />
        </View>
        
        {/* Main Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{booking.itemName}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {new Date(booking.booking_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <Text className="text-sm text-gray-600 mx-1">•</Text>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {booking.start_time}
            </Text>
          </View>
        </View>
  
        {/* Status */}
        <View className={`rounded-full px-2.5 py-1 ${getStatusStyle(booking.status)}`}>
          <Text className="text-xs font-medium">
            {booking.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Room Card
  const RoomCard = ({ room }: { room: IRoom }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
      className="bg-white rounded-3xl mb-4 mx-2 overflow-hidden shadow-lg"
      style={{ width: width * 0.7 }}
    >
      <Image 
        source={images.profile1} 
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
      <View className="absolute top-4 left-4">
        <Text className="text-white text-lg font-bold">{room.room_name}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="people" size={14} color="white" />
          <Text className="text-white ml-1">{room.capacity} people</Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="business" size={16} color="#1E3A8A" />
            <Text className="text-blue-900 ml-2 font-medium">{room.room_type}</Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-900 px-4 py-2 rounded-full"
            onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
          >
            <Text className="text-white font-medium">Book Now</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 text-sm" numberOfLines={2}>{room.facilities}</Text>
      </View>
    </TouchableOpacity>
  );

  // Transport Card
  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
      className="bg-white rounded-3xl mb-4 mx-2 overflow-hidden shadow-lg"
      style={{ width: width * 0.7 }}
    >
      <Image 
        source={images.profile1} 
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
      <View className="absolute top-4 left-4">
        <Text className="text-white text-lg font-bold">{transport.vehicle_name}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="car" size={14} color="white" />
          <Text className="text-white ml-1">{transport.capacity} seats</Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="person" size={16} color="#1E3A8A" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-500">Driver</Text>
              <Text className="text-blue-900 font-medium">{transport.driver_name}</Text>
            </View>
          </View>
          <TouchableOpacity 
            className="bg-blue-900 px-4 py-2 rounded-full"
            onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
          >
            <Text className="text-white font-medium">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-900 px-4 pt-6 pb-12 rounded-b-[40px]">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-white/80">Welcome back,</Text>
            <Text className="text-white text-xl font-bold">{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(root)/notifikasi')}
            className="relative"
          >
            <View className="bg-white/20 p-2 rounded-full">
              <Ionicons name="notifications" size={24} color="white" />
            </View>
            {notifications > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="relative">
          <View className="absolute left-4 top-3">
            <Ionicons name="search" size={20} color="#64748B" />
          </View>
          <TextInput
            placeholder="Search rooms or vehicles..."
            className="bg-white rounded-2xl pl-12 pr-4 py-3"
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      <ScrollView className="flex-1 mt-6">
        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <View className="mb-8">
            <View className="px-4 flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-700">Recent Bookings</Text>
              <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/my-booking')}>
                <Text className="text-blue-900 font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
            >
              {/* Limit the number of bookings displayed (e.g., show the first 3 bookings) */}
              {recentBookings.slice(0, 3).map((booking) => (
                <BookingCard key={`${booking.type}-${booking.booking_id}`} booking={booking} />
              ))}
            </ScrollView>
          </View>
        )}


        {/* Tabs */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between bg-transparent p-1">
            {['Rooms', 'Transport'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as "Rooms" | "Transport")}
                className={`flex-1 py-3 rounded-lg ${activeTab === tab ? 'border-b-2 border-blue-900' : ''}`}
              >
                <Text
                  className={`text-center font-medium ${activeTab === tab ? 'text-blue-900' : 'text-gray-500'}`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Listings */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        >
          {activeTab === "Rooms"
            ? rooms.map((room) => <RoomCard key={room.room_id} room={room} />)
            : transports.map((transport) => <TransportCard key={transport.transport_id} transport={transport} />)
          }
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
