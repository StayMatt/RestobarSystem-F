import { useEffect, useState } from 'react';
import { getResumenCaja, getTopProductos } from '../api/caja';
import toast from 'react-hot-toast';

const METODO_ICONS = { Efectivo: '💵', Tarjeta: '💳', 'Yape/Plin': '📱' };
const METODO_COLORS = {
    Efectivo:   { card: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    Tarjeta:    { card: 'from-blue-500/20 to-blue-500/5',      text: 'text-blue-400',    border: 'border-blue-500/20' },
    'Yape/Plin':{ card: 'from-purple-500/20 to-purple-500/5',  text: 'text-purple-400',  border: 'border-purple-500/20' },
};

// Helper: fecha local en formato YYYY-MM-DD
const localDate = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Periodos predefinidos
const getPeriodos = () => {
    const hoy = new Date();
    const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
    const inicioSemana = new Date(); inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    return [
        { key: 'hoy',    label: 'Hoy',         icon: '📅', desde: localDate(hoy),          hasta: localDate(hoy) },
        { key: 'ayer',   label: 'Ayer',         icon: '⏪', desde: localDate(ayer),          hasta: localDate(ayer) },
        { key: 'semana', label: 'Esta Semana',  icon: '📊', desde: localDate(inicioSemana),  hasta: localDate(hoy) },
        { key: 'mes',    label: 'Este Mes',     icon: '📈', desde: localDate(inicioMes),     hasta: localDate(hoy) },
    ];
};

export const CajaPage = () => {
    const [resumen, setResumen] = useState(null);
    const [topProductos, setTopProductos] = useState([]);
    const [periodo, setPeriodo] = useState('hoy');
    const [customDesde, setCustomDesde] = useState(localDate());
    const [customHasta, setCustomHasta] = useState(localDate());
    const [loading, setLoading] = useState(true);

    const periodos = getPeriodos();

    const getRango = () => {
        if (periodo === 'custom') return { desde: customDesde, hasta: customHasta };
        const p = periodos.find(p => p.key === periodo);
        return p ? { desde: p.desde, hasta: p.hasta } : { desde: localDate(), hasta: localDate() };
    };

    const cargar = async () => {
        setLoading(true);
        try {
            const { desde, hasta } = getRango();
            const [r, tp] = await Promise.all([getResumenCaja(desde, hasta), getTopProductos(desde, hasta)]);
            setResumen(r);
            setTopProductos(tp);
        } catch { toast.error("Error al cargar datos de caja"); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargar(); }, [periodo, customDesde, customHasta]);

    const periodoActual = periodos.find(p => p.key === periodo);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <span className="text-lg">💰</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Caja</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-[52px]">
                        {periodoActual ? `${periodoActual.icon} ${periodoActual.label}` : '📆 Personalizado'} — {resumen?.fecha || ''}
                    </p>
                </div>
            </div>

            {/* Tabs de periodo */}
            <div className="flex flex-wrap items-center gap-2">
                {periodos.map(p => (
                    <button key={p.key} onClick={() => setPeriodo(p.key)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2
                            ${periodo === p.key
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                                : 'bg-slate-900 text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'}`}>
                        <span>{p.icon}</span> {p.label}
                    </button>
                ))}
                <button onClick={() => setPeriodo('custom')}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2
                        ${periodo === 'custom'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-900 text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'}`}>
                    🔍 Personalizado
                </button>

                {periodo === 'custom' && (
                    <div className="flex items-center gap-2 ml-2">
                        <input type="date" value={customDesde} onChange={e => setCustomDesde(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-white px-3 py-2 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-400/50" />
                        <span className="text-slate-500 text-sm">→</span>
                        <input type="date" value={customHasta} onChange={e => setCustomHasta(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-white px-3 py-2 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-400/50" />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-center py-24"><span className="text-4xl animate-pulse">⏳</span></div>
            ) : (
                <>
                    {/* Cards principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Total ventas */}
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Total Ventas</p>
                            <p className="text-3xl font-black text-white">S/. {resumen?.totalVentas?.toFixed(2) || '0.00'}</p>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <span className="bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded-md">{resumen?.totalPedidos || 0}</span>
                                pedidos cerrados
                            </p>
                        </div>

                        {/* Por método de pago */}
                        {[
                            { key: 'Efectivo', total: resumen?.totalEfectivo },
                            { key: 'Tarjeta', total: resumen?.totalTarjeta },
                            { key: 'Yape/Plin', total: resumen?.totalYape },
                        ].map(m => {
                            const c = METODO_COLORS[m.key];
                            const pct = resumen?.totalVentas > 0 ? ((m.total || 0) / resumen.totalVentas * 100).toFixed(0) : 0;
                            return (
                                <div key={m.key} className={`bg-gradient-to-br ${c.card} border ${c.border} rounded-3xl p-6 relative overflow-hidden`}>
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/[0.03] rounded-full blur-xl" />
                                    <p className={`text-[10px] font-bold ${c.text} uppercase tracking-widest mb-1`}>{METODO_ICONS[m.key]} {m.key}</p>
                                    <p className="text-2xl font-black text-white">S/. {(m.total || 0).toFixed(2)}</p>
                                    {resumen?.totalVentas > 0 && (
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${m.key === 'Efectivo' ? 'bg-emerald-400' : m.key === 'Tarjeta' ? 'bg-blue-400' : 'bg-purple-400'}`}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1">{pct}% del total</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tabla de ventas */}
                        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-white/5 overflow-hidden">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <h2 className="font-black text-white flex items-center gap-2">
                                    <span className="text-emerald-400">🧾</span> Detalle de Ventas
                                </h2>
                                <span className="text-xs text-slate-600">{resumen?.ventas?.length || 0} registros</span>
                            </div>
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-sm">
                                        <tr className="border-b border-white/5">
                                            <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">#</th>
                                            <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Mesa</th>
                                            <th className="p-3 text-left text-[10px] uppercase text-slate-500 font-bold tracking-wider">Atendió</th>
                                            <th className="p-3 text-center text-[10px] uppercase text-slate-500 font-bold tracking-wider">Pago</th>
                                            <th className="p-3 text-center text-[10px] uppercase text-slate-500 font-bold tracking-wider">Cierre</th>
                                            <th className="p-3 text-right text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(!resumen?.ventas || resumen.ventas.length === 0) ? (
                                            <tr><td colSpan={6} className="p-16 text-center">
                                                <div className="text-4xl mb-3">📭</div>
                                                <p className="text-slate-400 font-bold">Sin ventas en este periodo</p>
                                                <p className="text-slate-600 text-xs mt-1">Intenta seleccionar otro rango de fechas</p>
                                            </td></tr>
                                        ) : resumen.ventas.map(v => (
                                            <tr key={v.pedidoId} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-3 text-slate-600 font-mono text-xs">#{v.pedidoId}</td>
                                                <td className="p-3 font-bold text-white">Mesa {v.mesaNumero}</td>
                                                <td className="p-3 text-slate-400 truncate max-w-[140px]">{v.mesera}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${METODO_COLORS[v.metodoPago]?.text || 'text-slate-400'} ${METODO_COLORS[v.metodoPago]?.border || 'border-white/10'} border bg-white/5`}>
                                                        {METODO_ICONS[v.metodoPago] || '💲'} {v.metodoPago}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-slate-500 font-mono text-xs">{v.horaCierre}</td>
                                                <td className="p-3 text-right font-black text-amber-400">S/. {v.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top productos */}
                        <div className="bg-slate-900 rounded-3xl border border-white/5 overflow-hidden">
                            <div className="p-5 border-b border-white/5">
                                <h2 className="font-black text-white flex items-center gap-2">
                                    <span className="text-amber-400">🏆</span> Más Vendidos
                                </h2>
                            </div>
                            <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                                {topProductos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-3xl mb-2">🍽️</div>
                                        <p className="text-slate-500 text-sm italic">Sin datos en este periodo</p>
                                    </div>
                                ) : topProductos.map((p, idx) => {
                                    const maxQty = topProductos[0]?.cantidadVendida || 1;
                                    return (
                                        <div key={idx} className="group p-3 rounded-2xl hover:bg-white/[0.03] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0
                                                    ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-slate-500/20 text-slate-300' : idx === 2 ? 'bg-orange-800/20 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                                                    {idx + 1}°
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-white text-sm truncate">{p.nombre}</p>
                                                        <p className="font-mono font-bold text-emerald-400 text-sm flex-shrink-0 ml-2">S/. {p.totalRecaudado.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${idx === 0 ? 'bg-amber-400' : 'bg-slate-600'}`}
                                                                style={{ width: `${(p.cantidadVendida / maxQty) * 100}%` }} />
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{p.cantidadVendida} uds</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
