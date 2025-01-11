/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(api)/users/api` | `/(auth)` | `/(auth)/sign-in` | `/(auth)/sign-up` | `/(auth)/welcome` | `/(root)` | `/(root)/(tabs)` | `/(root)/(tabs)/addBooking` | `/(root)/(tabs)/explore` | `/(root)/(tabs)/home` | `/(root)/(tabs)/profile` | `/(root)/(tabs)/schedules` | `/(root)/addBooking` | `/(root)/explore` | `/(root)/home` | `/(root)/my-booking` | `/(root)/notifikasi` | `/(root)/profile` | `/(root)/schedules` | `/(tabs)` | `/(tabs)/addBooking` | `/(tabs)/explore` | `/(tabs)/home` | `/(tabs)/profile` | `/(tabs)/schedules` | `/_sitemap` | `/addBooking` | `/explore` | `/home` | `/my-booking` | `/notifikasi` | `/profile` | `/schedules` | `/sign-in` | `/sign-up` | `/users/api` | `/welcome`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
