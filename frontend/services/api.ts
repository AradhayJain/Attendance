import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2, for iOS simulator use localhost
// For physical device, use your machine's IP address
const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3000/api/v1',
    ios: 'http://localhost:3000/api/v1',
    default: 'http://localhost:3000/api/v1',
});

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - maybe logout or refresh token
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('user_role');
            // You might want to trigger a redirect to login here if possible
        }
        return Promise.reject(error);
    }
);

export default api;
