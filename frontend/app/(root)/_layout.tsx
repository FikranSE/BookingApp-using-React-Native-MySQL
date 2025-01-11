import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notifikasi" options={{headerShown: false}}/>
      <Stack.Screen name="my-booking" options={{headerShown: false}}/>
    </Stack>
  );
};

export default Layout;
