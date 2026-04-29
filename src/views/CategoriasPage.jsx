// src/views/CategoriasPage.jsx
import { useEffect, useState } from "react";
import { getCategorias, crearCategoria } from "../api/categorias";
import toast from "react-hot-toast";

export function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [nombre, setNombre] = useState("");

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const res = await getCategorias();
      setCategorias(res.data || []);
    } catch (error) {
      toast.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return toast.error("El nombre es obligatorio");

    try {
      await crearCategoria({ nombre });
      toast.success("Categoría creada");
      setNombre("");
      setOpenModal(false);
      cargarCategorias();
    } catch (error) {
      toast.error("Error al crear la categoría");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Listado de Categorías</h2>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all"
        >
          + Nueva Categoría
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 animate-pulse">Cargando categorías...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categorias.map((cat) => (
            <div key={cat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">{cat.nombre}</h3>
            </div>
          ))}
          {categorias.length === 0 && (
            <p className="text-slate-500 col-span-full">No hay categorías registradas aún.</p>
          )}
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Nueva Categoría</h3>
            <form onSubmit={handleCrear}>
              <input
                type="text"
                placeholder="Ej. Bebidas, Postres..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}