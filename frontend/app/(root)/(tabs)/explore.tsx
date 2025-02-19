import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJmaWtyYW4zQGdtYWlsLmNvbSIsImlhdCI6MTczOTk1Nzg4NiwiZXhwIjoxNzM5OTYxNDg2fQ.g9G3QfDCcV4PTQ4qE6me4pCVWYOsNj5dBVIN2M8wrV0';

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAllRooms(), fetchAllTransportations()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRooms = async () => {
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

  const fetchAllTransportations = async () => {
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
        { text: 'OK', onPress: () => router.replace('/login') }
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      className={`w-1/3 justify-center items-center mr-4 py-3 rounded-full ${
        isActive 
          ? 'bg-blue-900' 
          : 'bg-white'
      }`}
    >
      <Text className={`${isActive ? 'text-white' : 'text-blue-900'} font-semibold`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const RoomCard = ({ room }: { room: IRoom }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
      className="bg-white rounded-3xl mb-6 overflow-hidden border border-gray-100"
    >
      <View className="relative">
        <Image 
          source={{ uri: room.image }} 
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4 bg-blue-900 px-4 py-2 rounded-full">
          <Text className="text-white text-xs font-medium">{room.capacity} people</Text>
        </View>
      </View>
      
      <View className="p-5">
        <Text className="text-xl font-bold text-gray-800 mb-3">{room.room_name}</Text>
        <View className="flex-row items-center mb-3 p-2 rounded-lg bg-blue-50">
          <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
            <Ionicons name="business" size={16} color="#1E3A8A" />
          </View>
          <Text className="text-blue-900 ml-2 flex-1 font-medium">{room.room_type}</Text>
        </View>
        <View className="flex-row items-center p-2 rounded-lg bg-blue-50">
          <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
            <Ionicons name="checkmark-circle" size={16} color="#1E3A8A" />
          </View>
          <Text className="text-blue-900 ml-2 flex-1">{room.facilities}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
      className="bg-white rounded-3xl mb-6 overflow-hidden border border-gray-100"
    >
      <View className="relative">
        <Image 
          source={{ uri: transport.image }} 
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute top-4 right-4 bg-blue-900 px-4 py-2 rounded-full">
          <Text className="text-white text-xs font-medium">{transport.capacity} seats</Text>
        </View>
      </View>
      
      <View className="p-5">
        <Text className="text-xl font-bold text-gray-800 mb-3">{transport.vehicle_name}</Text>
        <View className="flex-row items-center p-2 rounded-lg bg-blue-50">
          <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
            <Ionicons name="person" size={16} color="#1E3A8A" />
          </View>
          <Text className="text-blue-900 ml-2 flex-1">{transport.driver_name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-24">
      <View className="px-5 pt-4 pb-6">
        
        <View className="flex-row justify-center items-center">
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
        <ScrollView className="flex-1 px-5 pt-6">
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