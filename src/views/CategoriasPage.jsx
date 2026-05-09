import { useEffect, useState } from 'react';
import { getCategorias, crearCategoria } from '../api/categorias';
import toast from 'react-hot-toast';

export const CategoriasPage = () => {
    const [categorias, setCategorias] = useState([]);
    
    // Estado exacto como pide el CrearCategoriaDTO
    const [form, setForm] = useState({ Nombre: '' });
    
    // Obtenemos el rol del usuario logueado para ocultar/mostrar el formulario
    const rol = localStorage.getItem('rol');

    const cargarCategorias = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            toast.error("Error al cargar las categorías");
        }
    };

    useEffect(() => { 
        cargarCategorias(); 
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            // Enviamos el payload exacto { Nombre: '...' }
            await crearCategoria(form);
            toast.success("Categoría creada con éxito");
            
            // Limpiamos el input
            setForm({ Nombre: '' });
            
            // Recargamos la tabla
            cargarCategorias();
        } catch (error) {
            // Capturamos el BadRequest(new { mensaje = ... }) del C#
            const mensajeError = error.response?.data?.mensaje || "Error al crear categoría";
            toast.error(mensajeError);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800">📁 Categorías del Menú</h1>
            
            {/* SOLO EL ADMINISTRADOR PUEDE VER ESTE FORMULARIO */}
            {rol === 'Administrador' && (
                <form onSubmit={handleCrear} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre de la Categoría</label>
                        <input 
                            className="w-full border-2 border-slate-100 p-3 rounded-xl mt-1 focus:border-blue-500 outline-none transition-all" 
                            type="text" 
                            placeholder="Ej: Entradas, Bebidas, Fondos..." 
                            value={form.Nombre} 
                            onChange={e => setForm({ Nombre: e.target.value })} 
                            required 
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white font-black px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md">
                        Añadir Categoría
                    </button>
                </form>
            )}

            {/* LA LISTA LA VEN TODOS LOS ROLES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-xs uppercase text-slate-500">
                            <th className="p-4 w-24 text-center">ID</th>
                            <th className="p-4">Nombre de la Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="p-8 text-center text-slate-400 italic">
                                    No hay categorías registradas aún.
                                </td>
                            </tr>
                        ) : (
                            categorias.map(c => (
                                <tr key={c.id} className="border-b hover:bg-slate-50 transition">
                                    <td className="p-4 text-center font-mono text-slate-400">#{c.id}</td>
                                    <td className="p-4 font-bold text-slate-700 text-lg">{c.nombre}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};