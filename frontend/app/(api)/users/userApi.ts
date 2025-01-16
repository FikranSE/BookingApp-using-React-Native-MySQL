// app/users/userApi.ts

const API_URL = 'https://e01c-103-212-43-216.ngrok-free.app/api';

interface UserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface Credentials {
  email: string;
  password: string;
}

export const register = async (userData: UserData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const login = async (credentials: Credentials): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  } catch (error) {
    throw new Error('Login failed');
  }
};
