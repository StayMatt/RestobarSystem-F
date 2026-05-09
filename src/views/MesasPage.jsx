import { useEffect, useState } from 'react';
import { getMesas, eliminarMesa } from '../api/mesas';
import { abrirMesa, enviarComanda, getCuenta, cerrarPedido } from '../api/pedidos';
import { getProductosActivos } from '../api/productos';
import toast from 'react-hot-toast';

export const MesasPage = () => {
    // --- ESTADOS ---
    const [mesas, setMesas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    
    // Modales
    const [showMenu, setShowMenu] = useState(false);
    const [showOpciones, setShowOpciones] = useState(false);
    const [showCuenta, setShowCuenta] = useState(false);
    
    // Datos de trabajo
    const [carrito, setCarrito] = useState([]);
    const [cuentaData, setCuentaData] = useState(null);

    const rol = localStorage.getItem('rol');
    const usuarioId = parseInt(localStorage.getItem('usuarioId') || '1');

    const cargarDatos = async () => {
        try {
            const [m, p] = await Promise.all([getMesas(), getProductosActivos()]);
            setMesas(m);
            setProductos(p);
        } catch (e) { toast.error("Error de conexión"); }
    };

    useEffect(() => { cargarDatos(); }, []);

    // --- LÓGICA DE CLIC EN MESA ---
    const handleMesaClick = async (mesa) => {
        if (mesa.estado === 'Libre') {
            // FLUJO A: ABRIR MESA
            try {
                const pedidoId = await abrirMesa(mesa.id, usuarioId);
                setMesaSeleccionada({ ...mesa, pedidoActivoId: pedidoId });
                setCarrito([]);
                setShowMenu(true);
                cargarDatos();
            } catch (e) { toast.error("No se pudo abrir la mesa"); }
        } else {
            // FLUJO B: MESA OCUPADA (Usa el PedidoActivoId que agregamos al DTO)
            setMesaSeleccionada(mesa);
            setShowOpciones(true);
        }
    };

    // --- ACCIONES MESA OCUPADA ---
    const handleVerCuenta = async () => {
        try {
            const data = await getCuenta(mesaSeleccionada.pedidoActivoId);
            setCuentaData(data);
            setShowOpciones(false);
            setShowCuenta(true);
        } catch (e) { toast.error("Error al cargar la cuenta"); }
    };

    const handleAgregarMas = () => {
        setCarrito([]);
        setShowOpciones(false);
        setShowMenu(true);
    };

    // --- FINALIZAR PROCESOS ---
    const handleEnviarComanda = async () => {
        if (carrito.length === 0) return toast.error("Carrito vacío");
        try {
            const items = carrito.map(i => ({ ProductoId: i.id, Cantidad: i.cantidad, Notas: i.notas }));
            await enviarComanda(mesaSeleccionada.pedidoActivoId, items);
            toast.success("Comanda enviada");
            setShowMenu(false);
            cargarDatos();
        } catch (e) { toast.error("Error al enviar pedido"); }
    };

    const handleCerrarMesa = async (metodo) => {
        try {
            await cerrarPedido(mesaSeleccionada.pedidoActivoId, metodo);
            toast.success("Mesa liberada");
            setShowCuenta(false);
            cargarDatos();
        } catch (e) { toast.error("Error al cerrar caja"); }
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-black text-slate-800">📍 Salón "El Galán"</h1>

            {/* GRILLA DE MESAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {mesas.map(m => (
                    <div key={m.id} onClick={() => handleMesaClick(m)} 
                         className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all hover:scale-105 shadow-sm ${m.estado === 'Libre' ? 'bg-white border-green-500 text-slate-700' : 'bg-orange-500 border-orange-600 text-white'}`}>
                        <div className="flex justify-between font-black text-2xl">
                            #{m.numero}
                            <span className="text-[10px] uppercase">{m.estado}</span>
                        </div>
                        <p className="text-xs font-bold mt-2 opacity-80">Capacidad: {m.capacidad}</p>
                        {m.horaApertura && <p className="text-[10px] mt-1 bg-black/10 rounded px-1 w-fit">Desde: {new Date(m.horaApertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                    </div>
                ))}
            </div>

            {/* MODAL 1: OPCIONES MESA OCUPADA */}
            {showOpciones && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-80 space-y-4">
                        <h2 className="text-center font-black text-xl">Mesa #{mesaSeleccionada.numero}</h2>
                        <button onClick={handleAgregarMas} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700">➕ Agregar Pedido</button>
                        <button onClick={handleVerCuenta} className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200">🧾 Ver Cuenta / Cobrar</button>
                        <button onClick={() => setShowOpciones(false)} className="w-full text-slate-400 font-bold py-2">Cancelar</button>
                    </div>
                </div>
            )}

            {/* MODAL 2: MENÚ / CARTA (Para abrir o agregar más) */}
            {showMenu && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-[2.5rem] flex overflow-hidden shadow-2xl">
                        <div className="flex-1 p-8 overflow-y-auto">
                            <h2 className="text-2xl font-black mb-6">Carta Digital</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {productos.map(p => (
                                    <button key={p.id} onClick={() => {
                                        const ex = carrito.find(i=>i.id===p.id);
                                        if(ex) setCarrito(carrito.map(i=>i.id===p.id?{...i, cantidad: i.cantidad+1}:i));
                                        else setCarrito([...carrito, { ...p, cantidad: 1, notas: "" }]);
                                    }} className="p-4 border-2 rounded-2xl text-left hover:border-blue-500 transition">
                                        <p className="font-bold truncate">{p.nombre}</p>
                                        <p className="text-blue-600 font-black">S/. {p.precio.toFixed(2)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-80 bg-slate-50 p-6 border-l flex flex-col">
                            <h2 className="font-black text-lg mb-4">Comanda Mesa #{mesaSeleccionada.numero}</h2>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {carrito.map(i => (
                                    <div key={i.id} className="bg-white p-3 rounded-xl border text-sm">
                                        <div className="flex justify-between font-bold"><span>{i.nombre}</span><span>x{i.cantidad}</span></div>
                                        <input className="w-full text-[10px] mt-1 border-b" placeholder="Notas..." onChange={e=>setCarrito(carrito.map(c=>c.id===i.id?{...c, notas: e.target.value}:c))}/>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleEnviarComanda} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black mt-4">ENVIAR A COCINA</button>
                            <button onClick={() => setShowMenu(false)} className="w-full text-slate-400 mt-2 font-bold">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: PRE-CUENTA Y CIERRE */}
            {showCuenta && cuentaData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md">
                        <h2 className="text-center font-black text-2xl mb-6">Detalle de Cuenta</h2>
                        <div className="space-y-3 mb-6 border-y py-4">
                            {cuentaData.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{it.cantidad}x {it.nombre}</span>
                                    <span className="font-mono">S/. {it.subtotal.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-black text-xl pt-4 border-t">
                                <span>TOTAL</span>
                                <span>S/. {cuentaData.total.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {(rol === 'Administrador' || rol === 'Cajera') && (
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleCerrarMesa("Efectivo")} className="bg-green-600 text-white py-3 rounded-xl font-bold">💵 Efectivo</button>
                                <button onClick={() => handleCerrarMesa("Tarjeta")} className="bg-blue-600 text-white py-3 rounded-xl font-bold">💳 Tarjeta</button>
                                <button onClick={() => handleCerrarMesa("Yape/Plin")} className="bg-purple-600 text-white py-3 rounded-xl font-bold col-span-2">📱 Yape / Plin</button>
                            </div>
                        )}
                        <button onClick={() => setShowCuenta(false)} className="w-full text-slate-400 mt-4 font-bold">Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};