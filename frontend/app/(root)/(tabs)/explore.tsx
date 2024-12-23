import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/constants";
import Header from "@/components/Header";

interface Room {
  id: string;
  size: string;
  name: string;
  capacity: string;
  image: any;
  assets: string[]; 
}

const assetIcons = {
  Mic: icons.mic,
  Projector: icons.projector,
  Whiteboard: icons.whiteboard,
  WiFi: icons.wifi,
  "Air Conditioner": icons.ac,
};

const Rooms = () => {
  const [activeTab, setActiveTab] = useState("Rooms");

  const rooms = [
    {
      id: '1',
      size: 'Small meeting room',
      name: 'Melati',
      capacity: 3,
      image: require('@/assets/images/small-room.jpg'),
      assets: ['Mic', 'Projector', 'Whiteboard'],
    },
    {
      id: '2',
      size: 'Middle meeting room',
      name: 'Mawar',
      capacity: 8,
      image: require('@/assets/images/middle-room.jpg'),
      assets: ['Mic', 'Projector', 'WiFi'],
    },
    {
      id: '3',
      size: 'Big meeting room',
      name: 'Anggrek',
      capacity: 12,
      image: require('@/assets/images/big-room.jpg'),
      assets: ['Mic', 'Projector', 'Air Conditioner'],
    },
  ];

  const transportation = [
    {
      id: '1',
      name: 'Kijang Innova Zenix',
      capacity: '7 seats',
      image: require('@/assets/images/car1.jpg'),
    },
    {
      id: '2',
      name: 'Kijang Innova reborn 2.4 G',
      capacity: '7 seats',
      image: require('@/assets/images/car2.jpg'),
    },
    {
      id: '3',
      name: 'Alphard',
      capacity: '6 seats',
      image: require('@/assets/images/car3.jpg'),
    },
  ];

  const getCapacityInterval = (capacity) => {
    if (capacity <= 5) return '3-5';
    if (capacity <= 10) return '5-10';
    return '10-15';
  };

  const updatedRooms = rooms.map(room => ({
    ...room,
    capacity: getCapacityInterval(room.capacity)
  }));

  const RoomCard = ({ room }: { room: Room }) => (
    <View className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden" >
      {/* Gradient overlay */}
      <View className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0" />
      
      {/* Main image container */}
      <View className="relative h-48 mb-4 overflow-hidden rounded-xl">
        <Image 
          source={room.image}
          className="w-full h-full rounded-lg object-cover"
          resizeMode="cover"
        />
        
        {/* Size tag */}
        <View className="absolute top-4 right-4 bg-white/90 px-4 py-1 rounded-full" style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,
          elevation: 2
        }}>
          <Text className="text-blue-900 font-semibold">{room.size}</Text>
        </View>
      </View>
  
      {/* Content section */}
      <View className="space-y-4">
        {/* Room name with icon */}
        <View className="flex-row items-center space-x-2">
          <Image
            source={icons.tag}
            className="w-5 h-5"
            tintColor="#003580"
          />
          <Text className="text-xl font-bold text-gray-800">{room.name}</Text>
        </View>
  
        {/* Features grid */}
        <View className="bg-slate-50 rounded-xl p-4">
          <View className="flex-row flex-wrap gap-4">
            {/* Capacity */}
            <View className="flex-row items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
              <Image
                source={icons.member}
                className="w-4 h-4"
                tintColor="#003580"
              />
              <Text className="text-sm text-gray-600">{room.capacity} persons</Text>
            </View>
            {/* assets */}
            {room.assets.map((asset, index) => (
            <View key={index} className="flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
              <Image
                source={assetIcons[asset]}
                className="w-4 h-4 mr-2"
                tintColor="#003580"
              />
              <Text className="text-blue-900 text-xs font-medium">{asset}</Text>
            </View>
          ))}
            
          </View>
        </View>
  
        {/* Book button */}
        <TouchableOpacity 
          className="bg-blue-900 px-6 py-3 rounded-xl mt-2"
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5
          }}
        >
          <Text className="text-white font-semibold text-center">Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TransportationCard = ({ transport }: { transport: any }) => (
    <View className="relative bg-white rounded-2xl p-6 mb-6 overflow-hidden group">
      {/* Gradient overlay */}
      <View className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100" />
      
      {/* Main image container */}
      <View className="relative h-48 mb-4 overflow-hidden rounded-xl">
        <Image 
          source={transport.image}
          className="w-full h-full rounded-lg object-cover transform group-hover:scale-110"
          resizeMode="cover"
        />
      </View>
  
      {/* Content section */}
      <View className="space-y-3">
        <Text className="text-xl font-bold text-gray-800 group-hover:text-blue-900">
          {transport.name}
        </Text>
  
        {/* Stats row */}
        <View className="flex flex-row items-center space-x-6">
          {/* Capacity */}
          <View className="space-x-2 flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
            <Image 
              source={icons.seat}
              className="w-5 h-5"
              tintColor="#003580"
            />
            <Text className="text-sm text-blue-900 font-medium">{transport.capacity}</Text>
          </View>
          
        </View>
  
        {/* Book button */}
        <TouchableOpacity 
          className="bg-blue-900 px-6 py-3 rounded-xl active:scale-95"
        >
          <Text className="text-white font-semibold text-center">Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <Header/>

      {/* Tabs */}
      <View className="flex-row justify-around py-3 bg-slate-100">
        <TouchableOpacity onPress={() => setActiveTab("Rooms")}
          className={activeTab === "Rooms" ? "border-b-2 border-blue-900 pb-2" : "pb-2"}>
          <Text className={activeTab === "Rooms" ? "text-blue-900 font-bold" : "text-gray-800 font-medium"}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Transportation")}
          className={activeTab === "Transportation" ? "border-b-2 border-blue-900 pb-2" : "pb-2"}>
          <Text className={activeTab === "Transportation" ? "text-blue-900 font-bold" : "text-gray-800 font-medium"}>Transportation</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 mb-[100px]">
        {activeTab === "Rooms" && updatedRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
        {activeTab === "Transportation" && transportation.map((transport) => (
          <TransportationCard key={transport.id} transport={transport} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Rooms;
