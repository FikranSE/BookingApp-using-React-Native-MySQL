import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from 'axios';
import {images} from "@/constants";
import { Ionicons } from '@expo/vector-icons';
import { tokenCache } from "@/lib/auth";  // Import tokenCache from lib/auth
import { AUTH_TOKEN_KEY } from "@/lib/constants";  // Import the constant key for the auth token

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

const Explore = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Rooms" | "Transportation">("Rooms");
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [transportations, setTransportations] = useState<ITransport[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch authToken from tokenCache
  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const authToken = await fetchAuthToken();

      if (!authToken) {
        Alert.alert('Error', 'Not authenticated');
        // Redirect to login page if no token
        router.push('/(auth)/sign-in');
        return;
      }

      await Promise.all([fetchAllRooms(authToken), fetchAllTransportations(authToken)]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRooms = async (authToken: string) => {
    try {
      const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      handleError(error);
    }
  };

  const fetchAllTransportations = async (authToken: string) => {
    try {
      const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/transports', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setTransportations(response.data);
    } catch (error) {
      console.error("Error fetching transportations:", error);
      handleError(error);
    }
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

  useEffect(() => {
    fetchData();
  }, []);

  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
      className={`flex-1 mx-2 justify-center items-center py-3.5 rounded-2xl ${
        isActive 
          ? 'bg-blue-900' 
          : 'bg-white'
      }`}
    >
      <Text className={`${isActive ? 'text-white' : 'text-blue-900'} font-bold text-base`}>
        {title}
      </Text>
    </TouchableOpacity>
  );


  const RoomCard = ({ room }: { room: IRoom }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
      className="bg-white rounded-3xl mb-6 overflow-hidden shadow-sm"
    >
      <View className="relative">
        <Image 
          source={images.profile1} 
          className="w-full h-56"
          resizeMode="cover"
        />
        <View 
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex-row items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons name="people" size={14} color="#1E3A8A" />
          <Text className="text-blue-900 text-xs font-bold ml-1">{room.capacity}</Text>
        </View>
      </View>
      
      <View className="p-5">
        <Text className="text-2xl font-bold text-gray-800 mb-4">{room.room_name}</Text>
        
        <View className="space-y-3">
          <View className="flex-row items-center bg-blue-50/80 p-3 rounded-2xl">
            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
              <Ionicons name="business" size={20} color="#1E3A8A" />
            </View>
            <Text className="text-blue-900 ml-3 flex-1 font-semibold">{room.room_type}</Text>
          </View>

          <View className="flex-row items-center bg-blue-50/80 p-3 rounded-2xl">
            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
              <Ionicons name="grid" size={20} color="#1E3A8A" />
            </View>
            <Text className="text-blue-900 ml-3 flex-1">{room.facilities}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
      className="bg-white rounded-3xl mb-6 overflow-hidden shadow-sm"
    >
      <View className="relative">
        <Image 
          source={{ uri: transport.image }} 
          className="w-full h-56"
          resizeMode="cover"
        />
        <View 
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex-row items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons name="car" size={14} color="#1E3A8A" />
          <Text className="text-blue-900 text-xs font-bold ml-1">{transport.capacity} seats</Text>
        </View>
      </View>
      
      <View className="p-5">
        <Text className="text-2xl font-bold text-gray-800 mb-4">{transport.vehicle_name}</Text>
        
        <View className="flex-row items-center bg-blue-50/80 p-3 rounded-2xl">
          <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center">
            <Ionicons name="person" size={20} color="#1E3A8A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm text-blue-900/60 font-medium">Driver</Text>
            <Text className="text-blue-900 font-semibold">{transport.driver_name}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row bg-gray-100 p-2 rounded-2xl">
          <TabButton 
            title="Rooms" 
            isActive={activeTab === "Rooms"}
            onPress={() => setActiveTab("Rooms")}
          />
          <TabButton 
            title="Transportation" 
            isActive={activeTab === "Transportation"}
            onPress={() => setActiveTab("Transportation")}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2 pb-24">
          {activeTab === "Rooms" ? (
            rooms.map((room) => <RoomCard key={room.room_id} room={room} />)
          ) : (
            transportations.map((transport) => <TransportCard key={transport.transport_id} transport={transport} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Explore;