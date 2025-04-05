"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Transport = {
  transport_id: number;
  vehicle_name: string;
  driver_name: string;
  capacity: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Transport ID",
    accessor: "transport_id",
    className: "hidden md:table-cell",
  },
  {
    header: "Vehicle Name",
    accessor: "vehicle_name",
    className: "hidden md:table-cell",
  },
  {
    header: "Driver",
    accessor: "driver_name",
    className: "hidden md:table-cell",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const TransportManagePage = () => {
  const router = useRouter();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");

  // Create a custom axios instance to avoid conflicts 
  const createApiClient = () => {
    // Get token from localStorage
    const token = localStorage.getItem("adminToken");
    
    if (!token) {
      console.log("No admin token found, redirecting to login");
      router.push("/sign-in");
      setAuthStatus("No token found");
      return null;
    }
    
    setAuthStatus(`Token found (${token.substring(0, 10)}...)`);
    
    // Create axios instance with auth header
    const apiClient = axios.create({
      baseURL: "https://dbtch5xt-3001.asse.devtunnels.ms/api",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return apiClient;
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchTransports = async () => {
      setLoading(true);
      setError(null);
      
      const apiClient = createApiClient();
      if (!apiClient) return;
      
      try {
        console.log("Fetching transports...");
        // Debug request headers
        const debugHeaders = apiClient.defaults.headers;
        console.log("Request headers:", debugHeaders);
        
        const response = await apiClient.get("/transports");
        console.log("Transports fetched successfully:", response.data);
        setTransports(response.data);
        setAuthStatus("Authenticated and data loaded");
      } catch (error: any) {
        console.error("Error fetching transports:", error);
        
        // Check for unauthorized error
        if (error.response?.status === 401) {
          setAuthStatus("Authentication failed (401) - token may be invalid");
          localStorage.removeItem("adminToken");
          router.push("/sign-in");
          return;
        }
        
        setError(
          error.response?.data?.message || 
          "Unable to load transports. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransports();
  }, [router]);

  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPlaceholderImage = () => {
    return ""; // Replace with your actual placeholder image path
  };

  const renderRow = (item: Transport) => (
    <tr
      key={item.transport_id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="relative w-12 h-12 rounded-md overflow-hidden">
          <Image 
            src={item.image || getPlaceholderImage()} 
            alt={item.vehicle_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.vehicle_name}</h3>
          <p className="text-xs text-gray-500">
            Driver: {item.driver_name}
          </p>
          <p className="text-xs text-gray-500">
            Capacity: {item.capacity} persons
          </p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.transport_id}</td>
      <td className="hidden md:table-cell">{item.vehicle_name}</td>
      <td className="hidden md:table-cell">{item.driver_name}</td>
      <td className="hidden lg:table-cell">{item.capacity}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/manage/transports/${item.transport_id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <FormModal table="transport" type="edit" id={item.transport_id} />
          <FormModal table="transport" type="delete" id={item.transport_id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Auth status (for debugging - remove in production) */}
      <div className="bg-gray-50 p-2 mb-4 rounded text-xs text-gray-600 border flex justify-between">
        <div>
          <span>Auth status: {authStatus}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminInfo");
              router.push("/sign-in");
            }}
            className="text-red-500 hover:underline text-xs"
          >
            Sign out
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:underline text-xs"
          >
            Reload page
          </button>
        </div>
      </div>

      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Manage Transports</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormModal table="transport" type="create" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading transports...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mt-4">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && transports.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No transports found.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && transports.length > 0 && (
        <>
          <Table columns={columns} renderRow={renderRow} data={transports} />
          <Pagination />
        </>
      )}
    </div>
  );
};

export default TransportManagePage;