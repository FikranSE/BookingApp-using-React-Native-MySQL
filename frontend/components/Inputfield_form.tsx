import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon,
  required = false,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <View className="flex-row items-center mb-2">
          <Text className="text-gray-700 font-medium">
            {label}
            {required && <Text className="text-red-500"> *</Text>}
          </Text>
        </View>
      )}
      
      <View className={`
        flex-row 
        items-center 
        bg-white 
        border 
        rounded-xl
        overflow-hidden
        ${error ? 'border-red-500' : 'border-gray-200'}
        ${multiline ? 'min-h-[100px] items-start' : 'h-12'}
      `}>
        {leftIcon && (
          <View className="pl-4 pr-2">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          className={`
            flex-1 
            px-4 
            text-gray-900
            ${multiline ? 'py-3 text-base' : 'h-full text-base'}
          `}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity 
            className="px-4"
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          >
            <Ionicons 
              name={secureTextEntry ? "eye-off" : "eye"} 
              size={20} 
              color="#64748B" 
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View className="flex-row items-center mt-1">
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text className="text-red-500 text-sm ml-1">{error}</Text>
        </View>
      )}
    </View>
  );
};

export default InputField;