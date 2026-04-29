// src/views/MesasPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importamos el hook de navegación
import { getMesas, crearMesa, cambiarEstado, eliminarMesa } from "../api/mesas";
import { abrirPedido } from "../api/pedidos"; // 2. Importamos la función para abrir pedido
import { MesaCard } from "../components/mesas/MesaCard";
import { MesaModal } from "../components/mesas/MesaModal";
import toast from "react-hot-toast";

export function MesasPage() {
  const navigate = useNavigate(); // 3. Inicializamos el navegador

  const [mesas, setMesas] = useState([]);
  const [numero, setNumero] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const cargarMesas = async () => {
    setLoading(true);
    try {
      const res = await getMesas();
      setMesas(res.data || []);
    } catch (error) {
      toast.error("Error al cargar mesas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  // 4. Nueva función para manejar el clic en la mesa
  const handleMesaClick = async (mesa) => {
    if (mesa.estado === "Libre") {
      try {
        // Llamamos a la API para abrir el pedido
        const res = await abrirPedido(mesa.id);
        const pedidoNuevo = res.data; 
        
        // Cambiamos el estado de la mesa a Ocupada en la DB
        await cambiarEstado(mesa.id, "Ocupada");
        
        toast.success(`Mesa ${mesa.numero} abierta`);
        // Navegamos a la toma de pedidos pasando el ID del pedido o de la mesa
        navigate(`/pedidos/${mesa.id}`); 
      } catch (error) {
        toast.error("No se pudo abrir la mesa");
      }
    } else {
      // Si ya está ocupada, vamos de frente a ver el pedido existente
      navigate(`/pedidos/${mesa.id}`);
    }
  };

  const handleCrear = async () => {
    if (!numero) return toast.error("Ingresa un número");
    try {
      await crearMesa({ numero: parseInt(numero), estado: "Libre" });
      toast.success("Mesa creada");
      setNumero("");
      setOpenModal(false);
      cargarMesas();
    } catch (error) {
      toast.error("Error al crear mesa");
    }
  };

  const toggleEstado = async (mesa) => {
    try {
      const nuevoEstado = mesa.estado === "Libre" ? "Ocupada" : "Libre";
      await cambiarEstado(mesa.id, nuevoEstado);
      toast.success(`Mesa ${mesa.numero} ahora está ${nuevoEstado}`);
      cargarMesas();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar mesa?")) return;
    try {
      await eliminarMesa(id);
      toast.success("Mesa eliminada");
      cargarMesas();
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  };

  const mesasFiltradas = filtro === "Todos" 
    ? mesas 
    : mesas.filter((m) => m.estado === filtro);

  return (
    <div>
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Mesas</p>
          <p className="text-3xl font-bold text-slate-800">{mesas.length}</p>
        </div>
        <div className="bg-emerald-500 p-6 rounded-2xl shadow-lg shadow-emerald-200">
          <p className="text-sm font-medium text-emerald-100">Disponibles</p>
          <p className="text-3xl font-bold text-white">{mesas.filter(m => m.estado === "Libre").length}</p>
        </div>
        <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-200">
          <p className="text-sm font-medium text-orange-100">Ocupadas</p>
          <p className="text-3xl font-bold text-white">{mesas.filter(m => m.estado === "Ocupada").length}</p>
        </div>
      </div>

      {/* BARRA DE ACCIONES */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
          {["Todos", "Libre", "Ocupada"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                filtro === f 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {f === "Libre" ? "Libres" : f === "Ocupada" ? "Ocupadas" : f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nueva Mesa
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* GRID: Aquí pasamos la nueva función handleMesaClick */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 cursor-pointer">
          {mesasFiltradas.map((m) => (
            <div key={m.id} onClick={() => handleMesaClick(m)}>
              <MesaCard 
                mesa={m} 
                onToggle={(e) => { e.stopPropagation(); toggleEstado(m); }} 
                onDelete={(id) => { window.event.stopPropagation(); handleDelete(id); }} 
              />
            </div>
          ))}
        </div>
      )}

      <MesaModal 
        isOpen={openModal} 
        onClose={() => setOpenModal(false)} 
        onSave={handleCrear} 
        numero={numero} 
        setNumero={setNumero} 
      />
    </div>
  );
}