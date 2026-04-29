import axios from "axios";

const API_URL = "https://localhost:7248/api/Productos";

export const getTodosLosProductos = () => axios.get(API_URL);
export const getProductosActivos = () => axios.get(`${API_URL}/activos`);
export const getAlertasStock = () => axios.get(`${API_URL}/alertas`);

export const crearProducto = (data) => axios.post(API_URL, data);

export const cambiarEstadoProducto = (id, nuevoEstado) => 
    axios.put(`${API_URL}/${id}/estado`, nuevoEstado, {
        headers: { "Content-Type": "application/json" }
    });

// Nueva función para el Admin
export const actualizarStock = (id, cantidad) => 
    axios.put(`${API_URL}/${id}/stock`, cantidad, {
        headers: { "Content-Type": "application/json" }
    });