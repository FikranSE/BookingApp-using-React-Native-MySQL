import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from 'axios';
import { images, icons } from "@/constants";
import { Ionicons } from '@expo/vector-icons';
import { tokenCache } from "@/lib/auth";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { LinearGradient } from 'expo-linear-gradient';

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

  // Tab Button Component with new color scheme
  const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 justify-center items-center py-1.5 rounded-full ${isActive ? 'bg-sky-500' : 'bg-white'}`}
    >
      <Text className={`${isActive ? 'text-white font-bold' : 'text-gray-400'} text-[14px]`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Room Card Component with new color scheme
  const RoomCard = ({ room }: { room: IRoom }) => {
    const facilitiesList = room.facilities.split(',').map(item => item.trim());
    
    // Updated color map for facility tags
    const colorMap = {
      0: { bg: 'bg-sky-50', text: 'text-sky-600' },
      1: { bg: 'bg-sky-100', text: 'text-sky-700' },
      2: { bg: 'bg-orange-50', text: 'text-orange-600' },
      3: { bg: 'bg-orange-100', text: 'text-orange-700' },
    };
  
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-sky-50"
        onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
      >
        <View className="flex-row p-2">
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
              
              <View className="flex-row items-center mt-1">
                <Ionicons name="pricetag-outline" size={13} color="#0EA5E9" />
                <Text className="text-xs text-sky-500 font-medium ml-1.5">
                  {room.room_type}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={13} color="#F97316" />
                <Text className="text-xs text-orange-500 font-medium ml-1.5">
                  {room.capacity} persons
                </Text>
              </View>
            </View>
            
            {/* Facilities */}
            <View className="flex-row flex-wrap gap-1.5 mt-1">
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
  
  // Transport Card Component with new color scheme
  const TransportCard = ({ transport }: { transport: ITransport }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-sky-50"
      onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
    >
      <View className="flex-row p-2">
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
            
            <View className="flex-row items-center mt-1">
              <Ionicons name="person" size={13} color="#0EA5E9" />
              <Text className="text-xs text-sky-500 font-medium ml-1.5">
                Driver:
              </Text>
              <Text className="text-xs text-sky-500 font-medium ml-1.5">
                {transport.driver_name}
              </Text>
            </View>
            
            <View className="flex-row items-center">
             <Image
               source={icons.seat}
               style={{ width: 13, height: 13, tintColor: "#F97316" }}
             />
              <Text className="text-xs text-orange-500 font-medium ml-1.5">
                {transport.capacity} seats
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state components with new color scheme
  const EmptyState = ({ type }: { type: "Rooms" | "Transportation" }) => (
    <View className="flex-1 justify-center items-center py-12">
      <Ionicons name={type === "Rooms" ? "bed-outline" : "car-outline"} size={60} color="#BAE6FD" />
      <Text className="text-lg font-medium text-sky-500 mt-4">No {type} Available</Text>
      <Text className="text-sky-400 text-center mt-2 px-10 text-sm">
        {type === "Rooms" 
          ? "There are no rooms available at the moment. Please check again later." 
          : "There are no vehicles available at the moment. Please check again later."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Gradient Header */}
      <LinearGradient
        colors={['#0EA5E9', '#E0F2FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-40"
      />
       {/* Header with greeting */}
       <View className="px-6 pt-3 pb-5">
          <Text className="text-2xl font-semibold text-white mb-1">Explore</Text>
          <Text className="text-white font-normal">Find rooms and transportation for your needs</Text>
        </View>
        
        {/* Tab Buttons */}
        <View className="px-20 pb-5">
          <View className="flex-row bg-white border border-sky-100 rounded-full shadow-sm">
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
      
      {/* Scrollable container for entire screen */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      
       

        {loading ? (
          <View className="flex-1 justify-center items-center py-32">
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text className="text-sky-500 mt-4 font-normal text-sm">Loading content...</Text>
          </View>
        ) : (
          <View className="flex-1 px-5 pt-1 pb-24 mt-4">
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