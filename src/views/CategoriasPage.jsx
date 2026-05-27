import { useEffect, useState } from 'react';
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../api/categorias';
import toast from 'react-hot-toast';

const GRADIENTS = [
    'from-orange-500/20 to-amber-500/5',
    'from-blue-500/20 to-cyan-500/5',
    'from-emerald-500/20 to-teal-500/5',
    'from-purple-500/20 to-violet-500/5',
    'from-rose-500/20 to-pink-500/5',
    'from-amber-500/20 to-yellow-500/5',
];
const ACCENTS = [
    { ring: 'ring-orange-500/30', text: 'text-orange-400', icon: 'bg-orange-500/20 text-orange-400', border: 'border-orange-500/20' },
    { ring: 'ring-blue-500/30',   text: 'text-blue-400',   icon: 'bg-blue-500/20 text-blue-400',     border: 'border-blue-500/20' },
    { ring: 'ring-emerald-500/30', text: 'text-emerald-400', icon: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
    { ring: 'ring-purple-500/30', text: 'text-purple-400', icon: 'bg-purple-500/20 text-purple-400', border: 'border-purple-500/20' },
    { ring: 'ring-rose-500/30',   text: 'text-rose-400',   icon: 'bg-rose-500/20 text-rose-400',     border: 'border-rose-500/20' },
    { ring: 'ring-amber-500/30',  text: 'text-amber-400',  icon: 'bg-amber-500/20 text-amber-400',   border: 'border-amber-500/20' },
];
const EMOJIS = ['🍔', '🍹', '🥗', '🍕', '🥩', '🍰', '🍜', '🥤', '🍣', '🥘', '🧁', '🥟'];

export const CategoriasPage = () => {
    const [categorias, setCategorias] = useState([]);
    const [nombre, setNombre] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [editNombre, setEditNombre] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const rol = localStorage.getItem('rol');
    const esAdmin = rol === 'Administrador';

    const cargar = async () => {
        try { setCategorias(await getCategorias()); }
        catch { toast.error("Error al cargar categorías"); }
    };
    useEffect(() => { cargar(); }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            await crearCategoria({ Nombre: nombre });
            toast.success("Categoría creada");
            setNombre('');
            setShowForm(false);
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al crear"); }
    };

    const handleEditar = async () => {
        if (!editNombre.trim()) return toast.error("El nombre no puede estar vacío");
        try {
            await actualizarCategoria(editando.id, { Nombre: editNombre });
            toast.success("Categoría actualizada");
            setEditando(null);
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al editar"); }
    };

    const handleEliminar = async (id) => {
        try {
            await eliminarCategoria(id);
            toast.success("Categoría eliminada");
            setConfirmDelete(null);
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al eliminar"); }
    };

    const inputClass = "w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all";

    return (
        <div className="space-y-8">
            {/* ── Header con stats ── */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <span className="text-lg">🏷️</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Categorías</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-[52px]">Organiza tu carta en secciones</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900/80 border border-white/5 px-5 py-3 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                        <p className="text-2xl font-black text-white">{categorias.length}</p>
                    </div>
                    {esAdmin && (
                        <button onClick={() => setShowForm(v => !v)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg
                                ${showForm
                                    ? 'bg-slate-800 text-slate-300 border border-white/10 shadow-none'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:scale-[1.03] shadow-amber-500/25'
                                }`}
                        >
                            <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            {showForm ? 'Cancelar' : 'Nueva Categoría'}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Formulario crear ── */}
            {esAdmin && showForm && (
                <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 p-6 rounded-3xl animate-in">
                    <form onSubmit={handleCrear} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-2">Nombre</label>
                            <input className={inputClass} type="text" placeholder="Ej: Entradas, Fondos, Cócteles..."
                                value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
                        </div>
                        <button type="submit"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black px-8 py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-500/20 whitespace-nowrap">
                            Guardar
                        </button>
                    </form>
                </div>
            )}

            {/* ── Grid de categorías ── */}
            {categorias.length === 0 ? (
                <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-white/5">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-5">
                        <span className="text-4xl">📁</span>
                    </div>
                    <p className="text-lg font-black text-slate-300">Sin categorías todavía</p>
                    <p className="text-slate-500 text-sm mt-1">Crea la primera para organizar tu carta</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {categorias.map((c, idx) => {
                        const grad = GRADIENTS[idx % GRADIENTS.length];
                        const accent = ACCENTS[idx % ACCENTS.length];
                        const emoji = EMOJIS[idx % EMOJIS.length];
                        return (
                            <div key={c.id}
                                className={`relative group bg-gradient-to-br ${grad} border ${accent.border} rounded-3xl p-6 
                                    hover:scale-[1.04] hover:shadow-xl hover:shadow-black/30 transition-all duration-300 cursor-default overflow-hidden`}
                            >
                                {/* Decoración de fondo */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/[0.03] rounded-full blur-sm" />

                                {/* Botones admin */}
                                {esAdmin && (
                                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <button onClick={() => { setEditando(c); setEditNombre(c.nombre); }}
                                            className="w-8 h-8 bg-white/10 hover:bg-blue-500/30 backdrop-blur-md border border-white/10 hover:border-blue-400/50 rounded-xl flex items-center justify-center text-slate-300 hover:text-blue-400 transition-all"
                                            title="Editar">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => setConfirmDelete(c)}
                                            className="w-8 h-8 bg-white/10 hover:bg-red-500/30 backdrop-blur-md border border-white/10 hover:border-red-400/50 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-400 transition-all"
                                            title="Eliminar">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* Icono emoji */}
                                <div className={`w-14 h-14 rounded-2xl ${accent.icon} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {emoji}
                                </div>

                                <p className={`font-black text-xl leading-tight ${accent.text}`}>{c.nombre}</p>
                                <p className="text-[11px] text-slate-500 font-mono mt-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    ID #{c.id}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal editar ── */}
            {editando && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditando(null)}>
                    <div className="bg-slate-900 border border-blue-500/20 p-8 rounded-3xl shadow-2xl w-[420px]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-black text-white text-lg">Editar Categoría</h2>
                                <p className="text-slate-500 text-xs">ID #{editando.id}</p>
                            </div>
                        </div>

                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</label>
                        <input className={`${inputClass} mt-1`} type="text" value={editNombre} autoFocus
                            onChange={e => setEditNombre(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditar(); }} />

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setEditando(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">
                                Cancelar
                            </button>
                            <button onClick={handleEditar}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-blue-500/20">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal eliminar ── */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-slate-900 border border-red-500/20 p-8 rounded-3xl shadow-2xl w-96 text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🗑️</span>
                        </div>
                        <h2 className="font-black text-white text-lg mb-2">¿Eliminar "{confirmDelete.nombre}"?</h2>
                        <p className="text-slate-400 text-sm mb-6">Si tiene productos asociados, no se podrá eliminar.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmDelete.id)}
                                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-red-500/20">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};