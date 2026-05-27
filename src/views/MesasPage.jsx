import { useEffect, useState } from 'react';
import { getMesas, crearMesa, eliminarMesa, actualizarMesa } from '../api/mesas';
import { abrirMesa, enviarComanda, getCuenta, cerrarPedido, getListosPorPedido, cambiarEstadoPreparacion } from '../api/pedidos';
import { getProductosActivos } from '../api/productos';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────────────────────────
const IconMesa    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18"/></svg>;
const IconTrash   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const IconPlus    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IconUsers   = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconBell    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IconReceipt = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;

export const MesasPage = () => {
    // ── estado global ──────────────────────────────────────────────────────
    const [mesas, setMesas]               = useState([]);
    const [productos, setProductos]       = useState([]);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

    // modales
    const [showOpciones, setShowOpciones]   = useState(false);
    const [showMenu, setShowMenu]           = useState(false);
    const [showCuenta, setShowCuenta]       = useState(false);
    const [showListos, setShowListos]       = useState(false);
    const [showCrearMesa, setShowCrearMesa] = useState(false);
    const [showConfirmEliminar, setShowConfirmEliminar] = useState(null); // id de mesa
    const [showEditMesa, setShowEditMesa] = useState(null); // mesa object
    const [editForm, setEditForm] = useState({ Numero: '', Capacidad: '', Observaciones: '' });

    // datos de trabajo
    const [carrito, setCarrito]   = useState([]);
    const [cuentaData, setCuentaData] = useState(null);
    const [listosData, setListosData] = useState([]);

    // form nueva mesa
    const [formMesa, setFormMesa] = useState({ Numero: '', Capacidad: '', Observaciones: '' });
    const [guardandoMesa, setGuardandoMesa] = useState(false);

    // auth
    const rol       = localStorage.getItem('rol');
    const usuarioId = parseInt(localStorage.getItem('usuarioId') || '1');
    const esAdmin   = rol === 'Administrador';
    const esMesera  = rol === 'Mesera' || rol === 'Administrador';
    const esCajera  = rol === 'Cajera' || rol === 'Administrador';

    // ── carga inicial ──────────────────────────────────────────────────────
    const cargarDatos = async () => {
        try {
            const [m, p] = await Promise.all([getMesas(), getProductosActivos()]);
            setMesas(m);
            setProductos(p);
        } catch { toast.error('Error de conexión con el servidor'); }
    };

    useEffect(() => { cargarDatos(); }, []);

    // ── clic en mesa ───────────────────────────────────────────────────────
    const handleMesaClick = async (mesa) => {
        setMesaSeleccionada(mesa);

        if (mesa.estado === 'Libre') {
            if (!esMesera) return toast.error('Solo la mesera puede abrir una mesa');
            try {
                const pedidoId = await abrirMesa(mesa.id, usuarioId);
                setMesaSeleccionada({ ...mesa, pedidoActivoId: pedidoId });
                setCarrito([]);
                setShowMenu(true);
                cargarDatos();
            } catch (e) {
                toast.error(e.response?.data?.mensaje || 'No se pudo abrir la mesa');
            }
        } else {
            setShowOpciones(true);
        }
    };

    // ── acciones mesa ocupada ──────────────────────────────────────────────
    const handleAgregarMas = () => {
        setCarrito([]);
        setShowOpciones(false);
        setShowMenu(true);
    };

    const handleVerCuenta = async () => {
        try {
            const data = await getCuenta(mesaSeleccionada.pedidoActivoId);
            setCuentaData(data);
            setShowOpciones(false);
            setShowCuenta(true);
        } catch { toast.error('Error al cargar la cuenta'); }
    };

    const handleVerListos = async () => {
        try {
            const data = await getListosPorPedido(mesaSeleccionada.pedidoActivoId);
            setListosData(data);
            setShowOpciones(false);
            setShowListos(true);
        } catch { toast.error('Error al consultar platos listos'); }
    };

    const handleEntregarItem = async (detalleId) => {
        try {
            await cambiarEstadoPreparacion(detalleId, 'Entregado');
            toast.success('¡Plato entregado!');
            // Actualiza la lista removiendo el entregado
            setListosData(prev => prev.filter(i => i.detalleId !== detalleId));
        } catch { toast.error('Error al marcar como entregado'); }
    };

    // ── comanda ────────────────────────────────────────────────────────────
    const handleEnviarComanda = async () => {
        if (carrito.length === 0) return toast.error('El carrito está vacío');
        try {
            const items = carrito.map(i => ({
                ProductoId: i.id,
                Cantidad: i.cantidad,
                Notas: i.notas
            }));
            await enviarComanda(mesaSeleccionada.pedidoActivoId, items);
            toast.success('¡Comanda enviada a cocina/bar!');
            setShowMenu(false);
            cargarDatos();
        } catch (e) {
            toast.error(e.response?.data?.mensaje || 'Error al enviar comanda');
        }
    };

    // ── cierre ─────────────────────────────────────────────────────────────
    const handleCerrarMesa = async (metodo) => {
        try {
            await cerrarPedido(mesaSeleccionada.pedidoActivoId, metodo);
            toast.success('Mesa liberada y cobrada');
            setShowCuenta(false);
            cargarDatos();
        } catch (e) {
            toast.error(e.response?.data?.mensaje || 'Error al cerrar la mesa');
        }
    };

    // ── CRUD mesas (Admin) ─────────────────────────────────────────────────
    const handleCrearMesa = async (e) => {
        e.preventDefault();
        setGuardandoMesa(true);
        try {
            await crearMesa({
                Numero: parseInt(formMesa.Numero),
                Capacidad: parseInt(formMesa.Capacidad),
                Observaciones: formMesa.Observaciones || null
            });
            toast.success(`Mesa #${formMesa.Numero} creada`);
            setFormMesa({ Numero: '', Capacidad: '', Observaciones: '' });
            setShowCrearMesa(false);
            cargarDatos();
        } catch (e) {
            toast.error(e.response?.data?.mensaje || 'Error al crear la mesa');
        } finally { setGuardandoMesa(false); }
    };

    const handleEditarMesa = async () => {
        const num = parseInt(editForm.Numero);
        const cap = parseInt(editForm.Capacidad);
        if (isNaN(num) || num <= 0) return toast.error('Número inválido');
        if (isNaN(cap) || cap <= 0) return toast.error('Capacidad inválida');
        try {
            await actualizarMesa(showEditMesa.id, {
                Numero: num,
                Capacidad: cap,
                Observaciones: editForm.Observaciones || null
            });
            toast.success('Mesa actualizada');
            setShowEditMesa(null);
            cargarDatos();
        } catch (e) {
            toast.error(e.response?.data?.mensaje || 'Error al actualizar');
        }
    };

    const handleEliminarMesa = async (id) => {
        try {
            await eliminarMesa(id);
            toast.success('Mesa eliminada');
            setShowConfirmEliminar(null);
            cargarDatos();
        } catch (e) {
            toast.error(e.response?.data?.mensaje || 'No se puede eliminar (tiene pedidos activos)');
            setShowConfirmEliminar(null);
        }
    };

    // ── contadores ─────────────────────────────────────────────────────────
    const mesasLibres   = mesas.filter(m => m.estado === 'Libre').length;
    const mesasOcupadas = mesas.filter(m => m.estado !== 'Libre').length;

    const inputClass = "w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all text-sm";

    return (
        <div className="space-y-6">

            {/* ══ HEADER ══════════════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white">Mapa del Salón</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Selecciona una mesa para gestionar</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Contadores */}
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 font-bold text-sm">{mesasLibres} Libres</span>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-amber-400 font-bold text-sm">{mesasOcupadas} Ocupadas</span>
                    </div>
                    {/* Botón crear mesa — solo admin */}
                    {esAdmin && (
                        <button
                            onClick={() => setShowCrearMesa(true)}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20"
                        >
                            <IconPlus /> Nueva Mesa
                        </button>
                    )}
                </div>
            </div>

            {/* ══ GRILLA DE MESAS ═════════════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mesas.map(m => {
                    const libre = m.estado === 'Libre';
                    return (
                        <div key={m.id} className="relative group">
                            <button
                                onClick={() => handleMesaClick(m)}
                                className={`w-full relative p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl
                                    ${libre
                                        ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/20'
                                        : 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/20'
                                    }`}
                            >
                                {/* Badge estado */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5
                                        ${libre ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${libre ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                                        {m.estado}
                                    </span>
                                </div>
                                {/* Número */}
                                <div className={`text-4xl font-black mb-1 ${libre ? 'text-white' : 'text-amber-300'}`}>
                                    #{m.numero}
                                </div>
                                {/* Capacidad */}
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <IconUsers /> {m.capacidad} personas
                                </p>
                                {/* Observaciones */}
                                {m.observaciones && (
                                    <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px]" title={m.observaciones}>
                                        📍 {m.observaciones}
                                    </p>
                                )}
                                {/* Hora apertura / cierre */}
                                {m.horaApertura && (
                                    <p className="text-[10px] text-amber-400/70 mt-1 font-mono">
                                        ⏱ Abierta: {new Date(m.horaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                                {m.horaCierre && (
                                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                        🔒 Cerrada: {new Date(m.horaCierre).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </button>

                            {/* Botones admin en hover: renumerar + eliminar */}
                            {esAdmin && (
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowEditMesa(m); setEditForm({ Numero: String(m.numero), Capacidad: String(m.capacidad), Observaciones: m.observaciones || '' }); }}
                                        className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 hover:border-blue-400/50 rounded-lg flex items-center justify-center text-blue-400 transition-all"
                                        title="Editar mesa"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowConfirmEliminar(m.id); }}
                                        className="w-7 h-7 bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-400/50 rounded-lg flex items-center justify-center text-red-400 transition-all"
                                        title="Eliminar mesa"
                                    >
                                        <IconTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Placeholder si no hay mesas */}
                {mesas.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5">
                        <div className="text-5xl mb-4"><IconMesa /></div>
                        <p className="text-slate-400 font-semibold">No hay mesas registradas</p>
                        {esAdmin && (
                            <button onClick={() => setShowCrearMesa(true)} className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-bold underline underline-offset-2">
                                + Crear primera mesa
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ══ MODAL: OPCIONES MESA OCUPADA ════════════════════════════ */}
            {showOpciones && mesaSeleccionada && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-80 space-y-3">
                        <div className="text-center mb-5">
                            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl font-black text-amber-400">#{mesaSeleccionada.numero}</span>
                            </div>
                            <h2 className="font-black text-white text-lg">Mesa Ocupada</h2>
                            <p className="text-slate-500 text-sm">¿Qué deseas hacer?</p>
                        </div>

                        {/* Agregar más pedido — Mesera + Admin */}
                        {esMesera && (
                            <button onClick={handleAgregarMas}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                <IconPlus /> Agregar Pedido
                            </button>
                        )}

                        {/* Platos listos para entregar — Mesera + Admin */}
                        {esMesera && (
                            <button onClick={handleVerListos}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                                <IconBell /> Platos Listos para Entregar
                            </button>
                        )}

                        {/* Ver cuenta / cobrar — Cajera + Admin */}
                        {esCajera && (
                            <button onClick={handleVerCuenta}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                                <IconReceipt /> Ver Cuenta / Cobrar
                            </button>
                        )}

                        <button onClick={() => setShowOpciones(false)}
                            className="w-full text-slate-500 hover:text-slate-300 font-bold py-2 transition-colors text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* ══ MODAL: CARTA / MENÚ ════════════════════════════════════ */}
            {showMenu && mesaSeleccionada && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl flex overflow-hidden shadow-2xl border border-white/10">
                        {/* Carta */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-white/5">
                                <h2 className="text-xl font-black text-white">📋 Carta Digital</h2>
                                <p className="text-slate-400 text-sm">Mesa #{mesaSeleccionada.numero}</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {productos.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                const ex = carrito.find(i => i.id === p.id);
                                                if (ex) setCarrito(carrito.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
                                                else setCarrito([...carrito, { ...p, cantidad: 1, notas: '' }]);
                                            }}
                                            className="p-4 bg-slate-800 border border-white/5 rounded-2xl text-left hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group hover:scale-[1.02]"
                                        >
                                            <p className="font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors">{p.nombre}</p>
                                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.categoriaNombre}</p>
                                            <p className="text-amber-400 font-black text-lg mt-1">S/. {p.precio.toFixed(2)}</p>
                                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-emerald-400 font-bold">+ Agregar</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Comanda */}
                        <div className="w-72 bg-slate-950 border-l border-white/5 flex flex-col">
                            <div className="p-5 border-b border-white/5">
                                <h2 className="font-black text-white">🧾 Comanda</h2>
                                <p className="text-slate-500 text-xs mt-0.5">Mesa #{mesaSeleccionada.numero}</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {carrito.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <span className="text-4xl mb-3">🛒</span>
                                        <p className="text-slate-500 text-sm">Sin productos aún</p>
                                    </div>
                                ) : carrito.map(i => (
                                    <div key={i.id} className="bg-slate-900 p-3 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-white text-sm truncate mr-2 flex-1">{i.nombre}</span>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => {
                                                        if (i.cantidad === 1) setCarrito(carrito.filter(c => c.id !== i.id));
                                                        else setCarrito(carrito.map(c => c.id === i.id ? { ...c, cantidad: c.cantidad - 1 } : c));
                                                    }}
                                                    className="w-5 h-5 rounded-full bg-slate-700 hover:bg-red-500/50 text-white text-xs flex items-center justify-center transition-colors"
                                                >−</button>
                                                <span className="bg-amber-500/20 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full">×{i.cantidad}</span>
                                                <button
                                                    onClick={() => setCarrito(carrito.map(c => c.id === i.id ? { ...c, cantidad: c.cantidad + 1 } : c))}
                                                    className="w-5 h-5 rounded-full bg-slate-700 hover:bg-emerald-500/50 text-white text-xs flex items-center justify-center transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                        <input
                                            className="w-full text-xs mt-2 bg-transparent border-b border-white/10 text-slate-400 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors pb-0.5"
                                            placeholder="Notas especiales..."
                                            onChange={e => setCarrito(carrito.map(c => c.id === i.id ? { ...c, notas: e.target.value } : c))}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/5 space-y-2">
                                {carrito.length > 0 && (
                                    <div className="flex justify-between text-sm text-slate-400 mb-2 px-1">
                                        <span>{carrito.reduce((acc, i) => acc + i.cantidad, 0)} items</span>
                                        <span className="font-bold text-white">
                                            S/. {carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={handleEnviarComanda}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                                >
                                    Enviar a Cocina 🍳
                                </button>
                                <button onClick={() => setShowMenu(false)}
                                    className="w-full text-slate-500 hover:text-slate-300 font-bold py-2 transition-colors text-sm">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ MODAL: PLATOS LISTOS (Mesera entrega) ══════════════════ */}
            {showListos && mesaSeleccionada && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="font-black text-white text-xl flex items-center gap-2">
                                <span className="text-emerald-400"><IconBell /></span> Platos Listos
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Mesa #{mesaSeleccionada.numero} — listos para llevar a la mesa</p>
                        </div>
                        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                            {listosData.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-4xl mb-3">✅</p>
                                    <p className="text-slate-400 font-semibold">Todo entregado</p>
                                    <p className="text-slate-600 text-sm mt-1">No hay platos esperando</p>
                                </div>
                            ) : listosData.map(item => (
                                <div key={item.detalleId} className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-white">{item.producto}</p>
                                        <p className="text-xs text-emerald-400 font-mono mt-0.5">×{item.cantidad} · Listo ✓</p>
                                        {item.notas && <p className="text-xs text-slate-500 mt-0.5 italic">"{item.notas}"</p>}
                                    </div>
                                    <button
                                        onClick={() => handleEntregarItem(item.detalleId)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] whitespace-nowrap"
                                    >
                                        Entregar ✓
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/5">
                            <button onClick={() => setShowListos(false)}
                                className="w-full text-slate-500 hover:text-slate-300 font-bold py-2 transition-colors text-sm">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ MODAL: PRE-CUENTA Y COBRO ══════════════════════════════ */}
            {showCuenta && cuentaData && mesaSeleccionada && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md">
                        <div className="text-center mb-6">
                            <h2 className="font-black text-white text-2xl">🧾 Cuenta</h2>
                            <p className="text-slate-400 text-sm mt-1">Mesa #{mesaSeleccionada?.numero}</p>
                        </div>

                        <div className="bg-slate-950 rounded-2xl p-4 space-y-2 mb-4 max-h-52 overflow-y-auto">
                            {cuentaData.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                                    <span className="text-slate-300">{it.cantidad}× {it.nombre}</span>
                                    <span className="font-mono font-bold text-white">S/. {it.subtotal.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center py-4 border-t border-b border-white/10 mb-6">
                            <span className="font-black text-white text-lg">TOTAL</span>
                            <span className="font-black text-2xl text-amber-400">S/. {cuentaData.total.toFixed(2)}</span>
                        </div>

                        {esCajera && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Método de Pago</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleCerrarMesa('Efectivo')}
                                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 py-3.5 rounded-2xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                        💵 Efectivo
                                    </button>
                                    <button onClick={() => handleCerrarMesa('Tarjeta')}
                                        className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 py-3.5 rounded-2xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                        💳 Tarjeta
                                    </button>
                                    <button onClick={() => handleCerrarMesa('Yape/Plin')}
                                        className="col-span-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 py-3.5 rounded-2xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                        📱 Yape / Plin
                                    </button>
                                </div>
                            </div>
                        )}

                        <button onClick={() => setShowCuenta(false)}
                            className="w-full text-slate-500 hover:text-slate-300 font-bold py-3 mt-3 transition-colors text-sm">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* ══ MODAL: CREAR MESA (Admin) ═══════════════════════════════ */}
            {showCrearMesa && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm">
                        <h2 className="font-black text-white text-xl mb-6">➕ Nueva Mesa</h2>
                        <form onSubmit={handleCrearMesa} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Número de Mesa</label>
                                <input
                                    className={inputClass} type="number" min="1" required
                                    placeholder="Ej: 12"
                                    value={formMesa.Numero}
                                    onChange={e => setFormMesa({ ...formMesa, Numero: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Capacidad (personas)</label>
                                <input
                                    className={inputClass} type="number" min="1" required
                                    placeholder="Ej: 4"
                                    value={formMesa.Capacidad}
                                    onChange={e => setFormMesa({ ...formMesa, Capacidad: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Observaciones (opcional)</label>
                                <input
                                    className={inputClass}
                                    placeholder="Ej: Terraza, Cerca a la barra..."
                                    value={formMesa.Observaciones}
                                    onChange={e => setFormMesa({ ...formMesa, Observaciones: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCrearMesa(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={guardandoMesa}
                                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-3 rounded-xl font-black transition-all">
                                    {guardandoMesa ? 'Guardando...' : 'Crear Mesa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ MODAL: CONFIRMAR ELIMINAR (Admin) ══════════════════════ */}
            {showConfirmEliminar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-red-500/20 p-8 rounded-3xl shadow-2xl w-80 text-center">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🗑</span>
                        </div>
                        <h2 className="font-black text-white text-lg mb-2">¿Eliminar Mesa?</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Esta acción no se puede deshacer.<br/>
                            Solo puedes eliminar mesas sin pedidos activos.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmEliminar(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">
                                Cancelar
                            </button>
                            <button onClick={() => handleEliminarMesa(showConfirmEliminar)}
                                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-black transition-all">
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ MODAL: EDITAR MESA (Admin) ═══════════════════════════ */}
            {showEditMesa && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-blue-500/20 p-8 rounded-3xl shadow-2xl w-96">
                        <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <h2 className="font-black text-white text-lg mb-5 text-center">Editar Mesa #{showEditMesa.numero}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número de Mesa</label>
                                <input type="number" min="1" autoFocus
                                    className="w-full bg-slate-800 border border-white/10 text-white font-bold px-4 py-3 rounded-xl mt-1 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all"
                                    value={editForm.Numero}
                                    onChange={e => setEditForm({...editForm, Numero: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacidad (personas)</label>
                                <input type="number" min="1"
                                    className="w-full bg-slate-800 border border-white/10 text-white font-bold px-4 py-3 rounded-xl mt-1 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all"
                                    value={editForm.Capacidad}
                                    onChange={e => setEditForm({...editForm, Capacidad: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observaciones (opcional)</label>
                                <input type="text" placeholder="Ej: Cerca de la ventana, VIP..."
                                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl mt-1 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 transition-all text-sm"
                                    value={editForm.Observaciones}
                                    onChange={e => setEditForm({...editForm, Observaciones: e.target.value})} />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowEditMesa(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">
                                Cancelar
                            </button>
                            <button onClick={handleEditarMesa}
                                className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-black transition-all">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};