// app/(auth)/sign-in.tsx

import { Link, router } from "expo-router";
import { useState, useContext } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { icons } from "@/constants";
import InputField from "@/components/InputField";
import { AuthContext } from "../context/AuthContext";

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
    <ScrollView className="flex-1 bg-white">
      {/* Dekorasi lingkaran di bagian atas */}
      <View className="relative h-40 w-full mb-8">
        <View
          className="absolute bg-blue-900 w-[180px] h-[180px] rounded-full left-[-60px] top-[-60px]"
          style={{ opacity: 0.9 }}
        />
        <View
          className="absolute bg-blue-900 w-[60px] h-[60px] rounded-full left-24 top-[-20px]"
          style={{ opacity: 0.9 }}
        />
        <View
          className="absolute bg-blue-900 w-[40px] h-[40px] rounded-full right-8 top-10"
          style={{ opacity: 0.9 }}
        />
      </View>

      <View className="px-6">
        {/* Judul */}
        <Text className="text-blue-900 text-3xl font-bold mb-1">Welcome!</Text>
        <Text className="text-blue-900 text-3xl font-bold mb-8">Login</Text>

        {/* Input Email */}
        <InputField
          label="Email"
          icon={icons.email} // Pastikan Anda memiliki ikon user
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
        />

        {/* Input Password */}
        <View className="mb-2">
          <InputField
            label="Password"
            icon={icons.lock} // Pastikan Anda memiliki ikon lock
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            rightIcon={showPassword ? icons.eye : icons.eyecross} // Pastikan Anda memiliki ikon eye dan eyecross
            onRightIconPress={() => setShowPassword(!showPassword)}
           
          />
          <TouchableOpacity className="self-end mt-2">
            <Text className="text-sm text-blue-900">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {errorMessage !== "" && (
          <Text className="text-red-500 text-sm text-center mb-4">
            {errorMessage}
          </Text>
        )}

        {/* Tombol Sign Up & Log In */}
        <View className="flex-row mt-6">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/sign-up")}
            className="flex-1 bg-blue-900/10 py-3 rounded-full mr-2"
          >
            <Text className="text-center text-blue-900 font-semibold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSignInPress}
            className="flex-1 bg-blue-900 py-3 rounded-full ml-2"
          >
            <Text className="text-center text-white font-semibold text-lg">
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Link jika belum punya akun (opsional) */}
        <View className="mt-8 mb-10">
          <Text className="text-center text-blue-900">
            Don't have an account?{" "}
            <Link href="/(auth)/sign-up" className="font-semibold">
              Sign up
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
