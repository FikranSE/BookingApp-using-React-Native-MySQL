import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from 'axios';

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

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJmaWtyYW4yQGV4YW1wbGUuY29tIiwiaWF0IjoxNzM5ODY0OTU2LCJleHAiOjE3Mzk4Njg1NTZ9.rcWlWgzeYlFQxvcIf1gamDHlZTJoGkj2hO2Z8BUh_dI'; 

  const fetchAllRooms = async () => {
    try {
      const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to fetch rooms');
      }
    }
  };

  const fetchAllTransportations = async () => {
    try {
      const response = await axios.get('https://j9d3hc82-3001.asse.devtunnels.ms/api/transports', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      setTransportations(response.data);
    } catch (error) {
      console.error("Error fetching transportations:", error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to fetch transportation details');
      }
    }
  };

  useEffect(() => {
    fetchAllRooms();
    fetchAllTransportations();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-100 mt-5">
      {/* Tab Switcher */}
      <View className="flex-row justify-around py-3 bg-slate-100">
        <TouchableOpacity
          onPress={() => setActiveTab("Rooms")}
          className={activeTab === "Rooms" ? "border-b-2 border-blue-900 pb-2" : "pb-2"}
        >
          <Text className={activeTab === "Rooms" ? "text-blue-900 font-bold" : "text-gray-800 font-medium"}>
            Rooms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("Transportation")}
          className={activeTab === "Transportation" ? "border-b-2 border-blue-900 pb-2" : "pb-2"}
        >
          <Text className={activeTab === "Transportation" ? "text-blue-900 font-bold" : "text-gray-800 font-medium"}>
            Transportation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      <ScrollView className="flex-1 px-5 mb-[100px]">
        {/* Rooms List */}
        {activeTab === "Rooms" && rooms.map((room) => (
          <View key={room.room_id} className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden">
            <View className="relative h-48 mb-6 overflow-hidden rounded-xl">
              <Image source={{ uri: room.image }} className="w-full h-full rounded-lg object-cover" resizeMode="cover" />
            </View>

            <View className="space-y-4">
              <Text className="text-2xl font-bold text-gray-800">{room.room_name}</Text>
              <Text className="text-sm text-gray-600">{room.room_type}</Text>
              <Text className="text-sm text-gray-600">{room.capacity} people</Text>
              <Text className="text-sm text-gray-600">{room.facilities}</Text>
              
              <TouchableOpacity 
                onPress={() => router.push(`/detail?id=${room.room_id}&type=room`)}
                className="bg-blue-900 py-2 px-4 rounded-lg mt-2"
              >
                <Text className="text-white text-center font-semibold">See Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Transportation List */}
        {activeTab === "Transportation" && transportations.map((transport) => (
          <View key={transport.transport_id} className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden">
            <View className="relative h-48 mb-6 overflow-hidden rounded-xl">
              <Image source={{ uri: transport.image }} className="w-full h-full rounded-lg object-cover" resizeMode="cover" />
            </View>

            <View className="space-y-4">
              <Text className="text-2xl font-bold text-gray-800">{transport.vehicle_name}</Text>
              <Text className="text-sm text-gray-600">Driver: {transport.driver_name}</Text>
              <Text className="text-sm text-gray-600">Capacity: {transport.capacity} people</Text>
              
              <TouchableOpacity 
                onPress={() => router.push(`/detail?id=${transport.transport_id}&type=transport`)}
                className="bg-blue-900 py-2 px-4 rounded-lg mt-2"
              >
                <Text className="text-white text-center font-semibold">See Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Explore;