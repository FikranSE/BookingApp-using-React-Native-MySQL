/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(api)/auth/authApi` | `/(api)/users/userApi` | `/(auth)` | `/(auth)/sign-in` | `/(auth)/sign-up` | `/(auth)/welcome` | `/(root)` | `/(root)/(tabs)` | `/(root)/(tabs)/addBooking` | `/(root)/(tabs)/explore` | `/(root)/(tabs)/home` | `/(root)/(tabs)/profile` | `/(root)/(tabs)/schedules` | `/(root)/addBooking` | `/(root)/change-password` | `/(root)/detail` | `/(root)/detail-booking` | `/(root)/edit-booking` | `/(root)/explore` | `/(root)/faq` | `/(root)/home` | `/(root)/my-booking` | `/(root)/notifikasi` | `/(root)/profile` | `/(root)/schedules` | `/(tabs)` | `/(tabs)/addBooking` | `/(tabs)/explore` | `/(tabs)/home` | `/(tabs)/profile` | `/(tabs)/schedules` | `/_sitemap` | `/addBooking` | `/auth/authApi` | `/change-password` | `/context/AuthContext` | `/detail` | `/detail-booking` | `/edit-booking` | `/explore` | `/faq` | `/home` | `/my-booking` | `/notifikasi` | `/profile` | `/schedules` | `/sign-in` | `/sign-up` | `/users/userApi` | `/welcome`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
