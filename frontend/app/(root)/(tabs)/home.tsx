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
  type: 'ROOM' | 'TRANSPORT';
  itemName: string;
  user_id: number;
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Extract initials from email
  const getInitials = (email: string) => {
    const name = email.split('@')[0]; // Get the part before '@' of the email
    const initials = name.split('.').map((part: string) => part.charAt(0).toUpperCase()).join('');
    return initials;
  };

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

      // Get current user ID from profile
      let currentUserId = null;
      if (user && user.id) {
        currentUserId = user.id;
      } else {
        try {
          const profileRes = await api.get('/auth/profile');
          setUser(profileRes.data.user);
          currentUserId = profileRes.data.user.id;
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }

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
        
        // Filter bookings to only include those for the current user
        const filteredRoomBookings = roomBookingsRes.data.filter(booking => 
          booking.user_id === currentUserId
        );
        
        const filteredTransportBookings = transportBookingsRes.data.filter(booking => 
          booking.user_id === currentUserId
        );
        
        const allBookings = [
          ...filteredRoomBookings.map((booking: any) => ({
            ...booking,
            type: 'ROOM' as const,
            itemName: rooms.find((room) => room.room_id === booking.room_id)?.room_name
          })),
          ...filteredTransportBookings.map((booking: any) => ({
            ...booking,
            type: 'TRANSPORT' as const,
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
  }, [user]);

  // Booking Card with Light sky and Orange Theme
  const BookingCard = ({ booking }:{ booking: IBooking }) => {
    const getTypeStyles = (type) => {
      if (type === 'ROOM') {
        return {
          iconName: 'business',
          iconColor: '#0EA5E9', // Light sky
          bgColor: 'bg-sky-50'
        };
      }
      return {
        iconName: 'car',
        iconColor: '#0EA5E9', // Light sky
        bgColor: 'bg-sky-50'
      };
    };

    const handlePress = () => {
      if (booking.type.toUpperCase() === "ROOM") {
        router.push(`/detail-bookingRoom?id=${booking.booking_id}`);
      } else if (booking.type.toUpperCase() === "TRANSPORT") {
        router.push(`/detail-bookingTransport?id=${booking.booking_id}`);
      }      
    };
  
    const getStatusStyle = (status) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return 'bg-green-100 text-green-600';
        case 'pending':
          return 'bg-orange-100 text-orange-600';
        case 'rejected':
          return 'bg-red-100 text-red-600';
        default:
          return 'bg-gray-100 text-gray-600';
      }
    };
  
    const typeStyle = getTypeStyles(booking.type);
  
    return (
      <TouchableOpacity 
        onPress={handlePress} 
        className="bg-white flex-row items-center py-3 px-4 mx-4 mb-3 rounded-xl border border-sky-50 shadow-sm"
      >
        {/* Icon and Name */}
        <View className={`${typeStyle.bgColor} w-10 h-10 rounded-full items-center justify-center mr-3`}>
          <Ionicons name={typeStyle.iconName} size={18} color={typeStyle.iconColor} />
        </View>
        
        {/* Main Info */}
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-800">{booking.pic}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={14} color="#0EA5E9" />
            <Text className="text-sm text-gray-600 ml-1">
              {new Date(booking.booking_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <Text className="text-sm text-gray-600 mx-1">•</Text>
            <Ionicons name="time-outline" size={14} color="#0EA5E9" />
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

  // Room Card with Light sky and Orange Theme
  const RoomCard = ({ room }: { room: IRoom }) => {
    // Split facilities string into array
    const facilitiesList = room.facilities.split(',').map(item => item.trim());

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
        className="bg-white rounded-xl mb-4 mx-2 overflow-hidden border border-sky-50 shadow-md"
        style={{ width: width * 0.75 }}
      >
        <Image 
          source={images.profile1} 
          className="w-full h-36"
          resizeMode="cover"
        />
        {/* Light sky overlay filter */}
        <View className="absolute top-0 left-0 right-0 h-36 bg-sky-100/20" />
        
        <View className="absolute top-2 right-2">
          <View className="bg-white self-start px-3 py-1 rounded-full shadow-sm">
            <Text className="text-sky-400 font-medium text-xs">
              {room.capacity} people
            </Text>
          </View>
        </View>

        <View className="p-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-lg text-gray-800 font-medium">{room.room_name}</Text>
            </View>
            <TouchableOpacity 
              className="bg-orange-500 px-3 py-1.5 rounded-md"
              onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
            >
              <Text className="text-white font-medium text-xs">Book Now</Text>
            </TouchableOpacity>
          </View> 
           
          <Text className="text-gray-600 text-sm mb-2">{room.room_type}</Text>

          {/* Facilities */}
          <View className="flex-row flex-wrap gap-1">
            {facilitiesList.slice(0, 3).map((facility, index) => (
              <View 
                key={index} 
                className="bg-sky-50 px-2 py-0.5 rounded-md"
              >
                <Text className="text-sky-400 text-xs">
                  {facility}
                </Text>
              </View>
            ))}
            {facilitiesList.length > 3 && (
              <View className="bg-sky-50 px-2 py-0.5 rounded-md">
                <Text className="text-sky-400 text-xs">+{facilitiesList.length - 3} more</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Transport Card with Light sky and Orange Theme
  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
      className="bg-white rounded-xl mb-4 mx-2 overflow-hidden border border-sky-50 shadow-md"
      style={{ width: width * 0.75 }}
    >
      <Image 
        source={images.profile1} 
        className="w-full h-36"
        resizeMode="cover"
      />
      {/* Light sky overlay filter */}
      <View className="absolute top-0 left-0 right-0 h-36 bg-sky-100/20" />
      
      <View className="absolute top-2 right-2">
        <View className="bg-white self-start px-3 py-1 rounded-full shadow-sm">
          <Text className="text-sky-400 font-medium text-xs">
            {transport.capacity} seats
          </Text>
        </View>
      </View>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg text-gray-800 font-medium">{transport.vehicle_name}</Text>
            <Text className="text-gray-600 text-sm">Driver: {transport.driver_name}</Text>
          </View>
          <TouchableOpacity 
            className="bg-orange-500 px-3 py-1.5 rounded-md"
            onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
          >
            <Text className="text-white font-medium text-xs">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sky-50/30 pb-10">
      {/* Simplified Header */}
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-sky-400 justify-center items-center mr-2 border border-sky-100">
              <Text className="text-white font-medium">{user?.email ? getInitials(user.email) : 'U'}</Text>
            </View>
            <View className="">
            <Text className="text-gray-800 text-xs">{getGreeting()}..</Text>
            <Text className="text-sky-500 text-sm font-medium">{user?.name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(root)/notifikasi')}
            className="relative"
          >
            <View className="p-2">
              <Ionicons name="notifications-outline" size={22} color="#0EA5E9" />
            </View>
            {notifications > 0 && (
              <View className="absolute -top-1 -right-1 bg-orange-500 w-5 h-5 rounded-full items-center justify-center border border-white">
                <Text className="text-white text-xs font-bold">{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search with light sky style */}
        <View className="flex-row bg-white border border-sky-100 rounded-xl mb-4 px-2 py-1.5 items-center shadow-sm">
          <Ionicons name="search-outline" size={18} color="#0EA5E9" />
          <TextInput
            placeholder="Search rooms or vehicles..."
            className="flex-1 pl-2"
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Tabs with light sky and orange design */}
        <View className="px-6 mb-4">
          <View className="flex-row bg-white rounded-full border border-sky-50 shadow-sm">
            {['Rooms', 'Transport'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as "Rooms" | "Transport")}
                className={`flex-1 py-2 rounded-full ${activeTab === tab ? 'bg-orange-500' : 'bg-transparent'}`}
              >
                <Text
                  className={`text-center font-medium ${activeTab === tab ? 'text-white' : 'text-gray-700'}`}
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
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          className="mb-4"
        >
          {activeTab === "Rooms"
            ? rooms.map((room) => <RoomCard key={room.room_id} room={room} />)
            : transports.map((transport) => <TransportCard key={transport.transport_id} transport={transport} />)
          }
        </ScrollView>

        {/* Recent Bookings Title */}
        <View className="px-4 flex-row justify-between items-center mb-2">
          <Text className="text-md font-medium text-gray-800">Recent Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/my-booking')}>
            <Text className="text-sky-500 font-medium">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings (filtered by current user) */}
        {recentBookings.length > 0 ? (
          <View className="mb-8">
            {recentBookings.slice(0, 3).map((booking) => (
              <BookingCard key={`${booking.type}-${booking.booking_id}`} booking={booking} />
            ))}
          </View>
        ) : (
          <View className="mx-4 mb-8 bg-white p-4 rounded-lg border border-sky-50 items-center shadow-sm">
            <Ionicons name="book-outline" size={32} color="#0EA5E9" />
            <Text className="text-gray-800 font-medium mt-2">No recent bookings</Text>
            <Text className="text-gray-600 text-center mt-1">You haven't made any bookings yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;