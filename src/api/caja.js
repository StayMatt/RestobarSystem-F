import api from './axiosConfig';

// GET api/Caja/resumen?desde=2026-05-01&hasta=2026-05-26
export const getResumenCaja = async (desde, hasta) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const response = await api.get(`/Caja/resumen?${params}`);
    return response.data;
};

// GET api/Caja/top-productos?desde=2026-05-01&hasta=2026-05-26&top=10
export const getTopProductos = async (desde, hasta, top = 10) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    params.append('top', top);
    const response = await api.get(`/Caja/top-productos?${params}`);
    return response.data;
};
