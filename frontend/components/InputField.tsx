import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

interface InputFieldProps {
  label: string;               // Label untuk floating
  icon?: any;                  // Icon di dalam input (opsional, kiri)
  rightIcon?: any;             // Icon di sebelah kanan input (opsional)
  onRightIconPress?: () => void; // Event saat ikon kanan ditekan
  secureTextEntry?: boolean;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  value?: string | null;
  onChangeText?: (text: string) => void;
  editable?: boolean;          // Agar bisa read-only 
  onPress?: () => void;        // Event saat ditekan (untuk date/time picker)
  [key: string]: any;          // Sisa props
}

const InputField = ({
  label,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  iconStyle,
  value,
  onChangeText,
  editable = true,     // Jika false → jadi tombol
  onPress,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Cek apakah input memiliki nilai
  const hasValue = !!value?.trim();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || hasValue) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, hasValue, animatedValue]);

  // Gaya label mengambang
  const labelStyle = {
    position: 'absolute',
    left: icon ? 45 : 16,  // Adjusted to align properly with or without icon
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#94a3b8', '#f97316'],
    }),
    backgroundColor: '#f0f9ff', // sky-50 background for floating label
    paddingHorizontal: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 6],
    }),
    fontWeight: '500',
    zIndex: 1,
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-3 w-full">
          <View className={`relative ${containerStyle || ""}`}>
            {/* Label mengambang */}
            <Animated.Text style={labelStyle}>
              {label}
            </Animated.Text>

            <View className="relative">
              <View
                className={`
                  border rounded-xl overflow-hidden shadow-sm
                  ${(isFocused || hasValue) ? 'border-[1.5px] border-orange-400' : 'border-[1px] border-sky-100'}
                `}
              >
                {/* Garis gradient ketika fokus */}
                {isFocused && (
                  <LinearGradient
                    colors={['#f97316', '#0ea5e9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute inset-0 opacity-10"
                  />
                )}

                {/* Bagian dalam input */}
                <View className="bg-sky-50 m-[0.5px] rounded-xl flex-row items-center">
                  {icon && (
                    <View className="ml-4 flex items-center justify-center">
                      <Image 
                        source={icon} 
                        tintColor={isFocused ? "#f97316" : "#94a3b8"} 
                        className={`w-5 h-5 ${iconStyle || ''}`} 
                      />
                    </View>
                  )}
                  <TextInput
                    className={`
                      px-4 py-4 font-medium text-[16px] flex-1
                      text-left text-gray-700
                      ${inputStyle || ''}
                    `}
                    secureTextEntry={secureTextEntry}
                    value={value || ''}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={onChangeText}
                    editable={editable}
                    onPress={onPress}
                    placeholderTextColor="#94a3b8"
                    {...props}
                  />
                  {rightIcon && onRightIconPress && (
                    <TouchableOpacity 
                      onPress={onRightIconPress} 
                      className="mr-4 bg-white p-2 rounded-full"
                    >
                      <Image 
                        source={rightIcon} 
                        tintColor="#f97316" 
                        className={`w-5 h-5 ${iconStyle || ''}`} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;