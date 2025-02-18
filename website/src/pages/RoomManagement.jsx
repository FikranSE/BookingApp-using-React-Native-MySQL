import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

// Basic fetcher with enhanced error logging
const fetcher = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors', // Enable CORS
      credentials: 'include', // Include credentials if needed
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.url = url;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (!window.navigator.onLine) {
      throw new Error('Network offline. Please check your internet connection.');
    }

    // Enhanced error logging
    console.error(`Error fetching from URL: ${error.url}`);
    console.error('Error details:', error);
    throw error;
  }
};

const RoomManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Pastikan URL ini sesuai dengan backend Anda
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/rooms';

  const { data: rooms, error, isValidating, mutate } = useSWR(API_URL, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    errorRetryInterval: 5000,
    errorRetryCount: 3,
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRooms = rooms?.filter((room) =>
    room.room_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tampilkan error dengan URL yang sedang dicoba
  if (error) {
    return (
      <div className="m-4 p-4 border border-red-500 bg-red-50 rounded-lg">
        <p className="text-red-700 mb-2">Connection Error</p>
        <p className="text-sm text-red-600 mb-4">
          Attempted to connect to: {API_URL}
        </p>
        <p className="text-sm text-red-600 mb-4">
          Error details: {error.message}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => mutate()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (isValidating) {
    return <div className="p-4">Loading rooms...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search for rooms"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus size={18} /> Add Room
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facilities</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms && filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <tr key={room.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{room.room_name}</td>
                  <td className="px-6 py-4">{room.room_type}</td>
                  <td className="px-6 py-4">{room.capacity}</td>
                  <td className="px-6 py-4">{room.facilities}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit2 size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No rooms found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManagement;
