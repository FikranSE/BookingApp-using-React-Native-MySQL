// app/(api)/auth/authApi.ts
import api from '../../../lib/api';
import { tokenCache } from '@/lib/auth';
import { AUTH_TOKEN_KEY } from '@/lib/constants';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Log the full request details
    console.log('Making login request:', {
      url: '/auth/login',
      data: { email: data.email, password: '***' }
    });

    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Log the response data
    console.log('Login API response:', {
      status: response.status,
      data: response.data ? { 
        token: response.data.token ? 'exists' : 'missing',
        user: response.data.user ? 'exists' : 'missing'
      } : 'no data'
    });

    if (!response.data) {
      throw new Error('No response data received');
    }

    if (!response.data.token) {
      throw new Error('No token received from server');
    }

    // Try to save the token
    console.log('Attempting to save token...');
    const saved = await tokenCache.saveToken(AUTH_TOKEN_KEY, response.data.token);
    
    if (!saved) {
      console.error('Failed to save token to secure storage');
      throw new Error('Failed to save authentication token');
    }
    
    console.log('Login process completed successfully');
    return response.data;
  } catch (error: any) {
    // Enhanced error logging
    console.error('Login error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : 'No response',
      isAxiosError: error.isAxiosError,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
      } : 'No config'
    });

    // Throw appropriate error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred during login');
    }
  }
};