import api from './axiosConfig';

// --- SALA Y ATENCIÓN ---

export const abrirMesa = async (mesaId, usuarioId) => {
    // Coincide con AperturaMesaDTO: { MesaId, UsuarioId }
    const response = await api.post('/Pedidos/abrir', {
        MesaId: parseInt(mesaId),
        UsuarioId: parseInt(usuarioId)
    });
    // El backend devuelve { Mensaje: "...", PedidoId: 5 } — extraemos solo el ID
    return response.data.pedidoId ?? response.data.PedidoId ?? response.data;
};

export const enviarComanda = async (pedidoId, items) => {
    // Coincide con EnviarComandaDTO: { PedidoId, Items: [ { ProductoId, Cantidad, Notas } ] }
    const response = await api.post('/Pedidos/comanda', {
        PedidoId: parseInt(pedidoId),
        Items: items
    });
    return response.data;
};

// --- COCINA Y BAR (KDS) ---

export const getPendientesPorArea = async (area) => {
    const response = await api.get(`/Pedidos/produccion/${area}`);
    return response.data;
};

export const cambiarEstadoPreparacion = async (id, nuevoEstado) => {
    // [FromBody] string -> requiere ser enviado como cadena JSON con comillas
    const response = await api.put(`/Pedidos/detalle/${id}/estado`, `"${nuevoEstado}"`, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};

// --- MESERA: VER PLATOS LISTOS EN SU MESA ---

export const getListosPorPedido = async (pedidoId) => {
    // Nuevo endpoint: devuelve ítems con EstadoPrep == "Listo" del pedido indicado
    const response = await api.get(`/Pedidos/${pedidoId}/listos`);
    return response.data;
};

// --- CAJA Y PAGOS ---

export const getCuenta = async (pedidoId) => {
    const response = await api.get(`/Pedidos/${pedidoId}/cuenta`);
    return response.data;
};

export const cerrarPedido = async (pedidoId, metodoPago) => {
    const response = await api.put(`/Pedidos/${pedidoId}/cerrar`, {
        MetodoPago: metodoPago
    });
    return response.data;
};