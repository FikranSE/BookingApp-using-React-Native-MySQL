import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { router } from "expo-router";
import BookInput from "@/components/BookInput";
import { Ionicons } from "@expo/vector-icons";

const ChangePassword = () => {
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

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("One special character (!@#$%^&*)");
    }
    return errors;
  };

  const handleSubmit = () => {
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
      newErrors.newPassword = `Password must contain: ${passwordErrors.join(", ")}`;
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
    console.log("Changing password...", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    
    // Here you would typically make an API call to change the password
  };

  // Password requirement item component
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View className="flex-row items-center space-x-2 mb-2">
      <View 
        className={`w-2 h-2 rounded-full ${
          met ? "bg-green-500" : "bg-gray-300"
        }`} 
      />
      <Text className={`text-sm ${met ? "text-green-500" : "text-gray-500"}`}>
        {text}
      </Text>
    </View>
  );

  // Check password requirements
  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*]/.test(newPassword),
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-6 mb-2">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <View className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="chevron-back" size={16} color="#0ea5e9" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-sky-700">Security</Text>
          <View className="flex-1" />
          <View className="w-2 h-2 rounded-full bg-orange-400 mx-0.5" />
          <View className="w-2 h-2 rounded-full bg-sky-400 mx-0.5" />
          <View className="w-2 h-2 rounded-full bg-orange-400 mx-0.5" />
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
              rightIcon={showCurrentPassword ? icons.eyecross : icons.eye}
              onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
              error={errors.currentPassword}
              required
              containerClassName="bg-white rounded-xl shadow-sm border-l-4 border-sky-300"
              labelClassName="text-sky-600 font-medium"
            />
            {errors.currentPassword ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.currentPassword}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View className="mb-1">
            <BookInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={!showNewPassword}
              rightIcon={showNewPassword ? icons.eyecross : icons.eye}
              onRightIconPress={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
              required
              containerClassName="bg-white rounded-xl shadow-sm border-l-4 border-sky-300"
              labelClassName="text-sky-600 font-medium"
            />
            {errors.newPassword ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          <View className="bg-white border border-sky-100 p-4 rounded-xl mb-5 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark-outline" size={16} color="#0ea5e9" />
              <Text className="text-sm font-medium text-sky-700 ml-2">
                Password Requirements
              </Text>
            </View>
            <View className="pl-1">
              <PasswordRequirement met={passwordChecks.length} text="At least 8 characters" />
              <PasswordRequirement met={passwordChecks.uppercase} text="One uppercase letter" />
              <PasswordRequirement met={passwordChecks.lowercase} text="One lowercase letter" />
              <PasswordRequirement met={passwordChecks.number} text="One number" />
              <PasswordRequirement met={passwordChecks.special} text="One special character (!@#$%^&*)" />
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <BookInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirmPassword}
              rightIcon={showConfirmPassword ? icons.eyecross : icons.eye}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
              required
              containerClassName="bg-white rounded-xl shadow-sm border-l-4 border-sky-300"
              labelClassName="text-sky-600 font-medium"
            />
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl mt-2 mb-8 flex-row justify-center items-center ${
              !currentPassword || !newPassword || !confirmPassword 
                ? "bg-gray-300" 
                : "bg-orange-400"
            }`}
            onPress={handleSubmit}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            <Ionicons 
              name="lock-closed-outline" 
              size={18} 
              color="white" 
              style={{ marginRight: 8 }} 
            />
            <Text className="text-white text-center font-medium">
              Update Password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;