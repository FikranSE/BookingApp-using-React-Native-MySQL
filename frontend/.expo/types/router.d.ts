/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(api)/auth/authApi` | `/(api)/users/userApi` | `/(auth)` | `/(auth)/sign-in` | `/(auth)/sign-up` | `/(auth)/welcome` | `/(root)` | `/(root)/(tabs)` | `/(root)/(tabs)/explore` | `/(root)/(tabs)/home` | `/(root)/(tabs)/my-booking` | `/(root)/(tabs)/opsi-booking` | `/(root)/(tabs)/profile` | `/(root)/booking-room` | `/(root)/booking-transport` | `/(root)/change-password` | `/(root)/detail` | `/(root)/detail-bookingRoom` | `/(root)/detail-bookingTransport` | `/(root)/explore` | `/(root)/faq` | `/(root)/home` | `/(root)/my-booking` | `/(root)/notifikasi` | `/(root)/opsi-booking` | `/(root)/profile` | `/(root)/reschedule-booking` | `/(tabs)` | `/(tabs)/explore` | `/(tabs)/home` | `/(tabs)/my-booking` | `/(tabs)/opsi-booking` | `/(tabs)/profile` | `/_sitemap` | `/auth/authApi` | `/booking-room` | `/booking-transport` | `/change-password` | `/context/AuthContext` | `/detail` | `/detail-bookingRoom` | `/detail-bookingTransport` | `/explore` | `/faq` | `/home` | `/my-booking` | `/notifikasi` | `/opsi-booking` | `/profile` | `/reschedule-booking` | `/sign-in` | `/sign-up` | `/users/userApi` | `/welcome`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
