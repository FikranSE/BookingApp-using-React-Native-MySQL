import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
  containerStyle?: any;
  style?: any;
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
  secureTextEntry: initialSecureTextEntry = false,
  containerStyle,
  style,
  ...props
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(initialSecureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            {label}
            {required && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
        </View>
      )}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        multiline ? styles.multilineInput : null,
        style
      ]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
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
          style={[
            styles.input,
            multiline ? styles.multilineInputText : null
          ]}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          {...props}
        />

        {initialSecureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIconContainer}
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    color: '#334155',
    fontWeight: '500',
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    height: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  multilineInput: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#1F2937',
    fontSize: 16,
  },
  multilineInputText: {
    paddingTop: 0,
    textAlignVertical: 'top',
  },
  eyeIconContainer: {
    paddingHorizontal: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 4,
  }
});

export default InputField;