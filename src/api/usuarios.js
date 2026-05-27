import api from './axiosConfig';

export const getUsuarios = async () => {
    const response = await api.get('/Usuarios');
    return response.data;
};

export const crearUsuario = async (crearUsuarioDto) => {
    const response = await api.post('/Usuarios', crearUsuarioDto);
    return response.data;
};

// PUT (Admin) — si Password está vacío, el backend no lo actualiza
export const actualizarUsuario = async (id, dto) => {
    const response = await api.put(`/Usuarios/${id}`, dto);
    return response.data;
};

// DELETE (Admin)
export const eliminarUsuario = async (id) => {
    const response = await api.delete(`/Usuarios/${id}`);
    return response.data;
};