import { useEffect, useState } from 'react';
import { getPendientesPorArea, cambiarEstadoPreparacion } from '../api/pedidos';
import toast from 'react-hot-toast';

// Badge de estado con color
const EstadoBadge = ({ estado }) => {
    const cfg = {
        'Recibido':   { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/20',    dot: 'bg-blue-400',    label: '📥 Recibido' },
        'Preparando': { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/20', dot: 'bg-orange-400 animate-pulse', label: '🔥 Preparando' },
        'Listo':      { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', label: '✅ Listo' },
    };
    const s = cfg[estado] ?? cfg['Recibido'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

export const PedidosPage = () => {
    const [area, setArea]           = useState('Cocina');
    const [pendientes, setPendientes] = useState([]);
    const [sinAcceso, setSinAcceso]   = useState(false);
    const [cargando, setCargando]     = useState(false);

    const isCocina = area === 'Cocina';

    const cargarPendientes = async () => {
        try {
            const data = await getPendientesPorArea(area);
            setPendientes(data);
            setSinAcceso(false);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setSinAcceso(true);
            }
        }
    };

    // Auto-recarga cada 5 segundos — KDS en tiempo real
    useEffect(() => {
        cargarPendientes();
        const intervalo = setInterval(cargarPendientes, 5000);
        return () => clearInterval(intervalo);
    }, [area]);

    // Cambiar estado de un ítem: Recibido → Preparando → Listo
    const handleCambiarEstado = async (detalleId, nuevoEstado) => {
        setCargando(true);
        try {
            await cambiarEstadoPreparacion(detalleId, nuevoEstado);
            const labels = { Preparando: '🔥 Marcado en preparación', Listo: '✅ Marcado como Listo' };
            toast.success(labels[nuevoEstado] || 'Estado actualizado');
            cargarPendientes();
        } catch (error) {
            toast.error(error.response?.data?.mensaje || 'Error al actualizar estado');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                        ${isCocina ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                        {isCocina ? '🍳' : '🍹'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">
                            Monitor de {isCocina ? 'Cocina' : 'Bar'}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            {!sinAcceso && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                            <p className="text-slate-400 text-xs font-medium">
                                {sinAcceso ? 'Sin acceso' : 'En vivo · Actualiza cada 5s'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selector de área */}
                <div className="flex bg-slate-900 border border-white/10 p-1 rounded-2xl gap-1">
                    <button
                        onClick={() => setArea('Cocina')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                            ${area === 'Cocina'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'text-slate-400 hover:text-white'}`}
                    >
                        🍳 Cocina
                    </button>
                    <button
                        onClick={() => setArea('Bar')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                            ${area === 'Bar'
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-400 hover:text-white'}`}
                    >
                        🍹 Bar
                    </button>
                </div>
            </div>

            {/* Sin acceso */}
            {sinAcceso && (
                <div className="text-center py-24 bg-slate-900/50 border border-red-500/10 rounded-3xl">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-xl font-black text-slate-300">Sin permiso para esta pantalla</p>
                    <p className="text-slate-500 mt-2 text-sm">
                        El monitor KDS solo está disponible para<br />
                        <span className="text-amber-400 font-bold">Administrador · Cocinero · Bartender</span>
                    </p>
                </div>
            )}

            {/* Contador */}
            {!sinAcceso && pendientes.length > 0 && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border
                    ${isCocina
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                    <span className="text-xl font-black">{pendientes.length}</span>
                    pedido{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Grid de tickets KDS */}
            {!sinAcceso && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {pendientes.length === 0 ? (
                        <div className="col-span-full py-24 text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <p className="text-2xl font-black text-slate-300">¡Todo al día!</p>
                            <p className="text-slate-500 mt-2 text-sm">Esperando nuevas comandas...</p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-400 text-xs font-semibold">Sistema activo</span>
                            </div>
                        </div>
                    ) : pendientes.map(ticket => (
                        <div
                            key={ticket.detalleId}
                            className={`group bg-slate-900 rounded-3xl border overflow-hidden flex flex-col transition-all hover:shadow-xl
                                ${ticket.estado === 'Preparando'
                                    ? 'border-orange-500/30 hover:shadow-orange-500/10'
                                    : 'border-white/5 hover:shadow-white/5'}`}
                        >
                            {/* Tira superior de color según estado */}
                            <div className={`h-1.5 w-full ${ticket.estado === 'Preparando' ? 'bg-orange-500' : 'bg-blue-500'}`} />

                            {/* Header del ticket */}
                            <div className={`p-4 border-b border-white/5 flex justify-between items-start
                                ${ticket.estado === 'Preparando' ? 'bg-orange-500/5' : ''}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-2xl font-black ${isCocina ? 'text-orange-400' : 'text-blue-400'}`}>
                                            Mesa {ticket.mesa}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono">⏱ {ticket.hora}</p>
                                </div>
                                <EstadoBadge estado={ticket.estado} />
                            </div>

                            {/* Cuerpo: producto */}
                            <div className="p-5 flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-black text-white text-lg leading-tight">{ticket.producto}</p>
                                        {ticket.notas && (
                                            <p className="text-xs text-amber-400/80 mt-1 italic bg-amber-500/5 border border-amber-500/10 rounded-lg px-2 py-1">
                                                💬 {ticket.notas}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`ml-3 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0
                                        ${isCocina ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        ×{ticket.cantidad}
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción según estado */}
                            <div className="p-4 pt-0 space-y-2">
                                {ticket.estado === 'Recibido' && (
                                    <>
                                        {/* Paso 1: Marcar En Preparación */}
                                        <button
                                            disabled={cargando}
                                            onClick={() => handleCambiarEstado(ticket.detalleId, 'Preparando')}
                                            className="w-full bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-orange-400 text-orange-400 hover:text-white py-3 rounded-2xl font-bold tracking-wide transition-all duration-200 text-sm"
                                        >
                                            🔥 En Preparación
                                        </button>
                                        {/* Paso alternativo: Listo directo */}
                                        <button
                                            disabled={cargando}
                                            onClick={() => handleCambiarEstado(ticket.detalleId, 'Listo')}
                                            className="w-full bg-slate-800 hover:bg-emerald-500 border border-white/5 hover:border-emerald-400 text-slate-400 hover:text-white py-3 rounded-2xl font-bold tracking-wide transition-all duration-200 text-sm"
                                        >
                                            ✓ Listo
                                        </button>
                                    </>
                                )}
                                {ticket.estado === 'Preparando' && (
                                    /* Paso 2: Marcar Listo */
                                    <button
                                        disabled={cargando}
                                        onClick={() => handleCambiarEstado(ticket.detalleId, 'Listo')}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-black tracking-widest transition-all duration-200 uppercase text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                                    >
                                        ✓ Marcar como Listo
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};