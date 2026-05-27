import { useEffect, useState } from 'react';
import { getProductos } from '../api/productos';
import { reabastecerProducto, getMovimientos } from '../api/stock';
import toast from 'react-hot-toast';

const TIPO_CONFIG = {
    Reabastecimiento: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '📦', border: 'border-emerald-500/20' },
    Venta:            { color: 'text-red-400',     bg: 'bg-red-500/10',     icon: '🛒', border: 'border-red-500/20' },
    Ajuste:           { color: 'text-blue-400',    bg: 'bg-blue-500/10',    icon: '🔧', border: 'border-blue-500/20' },
    Merma:            { color: 'text-orange-400',  bg: 'bg-orange-500/10',  icon: '⚠️', border: 'border-orange-500/20' },
};

export const ReabastecimientoPage = () => {
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [showModal, setShowModal] = useState(null); // producto seleccionado
    const [form, setForm] = useState({ Cantidad: '', Motivo: '' });
    const [tab, setTab] = useState('productos'); // 'productos' | 'historial'
    const [filterProducto, setFilterProducto] = useState('');
    const [loading, setLoading] = useState(true);

    const cargarProductos = async () => {
        try { setProductos(await getProductos()); }
        catch { toast.error("Error al cargar productos"); }
    };

    const cargarMovimientos = async () => {
        try { setMovimientos(await getMovimientos(null, 100)); }
        catch { toast.error("Error al cargar historial"); }
    };

    const cargar = async () => {
        setLoading(true);
        await Promise.all([cargarProductos(), cargarMovimientos()]);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const handleReabastecer = async () => {
        const cantidad = parseInt(form.Cantidad);
        if (!cantidad || cantidad <= 0) return toast.error("Ingrese una cantidad válida");
        if (!form.Motivo.trim()) return toast.error("Ingrese el motivo");

        try {
            await reabastecerProducto(showModal.id, { Cantidad: cantidad, Motivo: form.Motivo.trim() });
            toast.success(`+${cantidad} unidades a ${showModal.nombre}`);
            setShowModal(null);
            setForm({ Cantidad: '', Motivo: '' });
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al reabastecer"); }
    };

    // Productos con control de stock
    const productosStock = productos.filter(p => p.controlaStock);
    const filtrados = productosStock.filter(p =>
        p.nombre.toLowerCase().includes(filterProducto.toLowerCase())
    );

    const inputClass = "w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <span className="text-lg">📦</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Reabastecimiento</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-[52px]">Control y trazabilidad de inventario</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-900 p-1 rounded-2xl border border-white/5">
                    <button onClick={() => setTab('productos')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'productos' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-white'}`}>
                        📋 Productos
                    </button>
                    <button onClick={() => setTab('historial')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'historial' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-white'}`}>
                        📜 Historial
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-24"><span className="text-4xl animate-pulse">⏳</span></div>
            ) : tab === 'productos' ? (
                <>
                    {/* Buscador */}
                    <div className="flex gap-4">
                        <input type="text" placeholder="🔍 Buscar producto..." value={filterProducto}
                            onChange={e => setFilterProducto(e.target.value)}
                            className="flex-1 bg-slate-900 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none focus:border-blue-400/50 text-sm" />
                    </div>

                    {/* Alertas de stock bajo */}
                    {filtrados.filter(p => p.stockActual <= p.stockMinimo).length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-4">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> Stock Bajo — Requiere atención
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {filtrados.filter(p => p.stockActual <= p.stockMinimo).map(p => (
                                    <button key={p.id} onClick={() => { setShowModal(p); setForm({ Cantidad: '', Motivo: '' }); }}
                                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-sm hover:bg-red-500/20 transition-all">
                                        <span className="text-red-400 font-bold">{p.nombre}</span>
                                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md text-xs font-mono font-bold">{p.stockActual}/{p.stockMinimo}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grid de productos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtrados.map(p => {
                            const bajo = p.stockActual <= p.stockMinimo;
                            const critico = p.stockActual === 0;
                            return (
                                <div key={p.id}
                                    className={`group bg-slate-900/80 border rounded-3xl p-5 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 relative overflow-hidden
                                        ${critico ? 'border-red-500/30' : bajo ? 'border-orange-500/20' : 'border-white/5 hover:border-white/15'}`}>

                                    {critico && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />}

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-white text-sm">{p.nombre}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{p.categoriaNombre}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${p.areaDestino === 'Cocina' ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                            {p.areaDestino === 'Cocina' ? '🍳' : '🍹'} {p.areaDestino}
                                        </span>
                                    </div>

                                    {/* Barra de stock */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Stock</span>
                                            <span className={`font-black ${critico ? 'text-red-400' : bajo ? 'text-orange-400' : 'text-emerald-400'}`}>
                                                {p.stockActual} / {p.stockMinimo} mín
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500
                                                ${critico ? 'bg-red-500' : bajo ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min((p.stockActual / Math.max(p.stockMinimo * 3, 1)) * 100, 100)}%` }} />
                                        </div>
                                    </div>

                                    <button onClick={() => { setShowModal(p); setForm({ Cantidad: '', Motivo: '' }); }}
                                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2
                                            ${critico
                                                ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                                                : bajo
                                                    ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20'
                                                    : 'bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 opacity-0 group-hover:opacity-100'}`}>
                                        📦 Reabastecer
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                /* ── Tab Historial ── */
                <div className="bg-slate-900 rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-black text-white flex items-center gap-2">
                            <span className="text-blue-400">📜</span> Historial de Movimientos
                        </h2>
                        <span className="text-xs text-slate-500">{movimientos.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-950/50">
                                    <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Fecha</th>
                                    <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Hora</th>
                                    <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Producto</th>
                                    <th className="p-3 text-center text-[10px] uppercase text-slate-500 font-bold tracking-wider">Tipo</th>
                                    <th className="p-3 text-center text-[10px] uppercase text-slate-500 font-bold tracking-wider">Anterior</th>
                                    <th className="p-3 text-center text-[10px] uppercase text-slate-500 font-bold tracking-wider">Cambio</th>
                                    <th className="p-3 text-center text-[10px] uppercase text-slate-500 font-bold tracking-wider">Nuevo</th>
                                    <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Quién</th>
                                    <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Motivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {movimientos.length === 0 ? (
                                    <tr><td colSpan={9} className="p-12 text-center text-slate-500 italic">Sin movimientos registrados</td></tr>
                                ) : movimientos.map(m => {
                                    const tc = TIPO_CONFIG[m.tipoMovimiento] || TIPO_CONFIG.Ajuste;
                                    return (
                                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-3 text-slate-500 font-mono text-xs">{m.fechaMovimiento}</td>
                                            <td className="p-3 text-slate-500 font-mono text-xs">{m.horaMovimiento}</td>
                                            <td className="p-3 font-bold text-white">{m.productoNombre}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${tc.bg} ${tc.color} ${tc.border}`}>
                                                    {tc.icon} {m.tipoMovimiento}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-slate-400 font-mono">{m.cantidadAnterior}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-black font-mono ${m.diferencia > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {m.diferencia > 0 ? '+' : ''}{m.diferencia}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-white font-mono font-bold">{m.cantidadNueva}</td>
                                            <td className="p-3 text-slate-300 text-xs truncate max-w-[120px]">{m.usuarioNombre}</td>
                                            <td className="p-3 text-slate-500 text-xs truncate max-w-[200px]">{m.motivo || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Modal Reabastecer ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
                    <div className="bg-slate-900 border border-blue-500/20 rounded-3xl shadow-2xl w-[440px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">📦</div>
                                <div>
                                    <h2 className="font-black text-white text-lg">Reabastecer</h2>
                                    <p className="text-white/60 text-sm">{showModal.nombre}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                    <p className="text-white/50 text-[10px] uppercase tracking-widest">Stock Actual</p>
                                    <p className="text-white font-black text-lg">{showModal.stockActual}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                    <p className="text-white/50 text-[10px] uppercase tracking-widest">Mínimo</p>
                                    <p className="text-white font-black text-lg">{showModal.stockMinimo}</p>
                                </div>
                                {form.Cantidad && parseInt(form.Cantidad) > 0 && (
                                    <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                        <p className="text-emerald-300/60 text-[10px] uppercase tracking-widest">Nuevo</p>
                                        <p className="text-emerald-300 font-black text-lg">{showModal.stockActual + parseInt(form.Cantidad)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-7 space-y-4">
                            <div>
                                <label className={labelClass}>Cantidad a Agregar</label>
                                <input className={inputClass} type="number" min="1" placeholder="Ej: 50"
                                    value={form.Cantidad} onChange={e => setForm({...form, Cantidad: e.target.value})} autoFocus />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Motivo del Reabastecimiento
                                    <span className="text-red-400 ml-1">*</span>
                                </label>
                                <textarea className={inputClass + " resize-none"} rows={3}
                                    placeholder="Ej: Compra a proveedor X, Factura #123..."
                                    value={form.Motivo} onChange={e => setForm({...form, Motivo: e.target.value})} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(null)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">
                                    Cancelar
                                </button>
                                <button onClick={handleReabastecer}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-blue-500/20">
                                    Confirmar Reabastecimiento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
