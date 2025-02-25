import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from 'axios';
import { images, icons } from "@/constants";
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

const Explore = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Rooms" | "Transportation">("Rooms");
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [transportations, setTransportations] = useState<ITransport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
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

  // Tab Button Component with softer styling
  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 justify-center items-center py-2.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-white'}`}
      style={{
        shadowColor: isActive ? 'transparent' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: isActive ? 0 : 1,
      }}
    >
      <Text className={`${isActive ? 'text-white' : 'text-blue-600'} font-medium text-base`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Enhanced Room Card Component with softer colors
  const RoomCard = ({ room }: { room: IRoom }) => {
    const facilitiesList = room.facilities.split(',').map(item => item.trim());
    
    // Softer color map for facility tags
    const colorMap = {
      0: { bg: 'bg-blue-50', text: 'text-blue-600' },
      1: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
      2: { bg: 'bg-amber-50', text: 'text-amber-600' },
      3: { bg: 'bg-sky-50', text: 'text-sky-600' },
    };
  
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
        onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
      >
        <View className="flex-row p-4">
          <Image
            source={room.image ? { uri: room.image } : images.smroom}
            className="w-24 h-24 rounded-lg"
            resizeMode="cover"
          />
          <View className="flex-1 pl-4 justify-between">
            <View>
              <Text className="text-base font-semibold text-gray-700" numberOfLines={1}>
                {room.room_name}
              </Text>
              
              <View className="flex-row items-center mt-1.5">
                <Ionicons name="pricetag-outline" size={13} color="#4285F4" />
                <Text className="text-xs text-blue-500 font-medium ml-1.5">
                  {room.room_type}
                </Text>
              </View>
              
              <View className="flex-row items-center mt-1.5">
                <Ionicons name="people-outline" size={13} color="#FBBC05" />
                <Text className="text-xs text-amber-500 font-medium ml-1.5">
                  {room.capacity} persons
                </Text>
              </View>
            </View>
            
            {/* Facilities */}
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {facilitiesList.slice(0, 3).map((facility, index) => (
                <View 
                  key={index} 
                  className={`${colorMap[index % 4].bg} px-2 py-0.5 rounded-full`}
                >
                  <Text className={`${colorMap[index % 4].text} text-xs font-normal`}>
                    {facility}
                  </Text>
                </View>
              ))}
              {facilitiesList.length > 3 && (
                <View className="bg-gray-50 px-2 py-0.5 rounded-full">
                  <Text className="text-gray-500 text-xs font-normal">+{facilitiesList.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Enhanced Transport Card Component to match Room style
  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
    >
      <View className="flex-row p-4">
        <Image
          source={transport.image ? { uri: transport.image } : images.smroom}
          className="w-24 h-24 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 pl-4 justify-between">
          <View>
            <Text className="text-base font-semibold text-gray-700" numberOfLines={1}>
              {transport.vehicle_name}
            </Text>
            
            <View className="flex-row items-center mt-1.5">
              <Ionicons name="person-outline" size={13} color="#4285F4" />
              <Text className="text-xs text-blue-500 font-medium ml-1.5">
                {transport.driver_name}
              </Text>
            </View>
            
            <View className="flex-row items-center mt-1.5">
              <Ionicons name="car-outline" size={13} color="#FBBC05" />
              <Text className="text-xs text-amber-500 font-medium ml-1.5">
                {transport.capacity} seats
              </Text>
            </View>
          </View>
          
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state components with softer colors
  const EmptyState = ({ type }: { type: "Rooms" | "Transportation" }) => (
    <View className="flex-1 justify-center items-center py-12">
      <Ionicons name={type === "Rooms" ? "bed-outline" : "car-outline"} size={60} color="#BFE0FF" />
      <Text className="text-lg font-medium text-blue-500 mt-4">No {type} Available</Text>
      <Text className="text-blue-400 text-center mt-2 px-10 text-sm">
        {type === "Rooms" 
          ? "There are no rooms available at the moment. Please check again later." 
          : "There are no vehicles available at the moment. Please check again later."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Scrollable container for entire screen */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      
        {/* Header with greeting */}
        <View className="px-6 pt-3 pb-5">
          <Text className="text-2xl font-semibold text-gray-800 mb-1">Explore</Text>
          <Text className="text-blue-500 font-normal">Find rooms and transportation for your needs</Text>
        </View>
        
        {/* Tab Buttons */}
        <View className="px-5 pb-5">
          <View className="flex-row bg-white p-1.5 rounded-full border border-gray-100 shadow-sm">
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
          <View className="flex-1 justify-center items-center py-32">
            <ActivityIndicator size="large" color="#4285F4" />
            <Text className="text-blue-500 mt-4 font-normal text-sm">Loading content...</Text>
          </View>
        ) : (
          <View className="flex-1 px-5 pt-1 pb-24">
            {activeTab === "Rooms" ? (
              rooms.length > 0 ? 
              rooms.map((room) => <RoomCard key={room.room_id} room={room} />) : 
              <EmptyState type="Rooms" />
            ) : (
              transportations.length > 0 ?
              transportations.map((transport) => <TransportCard key={transport.transport_id} transport={transport} />) :
              <EmptyState type="Transportation" />
            )}
          </View>
        )}
        
        {/* Extra padding at bottom for better scrolling experience */}
        <View className="h-16" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;