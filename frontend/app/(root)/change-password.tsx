import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import { tokenCache } from "@/lib/auth";
import axios from "axios";
import BookInput from "@/components/BookInput";
import { icons } from "@/constants";
import CustomAlert from "@/components/CustomAlert"; // Import the CustomAlert component

const ChangePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState("success"); // success, error, or info
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("One special character (!@#$%^&*)");
    return errors;
  };

  const fetchAuthToken = async () => {
    return await tokenCache.getToken(AUTH_TOKEN_KEY);
  };

  const handleSubmit = async () => {
    // Reset errors
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    let hasError = false;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Validate current password
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
      hasError = true;
    }

    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(", ");
      hasError = true;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    setLoading(true);
    try {
      const authToken = await fetchAuthToken();

      if (!authToken) {
        Alert.alert("Error", "Not authenticated");
        router.push("/(auth)/sign-in");
        return;
      }

      // API call to change password
      const response = await axios.post(
        "https://bookingsisi.maturino.my.id/api/auth/change-password/",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Success response handling
      setLoading(false);
      setAlertType("success");
      setAlertTitle("Password Changed Successfully");
      setAlertMessage("Your password has been updated.");
      setAlertVisible(true);
      setTimeout(() => {
        router.push("/profile"); // Navigate to the profile page
      }, 3000);
    } catch (error) {
      setLoading(false);
      setAlertType("error");
      setAlertTitle("Error");
      setAlertMessage("Failed to change password");
      setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-6 mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 -ml-2">
            <View className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="chevron-back" size={16} color="#0ea5e9" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-sky-700">Security</Text>
        </View>
      </View>

      {/* Title */}
      <View className="px-6 mb-4">
        <Text className="text-2xl font-bold text-sky-800">Change Password</Text>
        <Text className="text-sky-500 mt-1">Update your password to keep your account secure</Text>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          {/* Current Password */}
          <View className="mb-5">
            <BookInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry={!showCurrentPassword}
              rightIcon={showCurrentPassword ? icons.eye : icons.eyecross}
              onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
              error={errors.currentPassword}
              required
              containerClassName="bg-white rounded-xl shadow-sm border-l-4 border-sky-300"
              labelClassName="text-sky-600 font-medium"
            />
            {errors.currentPassword && (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.currentPassword}</Text>
            )}
          </View>

          {/* New Password */}
          <View className="mb-1">
            <BookInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={!showNewPassword}
              rightIcon={showNewPassword ? icons.eye : icons.eyecross}
              onRightIconPress={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
              required
              containerClassName="bg-white rounded-xl shadow-sm border-l-4 border-sky-300"
              labelClassName="text-sky-600 font-medium"
            />
            {errors.newPassword && (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.newPassword}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <BookInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirmPassword}
              rightIcon={showConfirmPassword ? icons.eye : icons.eyecross}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
              required
              containerClassName="bg-white rounded-xl shadow-sm border-l-4 border-sky-300"
              labelClassName="text-sky-600 font-medium"
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl mt-2 mb-8 flex-row justify-center items-center ${
              !currentPassword || !newPassword || !confirmPassword ? "bg-gray-300" : "bg-orange-400"
            }`}
            onPress={handleSubmit}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={18} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white text-center font-medium">Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ChangePassword;
