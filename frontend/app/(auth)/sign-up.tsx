// app/(auth)/sign-up.tsx

import { Link } from "expo-router";
import { useState, useContext } from "react";
import { Alert, ScrollView, Text, View, TouchableOpacity } from "react-native";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth";
import InputField from "@/components/InputField";
import ReactNativeModal from "react-native-modal";

import { AuthContext } from "../context/AuthContext";

const SignUp = () => {
  const { register } = useContext(AuthContext);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    try {
      await register(form.name, form.email, form.password, form.phone);
    } catch (err: any) {
      Alert.alert("Registrasi Gagal", err.message || "Terjadi kesalahan saat registrasi");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <View className="mb-8">
          <Text className="text-[#003580] text-3xl font-bold mb-2">Sign Up</Text>
          <Text className="text-gray-600 text-lg">Create an account and start booking!</Text>
        </View>

        <View className="space-y-4">
          <InputField
            label="Full Name"
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Phone Number"
            value={form.phone}
            onChangeText={(value) => setForm({ ...form, phone: value })}
          />
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <TouchableOpacity
            onPress={onSignUpPress}
            className="bg-[#003580] rounded-full py-3 mt-6"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Sign up
            </Text>
          </TouchableOpacity>

          <OAuth />

          <View className="mt-6 mb-8">
            <Text className="text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/(auth)/sign-in" className="text-[#003580] font-semibold">
                Sign in
              </Link>
            </Text>
          </View>
        </View>

        <ReactNativeModal isVisible={verification.state === "pending"}>
          <View className="bg-white px-7 py-9 rounded-2xl">
            <Text className="font-bold text-2xl mb-2">Verification</Text>
            <Text className="mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label="Code"
              placeholder="Enter verification code"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) => setVerification({ ...verification, code })}
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Verifikasi", "Fungsi verifikasi belum diimplementasikan.");
              }}
              className="bg-[#006CE4] rounded-full py-3 mt-5"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Verify Email
              </Text>
            </TouchableOpacity>
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
