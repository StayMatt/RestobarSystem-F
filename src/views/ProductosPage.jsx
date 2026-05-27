import { useEffect, useState, useRef } from 'react';
import { getProductos, crearProducto, cambiarDisponibilidad, actualizarStock, cambiarPrecio, getAlertasStock, eliminarProducto } from '../api/productos';
import { getCategorias } from '../api/categorias';
import toast from 'react-hot-toast';

// Utilidad: redimensiona imagen a max 300px y devuelve base64 JPEG
const resizeImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 300;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
            else       { if (h > MAX) { w = w * MAX / h; h = MAX; } }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

export const ProductosPage = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [vista, setVista] = useState('todos');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const rol = localStorage.getItem('rol');
    const esAdmin = rol === 'Administrador';
    const fileInputRef = useRef(null);
    const [previewImg, setPreviewImg] = useState(null);

    const [form, setForm] = useState({
        Nombre: '', Descripcion: '', ImagenUrl: '',
        Costo: '', Precio: '', AreaDestino: 'Cocina',
        StockActual: 0, StockMinimo: 5, ControlaStock: true, CategoriaId: ''
    });

    const [editandoStock, setEditandoStock] = useState(null);
    const [editandoPrecio, setEditandoPrecio] = useState(null);
    const [nuevoStock, setNuevoStock] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');

    const cargarDatos = async () => {
        try {
            const [dp, dc] = await Promise.all([getProductos(), getCategorias()]);
            setProductos(dp); setCategorias(dc);
        } catch { toast.error("Error al cargar datos"); }
    };

    const cargarAlertas = async () => {
        try { setAlertas(await getAlertasStock()); }
        catch { toast.error("Error al cargar alertas"); }
    };

    useEffect(() => { cargarDatos(); }, []);
    useEffect(() => { if (vista === 'alertas' && esAdmin) cargarAlertas(); }, [vista]);

    // ── Imagen ──
    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return toast.error("Solo se permiten imágenes");
        if (file.size > 5 * 1024 * 1024) return toast.error("Imagen demasiado pesada (máx 5MB)");
        const base64 = await resizeImage(file);
        setForm({ ...form, ImagenUrl: base64 });
        setPreviewImg(base64);
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            await crearProducto({
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
            });
            toast.success("Producto añadido");
            setForm({ Nombre: '', Descripcion: '', ImagenUrl: '', Costo: '', Precio: '', AreaDestino: 'Cocina', StockActual: 0, StockMinimo: 5, ControlaStock: true, CategoriaId: '' });
            setPreviewImg(null);
            setShowForm(false);
            cargarDatos();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al crear"); }
    };

    const handleToggleActivo = async (id, actual) => {
        try { await cambiarDisponibilidad(id, !actual); toast.success("Estado actualizado"); cargarDatos(); }
        catch { toast.error("Error"); }
    };

    const handleGuardarStock = async (id) => {
        const v = parseInt(nuevoStock);
        if (isNaN(v) || v < 0) return toast.error("Stock inválido");
        try { await actualizarStock(id, v); toast.success("Stock actualizado"); setEditandoStock(null); cargarDatos(); if (vista === 'alertas') cargarAlertas(); }
        catch (e) { toast.error(e.response?.data?.mensaje || "Error"); }
    };

    const handleGuardarPrecio = async (id) => {
        const v = parseFloat(nuevoPrecio);
        if (isNaN(v) || v <= 0) return toast.error("Precio inválido");
        try { await cambiarPrecio(id, v); toast.success("Precio actualizado"); setEditandoPrecio(null); cargarDatos(); }
        catch (e) { toast.error(e.response?.data?.mensaje || "Error"); }
    };

    const handleEliminar = async (id) => {
        try { await eliminarProducto(id); toast.success("Producto eliminado"); setConfirmDelete(null); cargarDatos(); }
        catch (e) { toast.error(e.response?.data?.mensaje || "Error al eliminar"); }
    };

    const listaActual = vista === 'alertas' ? alertas : productos;
    const inputClass = "w-full bg-slate-800 border border-white/10 text-white placeholder-slate-500 px-3 py-2.5 rounded-xl mt-1 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all text-sm";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white">Carta e Inventario</h1>
                    <p className="text-slate-400 text-sm mt-0.5">{productos.length} productos registrados</p>
                </div>
                <div className="flex items-center gap-3">
                    {esAdmin && (
                        <div className="flex bg-slate-900 border border-white/10 p-1 rounded-2xl gap-1">
                            <button onClick={() => setVista('todos')}
                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${vista === 'todos' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'text-slate-400 hover:text-white'}`}>
                                📋 Todos
                            </button>
                            <button onClick={() => setVista('alertas')}
                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${vista === 'alertas' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-slate-400 hover:text-white'}`}>
                                ⚠️ Stock Bajo
                            </button>
                        </div>
                    )}
                    {esAdmin && (
                        <button onClick={() => setShowForm(v => !v)}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20 text-sm">
                            <svg className={`w-4 h-4 transition-transform ${showForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            {showForm ? 'Cancelar' : 'Nuevo Producto'}
                        </button>
                    )}
                </div>
            </div>

            {/* Formulario crear — Admin */}
            {esAdmin && showForm && (
                <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-5">Añadir Nuevo Producto</h2>
                    <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="col-span-2">
                            <label className={labelClass}>Nombre</label>
                            <input className={inputClass} type="text" placeholder="Nombre del producto" value={form.Nombre} onChange={e => setForm({...form, Nombre: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Categoría</label>
                            <select className={inputClass} value={form.CategoriaId} onChange={e => setForm({...form, CategoriaId: e.target.value})} required>
                                <option value="">Seleccione...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Área Destino</label>
                            <select className={inputClass} value={form.AreaDestino} onChange={e => setForm({...form, AreaDestino: e.target.value})}>
                                <option value="Cocina">Cocina</option>
                                <option value="Bar">Bar</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Descripción (opcional)</label>
                            <input className={inputClass} type="text" placeholder="Breve descripción del producto..."
                                value={form.Descripcion} onChange={e => setForm({...form, Descripcion: e.target.value})} />
                        </div>

                        {/* SUBIDA DE IMAGEN — archivo, no URL */}
                        <div className="col-span-2">
                            <label className={labelClass}>Imagen del Producto (opcional)</label>
                            <div className="flex items-center gap-3 mt-1">
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 bg-slate-800 border border-white/10 hover:border-amber-400/40 text-slate-300 px-4 py-2.5 rounded-xl transition-all text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Subir foto
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                {previewImg && (
                                    <div className="relative">
                                        <img src={previewImg} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-amber-500/30" />
                                        <button type="button" onClick={() => { setPreviewImg(null); setForm({...form, ImagenUrl: ''}); }}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">✕</button>
                                    </div>
                                )}
                                {!previewImg && <span className="text-xs text-slate-500">No se seleccionó imagen</span>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Costo (S/.)</label>
                            <input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.Costo} onChange={e => setForm({...form, Costo: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Precio Venta (S/.)</label>
                            <input className={inputClass} type="number" step="0.01" placeholder="0.00" value={form.Precio} onChange={e => setForm({...form, Precio: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Stock Inicial</label>
                            <input className={inputClass} type="number" value={form.StockActual} onChange={e => setForm({...form, StockActual: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Stock Mínimo</label>
                            <input className={inputClass} type="number" value={form.StockMinimo} onChange={e => setForm({...form, StockMinimo: e.target.value})} required />
                        </div>

                        <div className="flex items-center gap-3 pb-1">
                            <button type="button" onClick={() => setForm({...form, ControlaStock: !form.ControlaStock})}
                                className={`relative w-11 h-6 rounded-full transition-colors ${form.ControlaStock ? 'bg-amber-500' : 'bg-slate-700'}`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.ControlaStock ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                            <span className="text-sm font-semibold text-slate-300">Controlar Stock</span>
                        </div>

                        <div className="col-span-full">
                            <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-500/20">
                                Guardar Producto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-slate-950/50">
                                <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Producto</th>
                                <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Categoría</th>
                                <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider">Área</th>
                                {esAdmin && <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Costo</th>}
                                <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-right">Precio</th>
                                <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-center">Stock</th>
                                <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-center">Estado</th>
                                {esAdmin && <th className="p-4 text-[10px] uppercase text-slate-500 font-bold tracking-wider text-center">Acc.</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                            {listaActual.length === 0 ? (
                                <tr><td colSpan={esAdmin ? 8 : 6} className="p-12 text-center text-slate-500 italic">
                                    {vista === 'alertas' ? '✅ Sin alertas de stock' : 'No hay productos registrados.'}
                                </td></tr>
                            ) : listaActual.map(p => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {p.imagenUrl ? (
                                                <img src={p.imagenUrl} alt={p.nombre} className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0">
                                                    {(p.nombre?.[0] ?? '?').toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-white">{p.nombre}</p>
                                                {p.descripcion && <p className="text-xs text-slate-500 truncate max-w-[200px]">{p.descripcion}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-400">{p.categoriaNombre}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${p.areaDestino === 'Cocina' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'}`}>
                                            {p.areaDestino === 'Cocina' ? '🍳' : '🍹'} {p.areaDestino}
                                        </span>
                                    </td>
                                    {esAdmin && <td className="p-4 text-right font-mono text-slate-500 text-xs">S/. {p.costo?.toFixed(2) ?? '0.00'}</td>}

                                    {/* Precio editable */}
                                    <td className="p-4 text-right">
                                        {editandoPrecio === p.id ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <input type="number" step="0.01" autoFocus className="w-20 bg-slate-800 border border-amber-500/40 text-amber-400 text-right font-mono font-bold px-2 py-1 rounded-lg text-sm focus:outline-none"
                                                    value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleGuardarPrecio(p.id); if (e.key === 'Escape') setEditandoPrecio(null); }} />
                                                <button onClick={() => handleGuardarPrecio(p.id)} className="w-6 h-6 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg flex items-center justify-center text-xs">✓</button>
                                                <button onClick={() => setEditandoPrecio(null)} className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg flex items-center justify-center text-xs">✕</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { if (esAdmin) { setEditandoPrecio(p.id); setNuevoPrecio(p.precio.toFixed(2)); } }} disabled={!esAdmin}
                                                className={`font-mono font-black text-amber-400 ${esAdmin ? 'cursor-pointer hover:text-amber-300 hover:underline underline-offset-2' : 'cursor-default'}`}
                                                title={esAdmin ? 'Click para editar' : ''}>
                                                S/. {p.precio.toFixed(2)}
                                            </button>
                                        )}
                                    </td>

                                    {/* Stock editable */}
                                    <td className="p-4 text-center">
                                        {p.controlaStock ? (
                                            editandoStock === p.id ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <input type="number" autoFocus className="w-16 bg-slate-800 border border-emerald-500/40 text-white text-center font-bold px-2 py-1 rounded-lg text-sm focus:outline-none"
                                                        value={nuevoStock} onChange={e => setNuevoStock(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') handleGuardarStock(p.id); if (e.key === 'Escape') setEditandoStock(null); }} />
                                                    <button onClick={() => handleGuardarStock(p.id)} className="w-6 h-6 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg flex items-center justify-center text-xs">✓</button>
                                                    <button onClick={() => setEditandoStock(null)} className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg flex items-center justify-center text-xs">✕</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => { if (esAdmin) { setEditandoStock(p.id); setNuevoStock(String(p.stockActual)); } }} disabled={!esAdmin}
                                                    className={`font-black text-base ${p.stockActual <= p.stockMinimo ? 'text-red-400 animate-pulse' : 'text-slate-200'} ${esAdmin ? 'cursor-pointer hover:underline underline-offset-2' : 'cursor-default'}`}>
                                                    {p.stockActual <= p.stockMinimo && <span className="text-xs mr-1">⚠</span>}{p.stockActual}
                                                    {esAdmin && <span className="text-[10px] text-slate-600 ml-1">(mín:{p.stockMinimo})</span>}
                                                </button>
                                            )
                                        ) : <span className="text-slate-600 text-xs italic">N/A</span>}
                                    </td>

                                    <td className="p-4 text-center">
                                        <button onClick={() => esAdmin && handleToggleActivo(p.id, p.activo)} disabled={!esAdmin}
                                            className={`relative w-11 h-6 rounded-full transition-colors mx-auto block ${p.activo ? 'bg-emerald-500' : 'bg-slate-700'} ${!esAdmin ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-110'}`}>
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${p.activo ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </td>

                                    {/* Eliminar */}
                                    {esAdmin && (
                                        <td className="p-4 text-center">
                                            <button onClick={() => setConfirmDelete(p)}
                                                className="w-8 h-8 bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 rounded-lg flex items-center justify-center text-red-400 mx-auto transition-all opacity-0 group-hover:opacity-100">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal confirmar eliminación */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-red-500/20 p-8 rounded-3xl shadow-2xl w-96 text-center">
                        <div className="text-5xl mb-4">🗑️</div>
                        <h2 className="font-black text-white text-lg mb-2">¿Eliminar "{confirmDelete.nombre}"?</h2>
                        <p className="text-slate-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmDelete.id)}
                                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-black transition-all">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};