import api from './axiosConfig';

export const getUsuarios = async () => {
    const response = await api.get('/Usuarios');
    return response.data; // Devuelve una lista de UsuarioDTO
};

export const crearUsuario = async (crearUsuarioDto) => {
    // crearUsuarioDto debe coincidir con: NombreCompleto, Username, Password, RolId
    const response = await api.post('/Usuarios', crearUsuarioDto);
    return response.data;
};