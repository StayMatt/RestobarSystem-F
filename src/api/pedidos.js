// src/api/pedidos.js
import axios from "axios";

const API_URL = "https://localhost:7248/api/Pedidos";

export const abrirPedido = (mesaId) => {
  // Coincide con AperturaMesaDTO
  return axios.post(`${API_URL}/abrir`, { 
    mesaId: parseInt(mesaId), 
    idUsuario: 1 // Hardcodeado hasta que tengas Login
  });
};

export const enviarComanda = (pedidoId, productosCarrito) => {
  // Coincide con EnviarComandaDTO e ItemComandaDTO
  const payload = {
    pedidoId: parseInt(pedidoId),
    items: productosCarrito.map(p => ({
      productoId: p.id,
      cantidad: 1, // Por ahora 1, luego puedes sumar cantidades
      notas: p.notas || "" 
    }))
  };
  return axios.post(`${API_URL}/comanda`, payload);
};

export const cerrarPedido = (pedidoId) => {
  return axios.put(`${API_URL}/${pedidoId}/cerrar`);
};