// app/(auth)/sign-in.tsx

import { Link, router } from "expo-router";
import { useState, useContext } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { icons } from "@/constants";
import InputField from "@/components/InputField";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const SignIn = () => {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSignInPress = async () => {
    try {
      await login(form.email, form.password);
    } catch (error: any) {
      setErrorMessage("Email atau kata sandi salah. Silakan coba lagi.");
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
        <Text className="text-sky-800 text-3xl font-bold mb-1">Welcome!</Text>
        <Text className="text-sky-700 text-3xl font-bold mb-2">Login to SISI</Text>
        <Text className="text-sky-500 text-sm mb-8">Enter your details to access your account</Text>

        {/* Email Input */}
          <InputField
            label="Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
            keyboardType="email-address"
            labelStyle={{ color: '#0284c7', fontWeight: '500' }}
          />

        {/* Password Input */}
          <InputField
            label="Password"
            icon={icons.lock}
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            rightIcon={showPassword ? icons.eye : icons.eyecross}
            onRightIconPress={() => setShowPassword(!showPassword)}
            labelStyle={{ color: '#0284c7', fontWeight: '500' }}
          />
        
        <TouchableOpacity className="self-end mt-2 mb-2">
          <Text className="text-sm text-sky-600 font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        {/* Error Message */}
        {errorMessage !== "" && (
          <View className="bg-red-50 p-3 rounded-lg mb-4 flex-row items-center">
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-2">
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Sign Up & Log In Buttons */}
        <View className="flex-row mt-6">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            className="flex-1 bg-white border border-sky-200 py-3.5 rounded-full mr-2 flex-row justify-center items-center"
          >
            <Ionicons name="person-add-outline" size={18} color="#0ea5e9" style={{ marginRight: 8 }} />
            <Text className="text-center text-sky-600 font-medium">
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSignInPress}
            className="flex-1 bg-orange-400 py-3.5 rounded-full ml-2 flex-row justify-center items-center"
          >
            <Ionicons name="log-in-outline" size={18} color="white" style={{ marginRight: 8 }} />
            <Text className="text-center text-white font-medium">
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Optional link if you don't have an account */}
        <View className="mt-8 mb-12 items-center">
          <Text className="text-center text-sky-700">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity className="mt-2 py-2 px-6 bg-sky-100 rounded-full">
              <Text className="font-medium text-sky-700">Create an account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;