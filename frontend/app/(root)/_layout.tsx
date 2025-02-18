//frontend/app/(auth)/sign-in

import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifikasi" options={{headerShown: false}}/>
      <Stack.Screen name="my-booking" options={{headerShown: false}}/>
      <Stack.Screen name="change-password" options={{headerShown: false}}/>
      <Stack.Screen name="faq" options={{headerShown: false}}/>
      <Stack.Screen name="detail-booking" options={{headerShown: false}}/>
      <Stack.Screen name="detail" options={{headerShown: false}}/>
      <Stack.Screen name="edit-booking" options={{headerShown: false}}/>
    </Stack>
  );
};

export default Layout;
