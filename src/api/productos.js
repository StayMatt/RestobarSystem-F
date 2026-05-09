import api from './axiosConfig';

// --- LECTURA ---
export const getProductos = async () => {
    const response = await api.get('/Productos');
    return response.data;
};

export const getProductosActivos = async () => {
    const response = await api.get('/Productos/activos');
    return response.data;
};

export const getAlertasStock = async () => {
    const response = await api.get('/Productos/alertas');
    return response.data;
};

// --- ESCRITURA (Admin) ---
export const crearProducto = async (crearProductoDto) => {
    const response = await api.post('/Productos', crearProductoDto);
    return response.data;
};

// [FromBody] int
export const actualizarStock = async (id, cantidadNueva) => {
    const response = await api.put(`/Productos/${id}/stock`, cantidadNueva, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

// [FromBody] bool
export const cambiarDisponibilidad = async (id, activo) => {
    const response = await api.put(`/Productos/${id}/estado`, activo, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

// [FromBody] decimal
export const cambiarPrecio = async (id, nuevoPrecio) => {
    const response = await api.put(`/Productos/${id}/precio`, nuevoPrecio, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};