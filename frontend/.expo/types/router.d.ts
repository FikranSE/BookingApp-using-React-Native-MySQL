/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(api)/users/api` | `/(auth)` | `/(auth)/sign-in` | `/(auth)/sign-up` | `/(auth)/welcome` | `/(root)` | `/(root)/(tabs)` | `/(root)/(tabs)/addBooking` | `/(root)/(tabs)/chat` | `/(root)/(tabs)/explore` | `/(root)/(tabs)/home` | `/(root)/(tabs)/profile` | `/(root)/addBooking` | `/(root)/beli-token` | `/(root)/chat` | `/(root)/detail-tagihan` | `/(root)/detail-transaksi` | `/(root)/explore` | `/(root)/home` | `/(root)/notifikasi` | `/(root)/profile` | `/(root)/tagihan-page` | `/(tabs)` | `/(tabs)/addBooking` | `/(tabs)/chat` | `/(tabs)/explore` | `/(tabs)/home` | `/(tabs)/profile` | `/_sitemap` | `/addBooking` | `/beli-token` | `/chat` | `/detail-tagihan` | `/detail-transaksi` | `/explore` | `/home` | `/notifikasi` | `/profile` | `/sign-in` | `/sign-up` | `/tagihan-page` | `/users/api` | `/welcome`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
