// src/api/categorias.js
import axios from "axios";

const API_URL = "https://localhost:7248/api/Categorias";

// Exportación nombrada (con 'export' al inicio) para getCategorias
export const getCategorias = () => {
  return axios.get(API_URL);
};

// Exportación nombrada para crearCategoria
export const crearCategoria = (data) => {
  return axios.post(API_URL, data);
};