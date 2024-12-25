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
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { InputFieldProps } from "@/types/type";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  iconStyle,
  value,
  onChangeText,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 22,
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
      outputRange: ['#003580', '#003580'],
    }),
    backgroundColor: 'white',
    paddingHorizontal: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <View className={`relative ${containerStyle}`}>
            <Animated.Text style={labelStyle}>
              {label}
            </Animated.Text>

            <View className="relative">
              <View
                className={`
                  border rounded-full overflow-hidden
                  ${isFocused ? 'border-[1.5px]' : 'border-[1px]'}
                  ${isFocused ? 'border-[#003580]' : 'border-blue-900'}
                `}
              >
                {isFocused && (
                  <LinearGradient
                    colors={['#003580', '#E48900FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute inset-0"
                  />
                )}
                <View className="bg-white m-[1px] rounded-full">
                  <View className="flex-row items-center">
                    {icon && (
                      <Image source={icon} className={`w-4 h-4 ml-4 ${iconStyle}`} />
                    )}
                    <TextInput
                      className={`
                        px-4 py-3 font-JakartaSemiBold text-[15px] flex-1
                        ${inputStyle}
                        text-left text-blue-900
                      `}
                      secureTextEntry={secureTextEntry}
                      value={value}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChangeText={onChangeText} // Ensure this is handled correctly
                      {...props}
                    />
                  </View>
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
