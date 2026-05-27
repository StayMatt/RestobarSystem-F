import api from './axiosConfig';

export const getCategorias = async () => {
    const response = await api.get('/Categorias');
    return response.data;
};

export const crearCategoria = async (crearCategoriaDto) => {
    const response = await api.post('/Categorias', crearCategoriaDto);
    return response.data;
};

// PUT (Admin)
export const actualizarCategoria = async (id, dto) => {
    const response = await api.put(`/Categorias/${id}`, dto);
    return response.data;
};

// DELETE (Admin)
export const eliminarCategoria = async (id) => {
    const response = await api.delete(`/Categorias/${id}`);
    return response.data;
};