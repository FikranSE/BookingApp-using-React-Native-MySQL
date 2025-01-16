// lib/auth.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from 'react-native';
import { AUTH_TOKEN_KEY } from './constants';

export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }
      console.log(`Attempting to get token for key: ${key}`);
      const token = await SecureStore.getItemAsync(key);
      if (token) {
        console.log('Token found in storage');
        return token;
      }
      console.log('No token found in storage');
      return null;
    } catch (error) {
      console.error("SecureStore get token error:", error);
      return null;
    }
  },

  async saveToken(key: string, value: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false;
      }
      console.log(`Attempting to save token with key: ${key}`);
      await SecureStore.setItemAsync(key, value);
      const savedToken = await SecureStore.getItemAsync(key);
      if (savedToken) {
        console.log('Token successfully saved and verified');
        return true;
      }
      console.log('Token save failed verification');
      return false;
    } catch (error) {
      console.error("SecureStore save token error:", error);
      return false;
    }
  },

  async removeToken(key: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false;
      }
      await SecureStore.deleteItemAsync(key);
      const token = await SecureStore.getItemAsync(key);
      return !token;
    } catch (error) {
      console.error("SecureStore remove token error:", error);
      return false;
    }
  }
};
