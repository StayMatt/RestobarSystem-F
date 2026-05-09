import api from './axiosConfig';

export const getCategorias = async () => {
    const response = await api.get('/Categorias');
    return response.data; // Retorna la lista de CategoriaDTO
};

export const crearCategoria = async (crearCategoriaDto) => {
    // crearCategoriaDto debe ser exactamente: { Nombre: "string" }
    const response = await api.post('/Categorias', crearCategoriaDto);
    return response.data;
};