import axios from "axios";

const API = "https://localhost:7248/api/Mesas";

export const getMesas = () => axios.get(API);

export const crearMesa = (data) => axios.post(API, data);

export const cambiarEstado = (id, estado) =>
  axios.put(`${API}/${id}/estado`, JSON.stringify(estado), {
    headers: { "Content-Type": "application/json" }
  });

export const eliminarMesa = (id) => axios.delete(`${API}/${id}`);