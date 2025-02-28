// app/(auth)/sign-up.tsx

import { Link, router } from "expo-router";
import { useState, useContext } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput
} from "react-native";
import ReactNativeModal from "react-native-modal";
import { icons } from "@/constants";
import InputField from "@/components/InputField";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const SignUp = () => {
  const { register } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  
  // Tambahkan state untuk menangani verifikasi jika diperlukan
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const onSignUpPress = async () => {
    try {
      await register(form.name, form.email, form.password, form.phone);
      // Anda bisa menambahkan navigasi atau modal sukses di sini
    } catch (err: any) {
      Alert.alert("Registrasi Gagal", err.message || "Terjadi kesalahan saat registrasi");
    }
  };

  return (
    <ScrollView className="flex-1 bg-sky-50">
      {/* Decorative elements at the top */}
      <View className="relative h-40 w-full mb-8">
        <View
          className="absolute bg-sky-500 w-[180px] h-[180px] rounded-full left-[-60px] top-[-60px]"
          style={{ opacity: 0.9 }}
        />
        <View
          className="absolute bg-orange-400 w-[60px] h-[60px] rounded-full left-24 top-[-20px]"
          style={{ opacity: 0.9 }}
        />
        <View
          className="absolute bg-sky-500 w-[40px] h-[40px] rounded-full right-8 top-10"
          style={{ opacity: 0.9 }}
        />
      </View>

      <View className="px-6">
        {/* Title */}
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-orange-400 mr-1" />
          <View className="w-2 h-2 rounded-full bg-sky-400 mr-1" />
          <View className="w-2 h-2 rounded-full bg-orange-400 mr-1" />
        </View>
        <Text className="text-sky-800 text-3xl font-bold mb-1">Hello!</Text>
        <Text className="text-sky-700 text-3xl font-bold mb-2">Create Account</Text>
        <Text className="text-sky-500 text-sm mb-8">Fill in your details to get started</Text>

        {/* Full Name */}
        <InputField
          label="Full Name"
          icon={icons.user} 
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />

        {/* Phone Number */}
        <InputField
          label="Phone Number"
          icon={icons.telephone}
          value={form.phone}
          onChangeText={(value) => setForm({ ...form, phone: value })}
          keyboardType="phone-pad"
        />

        {/* Email */}
        <InputField
          label="Email"
          icon={icons.email}
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
        />

        {/* Password */}
        <InputField
          label="Password"
          icon={icons.lock}
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
          rightIcon={showPassword ? icons.eye : icons.eyecross}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        {/* Sign Up & Log In Buttons */}
        <View className="flex-row mt-6">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-in")}
            className="flex-1 bg-white border border-sky-200 py-3.5 rounded-full mr-2 flex-row justify-center items-center"
          >
            <Ionicons name="log-in-outline" size={18} color="#0ea5e9" style={{ marginRight: 8 }} />
            <Text className="text-center text-sky-600 font-medium">
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSignUpPress}
            className="flex-1 bg-orange-400 py-3.5 rounded-full ml-2 flex-row justify-center items-center"
          >
            <Ionicons name="person-add-outline" size={18} color="white" style={{ marginRight: 8 }} />
            <Text className="text-center text-white font-medium">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Optional link if you already have an account */}
        <View className="mt-8 mb-12 items-center">
          <Text className="text-center text-sky-700">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity className="mt-2 py-2 px-6 bg-sky-100 rounded-full">
              <Text className="font-medium text-sky-700">Log in here</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Modal Verifikasi (opsional) */}
      <ReactNativeModal isVisible={verification.state === "pending"}>
        <View className="bg-white px-7 py-9 rounded-2xl">
          <Text className="font-bold text-2xl mb-2">Verification</Text>
          <Text className="mb-5">
            We've sent a verification code to {form.email}.
          </Text>
          <View className="border-b border-gray-300 mb-4">
            <TextInput
              placeholder="Enter verification code"
              keyboardType="numeric"
              value={verification.code}
              onChangeText={(code) => setVerification({ ...verification, code })}
              className="text-base text-sky-700"
            />
          </View>
          {verification.error && (
            <Text className="text-red-500 text-sm mb-3">
              {verification.error}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Verifikasi",
                "Fungsi verifikasi belum diimplementasikan."
              );
            }}
            className="bg-orange-400 rounded-full py-3 mt-2"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Verify Email
            </Text>
          </TouchableOpacity>
        </View>
      </ReactNativeModal>
    </ScrollView>
  );
};

export default SignUp;