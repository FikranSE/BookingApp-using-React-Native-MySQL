import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from 'axios';
import { images, icons } from "@/constants";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

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

const Detail = () => {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const [data, setData] = useState<IRoom | ITransport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  const fetchDetail = async () => {
    try {
      const authToken = await fetchAuthToken();

      if (!authToken) {
        Alert.alert('Error', 'Not authenticated');
        router.push('/(auth)/sign-in');
        return;
      }

      const endpoint = type === 'room'
        ? `https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms/${id}`
        : `https://j9d3hc82-3001.asse.devtunnels.ms/api/transports/${id}`;

      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again to continue.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }
        ]);
      } else {
        Alert.alert('Error', 'Failed to fetch details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, type]);

  const handleBookNow = () => {
    if (!data) return;
    
    if (type === 'room') {
      // Navigate to room booking page with pre-selected room
      router.push({
        pathname: '/(root)/booking-room',
        params: { 
          selectedRoomId: (data as IRoom).room_id,
          selectedRoomName: (data as IRoom).room_name
        }
      });
    } else {
      // Navigate to transport booking page with pre-selected transport
      router.push({
        pathname: '/(root)/booking-transport',
        params: { 
          selectedTransportId: (data as ITransport).transport_id,
          selectedTransportName: (data as ITransport).vehicle_name
        }
      });
    }
  };

  const InfoRow = ({ icon, label, value }: { 
    icon: string; 
    label: string; 
    value: string;
  }) => (
    <View className="mb-3 flex-row items-center">
      <View className="w-10 h-10 bg-sky-100 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon as any} size={18} color="#0EA5E9" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-medium">{label}</Text>
        <Text className="text-gray-800 font-semibold">{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="small" color="#0EA5E9" />
      </View>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No data available</Text>
      </SafeAreaView>
    );
  }

  const title = type === 'room' ? (data as IRoom).room_name : (data as ITransport).vehicle_name;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      
      <View className="relative">
        <Image
          source={images.smroom}
          className="w-full h-96"
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['rgba(14,165,233,0.7)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-32"
        />
        
        <SafeAreaView className="absolute top-0 left-0 right-0">
          <View className="flex-row justify-between items-center px-4 pt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#0EA5E9" />
            </TouchableOpacity>
            
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
              <Ionicons name="heart-outline" size={20} color="#F97316" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        
        <View className="absolute bottom-0 left-0 right-0">
          <LinearGradient
            colors={['transparent', 'rgba(14,165,233,0.9)']}
            className="p-6 pb-8"
          >
            <Text className="text-white text-2xl font-bold">{title}</Text>
            <Text className="text-white/80 mt-1">
              {type === 'room' 
                ? `${(data as IRoom).room_type} • ${(data as IRoom).capacity} Capacity` 
                : `Vehicle • ${(data as ITransport).capacity} Capacity`}
            </Text>
          </LinearGradient>
        </View>
      </View>
      
      <ScrollView className="flex-1 pt-6 px-5">
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-sky-100">
          <Text className="text-lg font-semibold text-sky-600 mb-4">
            {type === 'room' ? 'Room Details' : 'Vehicle Details'}
          </Text>
          
          {type === 'room' ? (
            <View>
              <InfoRow
                icon="business"
                label="ROOM TYPE"
                value={(data as IRoom).room_type}
              />
              <InfoRow
                icon="people"
                label="CAPACITY"
                value={`${(data as IRoom).capacity} people`}
              />
              <InfoRow
                icon="checkmark-circle"
                label="FACILITIES"
                value={(data as IRoom).facilities}
              />
            </View>
          ) : (
            <View>
              <InfoRow
                icon="person"
                label="DRIVER"
                value={(data as ITransport).driver_name}
              />
              <InfoRow
                icon="people"
                label="CAPACITY"
                value={`${(data as ITransport).capacity} people`}
              />
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          className="bg-orange-500 py-4 rounded-lg items-center mb-6 shadow-sm"
          onPress={handleBookNow}
        >
          <Text className="text-white font-bold">Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Detail;