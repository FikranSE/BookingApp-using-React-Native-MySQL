import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import {router} from "expo-router";
import  BookInput  from "@/components/BookInput";

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
    <View className="flex-row items-center space-x-2 mb-1">
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
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="bg-blue-900 px-4 pt-4 pb-8 rounded-b-[30px]">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-1 p-2 -ml-2"
          >
            <Image 
              source={icons.backArrow} 
              className="w-6 h-6"
              style={{ tintColor: '#FFFFFF' }}
            />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">Change Password</Text>
            <Text className="text-blue-200 text-sm">
              Update your password to keep your account secure
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 -mt-4">
        <View className="bg-white rounded-xl shadow-sm mb-4 p-4">
          {/* Current Password */}
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
          />

          {/* New Password */}
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
          />

          {/* Password Requirements */}
          <View className="bg-gray-50 p-3 rounded-lg mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              Password Requirements:
            </Text>
            <PasswordRequirement met={passwordChecks.length} text="At least 8 characters" />
            <PasswordRequirement met={passwordChecks.uppercase} text="One uppercase letter" />
            <PasswordRequirement met={passwordChecks.lowercase} text="One lowercase letter" />
            <PasswordRequirement met={passwordChecks.number} text="One number" />
            <PasswordRequirement met={passwordChecks.special} text="One special character (!@#$%^&*)" />
          </View>

          {/* Confirm Password */}
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
          />

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-blue-900 py-4 rounded-xl mt-6 ${
              !currentPassword || !newPassword || !confirmPassword ? "opacity-50" : ""
            }`}
            onPress={handleSubmit}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            <Text className="text-white text-center font-bold">
              Change Password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;