import api from './axiosConfig';

// POST api/Stock/{productoId}/reabastecer
export const reabastecerProducto = async (productoId, { Cantidad, Motivo }) => {
    const response = await api.post(`/Stock/${productoId}/reabastecer`, { Cantidad, Motivo });
    return response.data;
};

// POST api/Stock/{productoId}/ajustar
export const ajustarStock = async (productoId, { CantidadNueva, Motivo }) => {
    const response = await api.post(`/Stock/${productoId}/ajustar`, { CantidadNueva, Motivo });
    return response.data;
};

// GET api/Stock/movimientos?productoId=5&limit=50
export const getMovimientos = async (productoId, limit = 50) => {
    const params = new URLSearchParams();
    if (productoId) params.append('productoId', productoId);
    if (limit) params.append('limit', limit);
    const response = await api.get(`/Stock/movimientos?${params}`);
    return response.data;
};

// GET api/Stock/movimientos/fecha?fecha=2026-05-26
export const getMovimientosPorFecha = async (fecha) => {
    const response = await api.get(`/Stock/movimientos/fecha?fecha=${fecha}`);
    return response.data;
};
