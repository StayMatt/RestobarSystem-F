// src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7248/api', // Puerto HTTPS del backend .NET
    headers: {
        'Content-Type': 'application/json'
    }
});

// NUEVO: Interceptor para inyectar el token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Buscamos el token en la memoria del navegador
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Se lo pegamos a la petición
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;