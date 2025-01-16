// app/(auth)/sign-in.tsx

import { Link } from "expo-router";
import { useState, useContext } from "react";
import { Image, ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import OAuth from "@/components/OAuth";
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
      <View className="flex-1 px-6 pt-10">
        <View className="mb-8">
          <Text className="text-[#003580] text-3xl font-bold mb-2">Sign In</Text>
          <Text className="text-gray-600 text-lg">Enjoy a perfect meeting room!</Text>
        </View>

        <View className="space-y-4">
          <View>
            <InputField
              value={form.email}
              label="Email"
              onChangeText={(value) => setForm({ ...form, email: value })}
            />
          </View>

          <View>
            <View className="relative">
              <InputField
                value={form.password}
                label="Password"
                onChangeText={(value) => setForm({ ...form, password: value })}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Image 
                  source={showPassword ? icons.eye : icons.eyecross}
                  className="w-6 h-6 mt-3"
                  tintColor="#003580"
                /> 
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="self-end mt-2">
              <Text className="text-gray-400">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {errorMessage !== "" && (
            <Text className="text-red-500 text-sm text-center">{errorMessage}</Text>
          )}

          <TouchableOpacity
            onPress={onSignInPress}
            className="bg-[#003580] rounded-full py-3 mt-4"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Log in
            </Text>
          </TouchableOpacity>

          <OAuth />

          <View className="mt-6 mb-8">
            <Text className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link href="/(auth)/sign-up" className="text-[#003580] font-semibold">
                Sign up
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
