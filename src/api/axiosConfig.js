// src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
    // URL de producción apuntando a Somee (Asegúrate de mantener el /api al final)
    baseURL: 'https://elgalanbar.somee.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor REQUEST: inyecta token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor RESPONSE: redirige al login si el token expira (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido → limpiar y redirigir
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('nombre');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;