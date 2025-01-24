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
    left: 45,
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
      outputRange: ['#A1A3A6FF', '#003580'],
    }),
    backgroundColor: 'white',
    paddingHorizontal: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <View className={`relative ${containerStyle || ""}`}>
            {/* Label mengambang */}
            <Animated.Text style={labelStyle}>
              {label}
            </Animated.Text>

            <View className="relative">
              <View
                className={`
                  border rounded-full overflow-hidden
                  ${(isFocused || hasValue) ? 'border-[1.5px] border-[#003580]' : 'border-[1px] border-gray-300'}
                `}
              >
                {/* Garis gradient ketika fokus */}
                {isFocused && (
                  <LinearGradient
                    colors={['#003580', '#E48900FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute inset-0"
                  />
                )}

                {/* Bagian dalam input */}
                <View className="bg-white m-[1px] rounded-full flex-row items-center">
                  {icon && (
                    <Image source={icon} tintColor="#A7A7A7FF" className={`w-4 h-4 ml-4 ${iconStyle || ''}`} />
                  )}
                  <TextInput
                    className={`
                      px-4 py-3 font-JakartaSemiBold text-[15px] flex-1
                      text-left text-blue-900
                      ${inputStyle || ''}
                    `}
                    secureTextEntry={secureTextEntry}
                    value={value || ''}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={onChangeText}
                    editable={editable}
                    onPress={onPress}
                    {...props}
                  />
                  {rightIcon && onRightIconPress && (
                    <TouchableOpacity onPress={onRightIconPress} className="mr-4">
                      <Image source={rightIcon} tintColor="#1F1FAAFF" className={`w-4 h-4 ${iconStyle || ''}`} />
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
