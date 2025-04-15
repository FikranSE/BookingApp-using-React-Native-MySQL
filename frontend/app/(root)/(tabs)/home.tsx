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
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import api from "@/lib/api";
import { images } from "@/constants";
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
  agenda: string;
  description: string;
  type: 'ROOM' | 'TRANSPORT';
  itemName: string;
  user_id: number;
  pic: string;
  room_id?: number;
  transport_id?: number;
}

const BASE_URL = 'https://j9d3hc82-3001.asse.devtunnels.ms/api';

const Home = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState<"Rooms" | "Transport">("Rooms");
  const [notifications, setNotifications] = useState(3);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [user, setUser] = useState<any>(null);
  const [transports, setTransports] = useState<ITransport[]>([]);
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastApprovedBookings, setPastApprovedBookings] = useState<IBooking[]>([]);
  
  // 1) State untuk search:
  const [searchQuery, setSearchQuery] = useState<string>("");

  const router = useRouter();

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
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

      // Fetch bookings
      try {
        const [roomBookingsRes, transportBookingsRes] = await Promise.all([
          axios.get(`${BASE_URL}/room-bookings`, { headers }),
          axios.get(`${BASE_URL}/transport-bookings`, { headers })
        ]);

        // Filter bookings untuk user saat ini
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

        // Past Approved
        const currentDate = new Date();
        const pastApproved = allBookings.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return (
            booking.status.toLowerCase() === 'approved' &&
            bookingDate < currentDate
          );
        });

        setPastApprovedBookings(pastApproved);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        handleError(error);
        setRecentBookings([]);
        setPastApprovedBookings([]);
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

  // 2) Buat data terfilter berdasarkan searchQuery
  const filteredRooms = rooms.filter((room) => {
    const lowerQuery = searchQuery.toLowerCase();
    // Anda bisa menambahkan field filtering lain sesuai kebutuhan
    return (
      room.room_name.toLowerCase().includes(lowerQuery) ||
      room.room_type.toLowerCase().includes(lowerQuery) ||
      room.facilities.toLowerCase().includes(lowerQuery)
    );
  });

  const filteredTransports = transports.filter((transport) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      transport.vehicle_name.toLowerCase().includes(lowerQuery) ||
      transport.driver_name.toLowerCase().includes(lowerQuery)
    );
  });

  // Modern Booking Card
  const RecentBookingCard = ({ booking }: { booking: IBooking }) => {
    const handlePress = () => {
      if (booking.type.toUpperCase() === "ROOM") {
        router.push(`/detail-bookingRoom?id=${booking.booking_id}`);
      } else if (booking.type.toUpperCase() === "TRANSPORT") {
        router.push(`/detail-bookingTransport?id=${booking.booking_id}`);
      }
    };

    const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case 'approved':
          return {
            bg: 'bg-green-100',
            text: 'text-green-600',
            label: 'Approved'
          };
        case 'pending':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-600',
            label: 'Pending'
          };
        case 'rejected':
          return {
            bg: 'bg-red-100',
            text: 'text-red-600',
            label: 'Rejected'
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-600',
            label: status
          };
      }
    };

    const statusStyle = getStatusStyle(booking.status);

    return (
      <View
        className="mx-4 mb-3 overflow-hidden rounded-xl"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          className="border border-gray-100 rounded-xl"
        >
          <View className="p-4">
            <View className="flex-row items-center">
              <BlurView intensity={60} tint="light" className="w-12 h-12 rounded-full overflow-hidden">
                <View className="w-full h-full bg-gray-100/80 items-center justify-center">
                  <Ionicons
                    name={booking.type === 'ROOM' ? 'business' : 'car'}
                    size={20}
                    color="#0EA5E9"
                  />
                </View>
              </BlurView>

              <View className="flex-1 ml-3">
                <Text className="text-base font-medium text-gray-700">
                  {booking.agenda || 'Unnamed Item'}
                </Text>

                <View className="flex-row flex-wrap mt-1">
                  <Text className="text-xs text-gray-500 mr-2">
                    <Text className="font-medium text-gray-600">PIC:</Text> {booking.pic || 'Not specified'}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    <Text className="font-medium text-gray-600">Section:</Text> {booking.section || 'Not specified'}
                  </Text>
                </View>
 
                <View className="flex-row items-center mt-2">
                  <View className="flex-row items-center mr-2 bg-gray-50 px-2 py-0.5 rounded-full">
                    <Ionicons name="calendar-outline" size={12} color="#0EA5E9" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>

                  <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-full">
                    <Ionicons name="time-outline" size={12} color="#0EA5E9" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {booking.start_time} - {booking.end_time}
                    </Text>
                  </View>
                </View>
              </View>

              <View className={`rounded-full px-2.5 py-1 ${statusStyle.bg}`}>
                <View className="flex-row items-center">
                  <Text className={`text-xs font-medium ${statusStyle.text}`}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={handlePress}
                className="flex-row items-center bg-sky-50 px-3 py-1.5 rounded-full"
              >
                <Ionicons name="eye-outline" size={16} color="#0EA5E9" />
                <Text className="text-sky-500 text-xs font-medium ml-1">View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Logic cancel booking
                }}
                className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full"
              >
                <Ionicons name="close-outline" size={16} color="#EF4444" />
                <Text className="text-red-500 text-xs font-medium ml-1">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Modern Past Booking Card
  const PastBookingCard = ({ booking }: { booking: IBooking }) => (
    <View
      key={`past-${booking.type}-${booking.booking_id}`}
      className="mx-4 mb-3 overflow-hidden rounded-xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
      }}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        className="border border-gray-100 rounded-xl"
      >
        <View className="p-4">
          <View className="flex-row items-center">
            <BlurView intensity={60} tint="light" className="w-12 h-12 rounded-full overflow-hidden">
              <View className="w-full h-full bg-gray-100/80 items-center justify-center">
                <Ionicons
                  name={booking.type === 'ROOM' ? 'business' : 'car'}
                  size={20}
                  color="#0EA5E9"
                />
              </View>
            </BlurView>

            <View className="flex-1 ml-3">
              <Text className="text-base font-medium text-gray-700">
                {booking.itemName || 'Unnamed Item'}
              </Text>

              <View className="flex-row flex-wrap mt-1">
                <Text className="text-xs text-gray-500 mr-2">
                  <Text className="font-medium text-gray-600">PIC:</Text> {booking.pic || 'Not specified'}
                </Text>
                <Text className="text-xs text-gray-500">
                  <Text className="font-medium text-gray-600">Section:</Text> {booking.section || 'Not specified'}
                </Text>
              </View>

              <View className="flex-row items-center mt-2">
                <View className="flex-row items-center mr-2 bg-gray-50 px-2 py-0.5 rounded-full">
                  <Ionicons name="calendar-outline" size={12} color="#0EA5E9" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-full">
                  <Ionicons name="time-outline" size={12} color="#0EA5E9" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {booking.start_time} - {booking.end_time}
                  </Text>
                </View>
              </View>
            </View>

            <View className="rounded-full px-2.5 py-1 bg-green-50 border border-green-100">
              <Text className="text-xs font-medium text-green-600">
                Completed
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => {
                if (booking.type.toUpperCase() === "ROOM") {
                  router.push(`/detail-bookingRoom?id=${booking.booking_id}`);
                } else if (booking.type.toUpperCase() === "TRANSPORT") {
                  router.push(`/detail-bookingTransport?id=${booking.booking_id}`);
                }
              }}
              className="flex-row items-center bg-sky-50 px-3 py-1.5 rounded-full"
            >
              <Ionicons name="eye-outline" size={16} color="#0EA5E9" />
              <Text className="text-sky-500 text-xs font-medium ml-1">View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Navigate booking creation (Book Again)
                if (booking.type.toUpperCase() === "ROOM") {
                  router.push({
                    pathname: '/booking-room',
                    params: {
                      selectedRoomId: booking.room_id,
                      selectedRoomName: booking.itemName,
                      pic: booking.pic,
                      section: booking.section,
                      description: booking.description,
                      bookAgain: 'true'
                    }
                  });
                } else if (booking.type.toUpperCase() === "TRANSPORT") {
                  router.push({
                    pathname: '/booking-transport',
                    params: {
                      selectedTransportId: booking.transport_id,
                      selectedTransportName: booking.itemName,
                      pic: booking.pic,
                      section: booking.section,
                      description: booking.description,
                      bookAgain: 'true'
                    }
                  });
                }
              }}
              className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full"
            >
              <Ionicons name="repeat-outline" size={16} color="#F97316" />
              <Text className="text-orange-500 text-xs font-medium ml-1">Book Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Modern Room Card
  const RoomCard = ({ room }: { room: IRoom }) => {
    // Split facilities string
    const facilitiesList = room.facilities.split(',').map(item => item.trim());

    return (
      <TouchableOpacity
        onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
        className="mb-4 mx-2 rounded-2xl overflow-hidden"
        style={{
          width: width * 0.75,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8
        }}
      >
        <View className="relative">
          <Image
            source={images.profile1}
            className="w-full h-40"
            resizeMode="cover"
          />

          <LinearGradient
            colors={['rgba(14, 165, 233, 0.15)', 'rgba(14, 165, 233, 0.05)']}
            className="absolute top-0 left-0 right-0 bottom-0"
          />

          <View className="absolute top-3 right-3">
            <BlurView intensity={80} tint="light" className="rounded-full overflow-hidden">
              <View className="px-3 py-1.5 flex-row items-center">
                <Ionicons name="people" size={14} color="#0EA5E9" />
                <Text className="text-sky-600 font-medium text-xs">
                  {room.capacity} people
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        <View className="p-4 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-lg text-gray-800 font-bold">{room.room_name}</Text>
              <Text className="text-gray-500 text-sm">{room.room_type}</Text>
            </View>

            <TouchableOpacity
              className="px-4 py-2 rounded-xl bg-orange-400"
              onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
              style={{
                shadowColor: "#f97316",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Text className="text-white font-medium text-xs">Book Now</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-1">
            {facilitiesList.slice(0, 3).map((facility, index) => (
              <View
                key={index}
                className="bg-sky-50 px-3 py-1 rounded-full border border-sky-100"
              >
                <Text className="text-sky-600 text-xs">
                  {facility}
                </Text>
              </View>
            ))}
            {facilitiesList.length > 3 && (
              <View className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                <Text className="text-gray-500 text-xs">+{facilitiesList.length - 3} more</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Modern Transport Card
  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
      className="mb-4 mx-2 rounded-2xl overflow-hidden"
      style={{
        width: width * 0.75,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8
      }}
    >
      <View className="relative">
        <Image
          source={images.profile1}
          className="w-full h-40"
          resizeMode="cover"
        />

        <LinearGradient
          colors={['rgba(14, 165, 233, 0.15)', 'rgba(14, 165, 233, 0.05)']}
          className="absolute top-0 left-0 right-0 bottom-0"
        />

        <View className="absolute top-3 right-3">
          <BlurView intensity={80} tint="light" className="rounded-full overflow-hidden">
            <View className="px-3 py-1.5 flex-row items-center">
              <Ionicons name="people" size={14} color="#0EA5E9" />
              <Text className="text-sky-600 font-medium text-xs">
                {transport.capacity} seats
              </Text>
            </View>
          </BlurView>
        </View>
      </View>

      <View className="p-4 bg-white">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg text-gray-800 font-bold">{transport.vehicle_name}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="person" size={12} color="#718096" />
              <Text className="text-gray-500 text-sm ml-1">
                Driver: {transport.driver_name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="px-4 py-2 rounded-xl"
            onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
            style={{
              backgroundColor: '#f97316',
              shadowColor: "#f97316",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text className="text-white font-medium text-xs">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Section Title
  const SectionTitle = ({ title, actionText = "See All", onActionPress }) => (
    <View className="px-4 flex-row justify-between items-center mb-4 mt-6">
      <View className="flex-row items-center">
        <View className="w-1 h-5 bg-sky-500 rounded-full mr-2" />
        <Text className="text-lg font-bold text-gray-800">{title}</Text>
      </View>
      <TouchableOpacity
        onPress={onActionPress}
        className="flex-row items-center"
      >
        <Text className="text-sky-500 font-medium text-sm mr-1">{actionText}</Text>
        <Feather name="chevron-right" size={16} color="#0EA5E9" />
      </TouchableOpacity>
    </View>
  );

  // Empty State component
  const EmptyState = ({ icon, title, message }) => (
    <View className="mx-4 mb-8 bg-white p-5 rounded-xl border border-gray-100 items-center shadow-sm">
      <View className="bg-sky-50 w-16 h-16 rounded-full items-center justify-center mb-2">
        <Ionicons name={icon} size={28} color="#0EA5E9" />
      </View>
      <Text className="text-gray-800 font-bold text-lg mt-2">{title}</Text>
      <Text className="text-gray-500 text-center mt-1">{message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pb-20">
      <LinearGradient
        colors={['#0EA5E9', '#38BDF8']}
        className="pt-4 pb-6 px-4 rounded-b-3xl"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 10
        }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <BlurView intensity={20} tint="light" className="w-10 h-10 rounded-full overflow-hidden">
              <View className="w-full h-full items-center justify-center bg-white/30">
                <Text className="text-white font-bold">
                  {user?.email ? getInitials(user.email) : 'U'}
                </Text>
              </View>
            </BlurView>
            <View className="ml-3">
              <Text className="text-sky-100 text-xs">{getGreeting()}</Text>
              <Text className="text-white text-base font-medium">{user?.name || 'User'}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(root)/notifikasi')}
            className="relative"
          >
            <BlurView intensity={20} tint="light" className="w-10 h-10 rounded-full overflow-hidden">
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="notifications-outline" size={20} color="white" />
              </View>
            </BlurView>
            {notifications > 0 && (
              <View className="absolute -top-1 -right-1 bg-orange-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-xs font-bold">
                  {notifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar di-header */}
        <View className="flex-row bg-white/20 rounded-xl px-3 py-2.5 items-center backdrop-blur-md">
          <Ionicons name="search-outline" size={18} color="white" />
          <TextInput
            placeholder="Search rooms or vehicles..."
            className="flex-1 pl-2 text-white"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            // 3) Update searchQuery saat teks berubah
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1">
        <View className="px-4 mt-6 mb-6 z-10">
          <View
            className="flex-row bg-white rounded-2xl border border-sky-50"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6
            }}
          >
            {['Rooms', 'Transport'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as "Rooms" | "Transport")}
                className={`flex-1 py-3 ${
                  activeTab === tab ? 'bg-sky-500' : 'bg-transparent'
                } ${tab === 'Rooms' ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons
                    name={tab === 'Rooms' ? 'business' : 'car'}
                    size={16}
                    color={activeTab === tab ? 'white' : '#94A3B8'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    className={`text-center font-medium ${
                      activeTab === tab ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Featured {activeTab}
          </Text>
          <Text className="text-gray-500 mb-4">
            Find and book the best {activeTab.toLowerCase()} for your needs
          </Text>
        </View>

        {/* 4) Menampilkan data terfilter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          className="mb-6"
        >
          {activeTab === "Rooms"
            ? filteredRooms.map((room) => (
                <RoomCard key={room.room_id} room={room} />
              ))
            : filteredTransports.map((transport) => (
                <TransportCard key={transport.transport_id} transport={transport} />
              ))
          }
        </ScrollView>

        <SectionTitle
          title="Recent Bookings"
          onActionPress={() => router.push('/(root)/(tabs)/my-booking')}
        />

        {recentBookings.length > 0 ? (
          <View className="mb-6">
            {recentBookings.slice(0, 3).map((booking) => (
              <RecentBookingCard
                key={`${booking.type}-${booking.booking_id}`}
                booking={booking}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Recent Bookings"
            message="You haven't made any bookings yet. Book a room or transport to get started."
          />
        )}

        <SectionTitle
          title="Past Approved Bookings"
          onActionPress={() => router.push('/(root)/(tabs)/my-booking')}
        />

        {pastApprovedBookings.length > 0 ? (
          <View className="mb-8">
            {pastApprovedBookings.slice(0, 3).map((booking) => (
              <PastBookingCard
                key={`past-${booking.type}-${booking.booking_id}`}
                booking={booking}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="checkmark-circle-outline"
            title="No Past Bookings"
            message="You don't have any completed bookings yet"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
