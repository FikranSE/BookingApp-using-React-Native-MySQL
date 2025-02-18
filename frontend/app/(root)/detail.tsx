import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const Detail = () => {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const [data, setData] = useState<IRoom | ITransport | null>(null);

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJmaWtyYW4yQGV4YW1wbGUuY29tIiwiaWF0IjoxNzM5ODY0OTU2LCJleHAiOjE3Mzk4Njg1NTZ9.rcWlWgzeYlFQxvcIf1gamDHlZTJoGkj2hO2Z8BUh_dI'; 

  const fetchDetail = async () => {
    try {
      const endpoint = type === 'room' 
        ? `https://j9d3hc82-3001.asse.devtunnels.ms/api/rooms/${id}`
        : `https://j9d3hc82-3001.asse.devtunnels.ms/api/transports/${id}`;

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching details:", error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to fetch details');
      }
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, type]);

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-slate-100 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScrollView className="flex-1 p-5">
        <View className="bg-white rounded-2xl p-6 mb-6">
          <View className="relative h-64 mb-6 overflow-hidden rounded-xl">
            <Image 
              source={{ uri: data.image }} 
              className="w-full h-full rounded-lg object-cover" 
              resizeMode="cover" 
            />
          </View>

          <View className="space-y-4">
            {type === 'room' ? (
              // Room Details
              <>
                <Text className="text-3xl font-bold text-gray-800">
                  {(data as IRoom).room_name}
                </Text>
                <View className="space-y-2">
                  <Text className="text-lg text-gray-700 font-semibold">Room Type</Text>
                  <Text className="text-gray-600">{(data as IRoom).room_type}</Text>
                </View>
                <View className="space-y-2">
                  <Text className="text-lg text-gray-700 font-semibold">Capacity</Text>
                  <Text className="text-gray-600">{(data as IRoom).capacity} people</Text>
                </View>
                <View className="space-y-2">
                  <Text className="text-lg text-gray-700 font-semibold">Facilities</Text>
                  <Text className="text-gray-600">{(data as IRoom).facilities}</Text>
                </View>
              </>
            ) : (
              // Transport Details
              <>
                <Text className="text-3xl font-bold text-gray-800">
                  {(data as ITransport).vehicle_name}
                </Text>
                <View className="space-y-2">
                  <Text className="text-lg text-gray-700 font-semibold">Driver</Text>
                  <Text className="text-gray-600">{(data as ITransport).driver_name}</Text>
                </View>
                <View className="space-y-2">
                  <Text className="text-lg text-gray-700 font-semibold">Capacity</Text>
                  <Text className="text-gray-600">{(data as ITransport).capacity} people</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Detail;