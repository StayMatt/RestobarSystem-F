import { useEffect, useState } from "react";
import { getTodosLosProductos, crearProducto, cambiarEstadoProducto, actualizarStock } from "../api/productos";
import { getCategorias } from "../api/categorias";
import toast from "react-hot-toast";

export function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("activos");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "", precio: "", categoriaId: "", areaDestino: "Cocina",
    stockActual: 0, stockMinimo: 5, controlaStock: true
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([getTodosLosProductos(), getCategorias()]);
      setProductos(resProd.data || []);
      setCategorias(resCat.data || []);
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleEditStock = async (id, actual) => {
    const nuevaCantidad = prompt("Ingrese la nueva cantidad de stock:", actual);
    if (nuevaCantidad !== null && !isNaN(nuevaCantidad)) {
      try {
        await actualizarStock(id, parseInt(nuevaCantidad));
        toast.success("Stock actualizado");
        cargarDatos();
      } catch (e) { toast.error("Error al actualizar stock"); }
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await crearProducto({
        Nombre: formulario.nombre,
        Precio: parseFloat(formulario.precio),
        CategoriaId: parseInt(formulario.categoriaId),
        AreaDestino: formulario.areaDestino,
        StockActual: parseInt(formulario.stockActual),
        StockMinimo: parseInt(formulario.stockMinimo),
        ControlaStock: formulario.controlaStock,
        Activo: true
      });
      toast.success("Producto creado");
      setOpenModal(false);
      cargarDatos();
    } catch (error) { toast.error(error.response?.data || "Error al crear"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setFiltroEstado("activos")} className={`px-4 py-2 rounded-lg ${filtroEstado === 'activos' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Disponibles</button>
          <button onClick={() => setFiltroEstado("inactivos")} className={`px-4 py-2 rounded-lg ${filtroEstado === 'inactivos' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Agotados</button>
        </div>
        <button onClick={() => setOpenModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">+ Nuevo</button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Stock Actual</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.filter(p => filtroEstado === 'activos' ? p.activo : !p.activo).map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-bold">
                    {p.nombre}
                    <p className="text-xs text-slate-400 font-normal">{p.categoria?.nombre}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold px-3 py-1 rounded-full ${p.controlaStock && p.stockActual <= p.stockMinimo ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {p.controlaStock ? p.stockActual : '∞'}
                    </span>
                    {p.controlaStock && (
                        <button onClick={() => handleEditStock(p.id, p.stockActual)} className="text-blue-500 text-xs hover:underline">Ajustar</button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">S/ {p.precio.toFixed(2)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => cambiarEstadoProducto(p.id, !p.activo).then(cargarDatos)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg ${p.activo ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}
                  >
                    {p.activo ? "Quitar del Menú" : "Reactivar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL SIMPLIFICADO */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Nuevo Producto</h3>
            <form onSubmit={handleCrear} className="space-y-4">
              <input placeholder="Nombre" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setFormulario({...formulario, nombre: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setFormulario({...formulario, precio: e.target.value})} />
                <select className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setFormulario({...formulario, areaDestino: e.target.value})}>
                    <option value="Cocina">Cocina</option>
                    <option value="Bar">Bar</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Stock Inicial" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setFormulario({...formulario, stockActual: e.target.value})} />
                <input type="number" placeholder="Stock Mínimo" className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setFormulario({...formulario, stockMinimo: e.target.value})} />
              </div>
              <select className="w-full p-3 bg-slate-100 rounded-xl" onChange={e => setFormulario({...formulario, categoriaId: e.target.value})}>
                <option value="">Categoría...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpenModal(false)} className="flex-1 p-3">Cerrar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}