import api from './axiosConfig';

// GET: /api/Mesas (Todos los roles)
export const getMesas = async () => {
    const response = await api.get('/Mesas');
    return response.data;
};

// GET: /api/Mesas/{id} (Todos los roles)
export const getMesaPorId = async (id) => {
    const response = await api.get(`/Mesas/${id}`);
    return response.data;
};

// POST: /api/Mesas (SOLO Administrador)
export const crearMesa = async (crearMesaDto) => {
    // crearMesaDto debe tener: Numero (int), Capacidad (int), Observaciones (string)
    const response = await api.post('/Mesas', crearMesaDto);
    return response.data;
};

// DELETE: /api/Mesas/{id} (SOLO Administrador)
export const eliminarMesa = async (id) => {
    const response = await api.delete(`/Mesas/${id}`);
    return response.data;
};

// PUT: /api/Mesas/{id}/estado (Todos los roles)
export const cambiarEstadoMesa = async (id, nuevoEstado) => {
    // IMPORTANTE: Al ser [FromBody] string en C#, se debe enviar como cadena JSON (con comillas)
    const response = await api.put(`/Mesas/${id}/estado`, `"${nuevoEstado}"`, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

// PUT: /api/Mesas/{id}/numero (SOLO Administrador)
export const cambiarNumeroMesa = async (id, nuevoNumero) => {
    // Al ser [FromBody] int, se envía el número directamente
    const response = await api.put(`/Mesas/${id}/numero`, nuevoNumero, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};