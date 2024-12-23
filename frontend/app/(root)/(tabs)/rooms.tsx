import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/constants";

interface Room {
  id: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  micCount: number;
  projectorCount: number;
  image: any;
  floor: number;
}

const Rooms = () => {
  const rooms: Room[] = [
    {
      id: '1',
      name: 'Small meeting room',
      location: 'Main office',
      address: '44 Cedar Avenue, 3 floor',
      capacity: 4,
      micCount: 1,
      projectorCount: 0,
      image: require('@/assets/images/small-room.jpg'),
      floor: 3
    },
    {
      id: '2',
      name: 'Middle meeting room',
      location: 'Main office',
      address: '44 Cedar Avenue, 4 floor',
      capacity: 8,
      micCount: 2,
      projectorCount: 0,
      image: require('@/assets/images/middle-room.jpg'),
      floor: 4
    },
    {
      id: '3',
      name: 'Big meeting room',
      location: 'Main office',
      address: '44 Cedar Avenue, 2 floor',
      capacity: 12,
      micCount: 3,
      projectorCount: 1,
      image: require('@/assets/images/big-room.jpg'),
      floor: 2
    },
  ];

  const RoomCard = ({ room }: { room: Room }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
      <Image 
        source={room.image}
        className="w-full h-40 rounded-lg mb-3"
        resizeMode="cover"
      />
      <Text className="text-lg font-semibold text-gray-800">{room.name}</Text>
      <View className="flex-row items-center mt-1">
        <Image
          source={icons.location}
          className="w-4 h-4 mr-1"
          tintColor="#003580"
        />
        <Text className="text-blue-900 font-medium">{room.location}</Text>
      </View>
      <Text className="text-slate-500 text-sm ml-5">{room.address}</Text>
      
      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center space-x-4">
          {/* Capacity */}
          <View className="flex-row items-center">
            <Image
              source={icons.member}
              className="w-4 h-4 mr-1"
              tintColor="#003580"
            />
            <Text className="text-blue-900 font-medium">{room.capacity}</Text>
          </View>
          
          {/* Microphones */}
          {room.micCount > 0 && (
            <View className="flex-row items-center">
              <Image
                source={icons.mic}
                className="w-4 h-4 mr-1"
                tintColor="#003580"
              />
              <Text className="text-blue-900 font-medium">{room.micCount}</Text>
            </View>
          )}
          
          {/* Projectors */}
          {room.projectorCount > 0 && (
            <View className="flex-row items-center">
              <Image
                source={icons.projector}
                className="w-4 h-4 mr-1"
                tintColor="#003580"
              />
              <Text className="text-blue-900 font-medium">{room.projectorCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity className="bg-blue-900 px-6 py-2 rounded-full">
          <Text className="text-white font-medium">Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center bg-white shadow-sm">
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-blue-50">
          <Image
            source={icons.menu}
            className="w-5 h-5"
            tintColor="#003580"
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold">
          <Text className="text-blue-900">M</Text>
          <Text className="text-gray-800">Book</Text>
        </Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-blue-50">
          <Image
            source={icons.bell}
            className="w-5 h-5"
            tintColor="#003580"
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-gray-800">Rooms</Text>
      </View>

      {/* Room List */}
      <ScrollView className="flex-1 px-5">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center py-4 bg-white border-t border-gray-100 shadow-sm">
        <TouchableOpacity className="items-center">
          <Image
            source={icons.calendar}
            className="w-6 h-6 mb-1"
            tintColor="#94a3b8"
          />
          <Text className="text-slate-400 text-xs">Meetings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Image
            source={icons.door}
            className="w-6 h-6 mb-1"
            tintColor="#003580"
          />
          <Text className="text-blue-900 text-xs font-medium">Rooms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center -mt-5">
          <View className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full items-center justify-center shadow-lg">
            <Text className="text-white text-3xl">+</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Image
            source={icons.member}
            className="w-6 h-6 mb-1"
            tintColor="#94a3b8"
          />
          <Text className="text-slate-400 text-xs">Members</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <Image
            source={icons.settings}
            className="w-6 h-6 mb-1"
            tintColor="#94a3b8"
          />
          <Text className="text-slate-400 text-xs">Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Rooms;