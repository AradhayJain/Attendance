import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const LOCAL_IP = '10.238.127.95'; // 👈 CHANGE THIS

const BASE_URL = (() => {
    // Expo Go on physical device
    if (Constants.isDevice) {
        return `http://${LOCAL_IP}:3000/api/v1`;
    }

    // Emulators / simulators
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api/v1';
    }

    return 'http://localhost:3000/api/v1';
})();

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
