import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { router } from "expo-router";

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is SISI Booking System?",
      answer: "SISI Booking System is a comprehensive Mobile-based Meeting Room and Transportation Reservation Information System developed for PT Sinergi Informatika Semen Indonesia (SISI). It offers flexible booking methods, data management, and enhanced user accessibility for facility reservations."
    },
    {
      question: "What booking methods are available?",
      answer: "We offer three booking methods:\n\n1. Regular Booking: Standard reservations through mobile app or website\n2. Pre-Scheduled Booking: For long-term planning needs\n3. Quick Booking: Fast reservations based on booking history"
    },
    {
      question: "How does the notification system work?",
      answer: "The system provides real-time notifications through:\n\n- Firebase Cloud Messaging for instant updates\n- Email notifications\n- Google Calendar integration for schedule reminders\n\nBoth users and admins receive transparent updates about booking statuses."
    },
    {
      question: "What features are available for administrators?",
      answer: "Administrators have access to:\n\n- Analytics dashboard\n- Booking status filtration\n- Flexible data export to Excel\n- Real-time monitoring capabilities\n- Comprehensive reporting tools"
    },
    {
      question: "How is the system integrated with third-party services?",
      answer: "The system integrates with Google Calendar for schedule synchronization and reminders. This integration enables real-time monitoring and seamless schedule management across platforms."
    },
    {
      question: "What technologies are used in the system?",
      answer: "The system is built using:\n\n- React Native for mobile application\n- Laravel and Tailwind CSS for admin website\n- MySQL for database management\n- Firebase Cloud Messaging for notifications"
    }
  ];

  const FAQItem = ({ question, answer, index, isExpanded, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden"
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium text-gray-800 flex-1 mr-2">
            {question}
          </Text>
          <Image 
            source={icons.chevron}
            className={`w-3 h-3 transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            style={{ tintColor: '#1e3a8a' }}
          />
        </View>
        {isExpanded && (
          <Text className="text-gray-600 mt-3 leading-6">
            {answer}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="bg-blue-900 px-4 pt-4 pb-4 rounded-b-[30px] mb-5">
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
            <Text className="text-xl font-bold text-white">FAQ About SISI Booking System</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 -mt-4">
        <View className="py-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              index={index}
              isExpanded={expandedIndex === index}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQ;