import { useEffect, useState } from 'react';
import { getProductos, crearProducto, cambiarDisponibilidad } from '../api/productos';
import { getCategorias } from '../api/categorias';
import toast from 'react-hot-toast';

export const ProductosPage = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const rol = localStorage.getItem('rol');

    // Estado exacto a tu CrearProductoDTO
    const [form, setForm] = useState({
        Nombre: '',
        Descripcion: '',
        ImagenUrl: '',
        Costo: '',
        Precio: '',
        AreaDestino: 'Cocina', // Valor por defecto
        StockActual: 0,
        StockMinimo: 5,
        ControlaStock: true,
        CategoriaId: ''
    });

    const cargarDatos = async () => {
        try {
            const [dataProductos, dataCategorias] = await Promise.all([
                getProductos(),
                getCategorias()
            ]);
            setProductos(dataProductos);
            setCategorias(dataCategorias);
        } catch (error) {
            toast.error("Error al cargar los datos");
        }
    };

    useEffect(() => { 
        cargarDatos(); 
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            // Conversión estricta de tipos de datos para C#
            const payload = {
                Nombre: form.Nombre,
                Descripcion: form.Descripcion || null,
                ImagenUrl: form.ImagenUrl || null,
                Costo: parseFloat(form.Costo || 0),
                Precio: parseFloat(form.Precio || 0),
                AreaDestino: form.AreaDestino,
                StockActual: parseInt(form.StockActual || 0),
                StockMinimo: parseInt(form.StockMinimo || 0),
                ControlaStock: form.ControlaStock,
                CategoriaId: parseInt(form.CategoriaId)
            };

            await crearProducto(payload);
            toast.success("Producto añadido a la carta");
            
            // Limpiar formulario
            setForm({
                Nombre: '', Descripcion: '', ImagenUrl: '', Costo: '', Precio: '',
                AreaDestino: 'Cocina', StockActual: 0, StockMinimo: 5, ControlaStock: true, CategoriaId: ''
            });
            cargarDatos();
        } catch (error) {
            const mensajeError = error.response?.data?.mensaje || "Error al crear producto";
            toast.error(mensajeError);
        }
    };

    const handleToggleActivo = async (id, estadoActual) => {
        try {
            await cambiarDisponibilidad(id, !estadoActual);
            toast.success("Estado del producto actualizado");
            cargarDatos();
        } catch (error) {
            toast.error("Error al cambiar disponibilidad");
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800">🍔 Carta e Inventario</h1>

            {/* SOLO EL ADMINISTRADOR PUEDE CREAR PRODUCTOS */}
            {rol === 'Administrador' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-bold text-blue-600 uppercase mb-4 tracking-widest">Añadir Nuevo Producto</h2>
                    
                    <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre</label>
                            <input className="w-full border p-2.5 rounded-xl mt-1" type="text" value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} required />
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Categoría</label>
                            <select className="w-full border p-2.5 rounded-xl mt-1 bg-white" value={form.CategoriaId} onChange={e => setForm({...form, CategoriaId: e.target.value})} required>
                                <option value="">Seleccione...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Área Destino</label>
                            <select className="w-full border p-2.5 rounded-xl mt-1 bg-white" value={form.AreaDestino} onChange={e => setForm({...form, AreaDestino: e.target.value})}>
                                <option value="Cocina">Cocina</option>
                                <option value="Bar">Bar</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Costo (S/.)</label>
                            <input className="w-full border p-2.5 rounded-xl mt-1" type="number" step="0.01" value={form.Costo} onChange={e => setForm({...form, Costo: e.target.value})} required />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Venta (S/.)</label>
                            <input className="w-full border p-2.5 rounded-xl mt-1" type="number" step="0.01" value={form.Precio} onChange={e => setForm({...form, Precio: e.target.value})} required />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Stock Inicial</label>
                            <input className="w-full border p-2.5 rounded-xl mt-1" type="number" value={form.StockActual} onChange={e => setForm({...form, StockActual: e.target.value})} required />
                        </div>

                        <div className="flex items-center h-full pb-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={form.ControlaStock} onChange={e => setForm({...form, ControlaStock: e.target.checked})} />
                                <span className="ml-2 text-sm font-bold text-slate-600">Controlar Stock</span>
                            </label>
                        </div>

                        <div className="col-span-full mt-2">
                            <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition shadow-md">
                                Guardar Producto en la Carta
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLA VISIBLE PARA TODOS LOS ROLES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                                <th className="p-4">Producto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Área</th>
                                <th className="p-4 text-right">Precio</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {productos.map(p => (
                                <tr key={p.id} className="border-b hover:bg-slate-50 transition">
                                    <td className="p-4 font-bold text-slate-800">{p.nombre}</td>
                                    <td className="p-4 text-slate-500">{p.categoriaNombre}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.areaDestino === 'Cocina' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {p.areaDestino}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-blue-600">
                                        S/. {p.precio.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center">
                                        {p.controlaStock ? (
                                            <span className={`font-bold ${p.stockActual <= p.stockMinimo ? 'text-red-500' : 'text-slate-700'}`}>
                                                {p.stockActual}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {/* Solo Admin puede hacer clic para cambiar el estado */}
                                        <button 
                                            onClick={() => rol === 'Administrador' && handleToggleActivo(p.id, p.activo)}
                                            disabled={rol !== 'Administrador'}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition ${
                                                p.activo 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            } ${rol !== 'Administrador' && 'cursor-default'}`}
                                        >
                                            {p.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};