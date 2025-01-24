// app/(auth)/sign-up.tsx

import { Link } from "expo-router";
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
        <Text className="text-blue-900 text-3xl font-bold mb-8">Sign up</Text>

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
          icon={icons.telephone} // Pastikan Anda memiliki ikon phone
          value={form.phone}
          onChangeText={(value) => setForm({ ...form, phone: value })}
          keyboardType="phone-pad"
        />

        {/* Email */}
        <InputField
          label="Email"
          icon={icons.email} // Pastikan Anda memiliki ikon email
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
        />

        {/* Password */}
        <View className="mb-6">
          <InputField
            label="Password"
            icon={icons.lock} // Pastikan Anda memiliki ikon lock
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            rightIcon={showPassword ? icons.eye : icons.eyecross} // Pastikan Anda memiliki ikon eye dan eyecross
            onRightIconPress={() => setShowPassword(!showPassword)}
      
          />
        </View>

        {/* Tombol Sign Up */}
        <TouchableOpacity
          onPress={onSignUpPress}
          className="bg-blue-900 rounded-full py-3"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Sign up
          </Text>
        </TouchableOpacity>

        {/* Link jika sudah punya akun */}
        <View className="mt-6 mb-10">
          <Text className="text-center text-blue-900">
            I am already a member?{" "}
            <Link href="/(auth)/sign-in" className="font-semibold">
              Sign in
            </Link>
          </Text>
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
              className="text-base text-blue-900"
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
            className="bg-blue-900 rounded-full py-3 mt-2"
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
