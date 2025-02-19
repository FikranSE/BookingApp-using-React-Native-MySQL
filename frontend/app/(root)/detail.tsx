import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const Detail = () => {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const [data, setData] = useState<IRoom | ITransport | null>(null);
  const [loading, setLoading] = useState(true);

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJmaWtyYW4zQGdtYWlsLmNvbSIsImlhdCI6MTczOTk1Nzg4NiwiZXhwIjoxNzM5OTYxNDg2fQ.g9G3QfDCcV4PTQ4qE6me4pCVWYOsNj5dBVIN2M8wrV0';

  const fetchDetail = async () => {
    try {
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

  const InfoRow = ({ icon, label, value }: { 
    icon: string; 
    label: string; 
    value: string;
  }) => (
    <View className="mb-4">
      <View className="flex-row items-center bg-blue-50 rounded-2xl p-4">
        <View className="w-12 h-12 bg-blue-900 rounded-xl items-center justify-center mr-4">
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-blue-900 text-sm font-medium">{label}</Text>
          <Text className="text-gray-800 font-semibold text-lg mt-1">{value}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="relative">
          <Image
            source={{ uri: data.image }}
            className="w-full h-80"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-12 h-12 bg-blue-900 rounded-full items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-6 -mt-10 bg-white rounded-t-3xl">
          <Text className="text-3xl font-bold text-gray-800 mb-8">
            {type === 'room' ? (data as IRoom).room_name : (data as ITransport).vehicle_name}
          </Text>

          {type === 'room' ? (
            // Room Details
            <View>
              <InfoRow
                icon="business"
                label="Room Type"
                value={(data as IRoom).room_type}
              />
              <InfoRow
                icon="people"
                label="Capacity"
                value={`${(data as IRoom).capacity} people`}
              />
              <InfoRow
                icon="checkmark-circle"
                label="Facilities"
                value={(data as IRoom).facilities}
              />
            </View>
          ) : (
            // Transport Details
            <View>
              <InfoRow
                icon="person"
                label="Driver"
                value={(data as ITransport).driver_name}
              />
              <InfoRow
                icon="people"
                label="Capacity"
                value={`${(data as ITransport).capacity} people`}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Detail;