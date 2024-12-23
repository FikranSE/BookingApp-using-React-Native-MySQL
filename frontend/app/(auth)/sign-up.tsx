import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth";
import InputField from "@/components/InputField";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
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
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.longMessage || "Something went wrong");
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err) {
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || "Something went wrong",
        state: "failed",
      });
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
              <Link href="/sign-in" className="text-[#003580] font-semibold">
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
              onPress={onPressVerify}
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
