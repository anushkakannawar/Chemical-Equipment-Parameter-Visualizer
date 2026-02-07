import axios from 'axios';

// Base URL configuration
const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

/**
 * Login to get auth token
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} response data containing token
 */
export const login = async (username, password) => {
    try {
        // Use relative path to go through Vite proxy
        const response = await api.post('/login/', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return token;
    } catch (error) {
        throw error;
    }
};

/**
 * Register a new user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} response data
 */
export const register = async (username, email, password) => {
    try {
        const response = await api.post('/register/', { username, email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout
 */
export const logout = () => {
    localStorage.removeItem('token');
};

/**
 * Upload a CSV file to the backend
 * @param {File} file - The file object to upload
 * @returns {Promise<Object>} - The response data
 */
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch the latest dataset summary and data
 * @returns {Promise<Object>} - The summary data
 */
export const getSummary = async () => {
    try {
        const response = await api.get('/summary/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetch the last 5 uploaded datasets
 * @returns {Promise<Array>} - List of history items
 */
export const getHistory = async () => {
    try {
        const response = await api.get('/history/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Download PDF Report
 * @param {number} id - Dataset ID
 * @returns {Promise<Blob>} - PDF Blob
 */
export const downloadReport = async (id) => {
    try {
        const response = await api.get(`/report/${id}/`, {
            responseType: 'blob', // Important for file download
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;
