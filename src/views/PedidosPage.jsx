import { useEffect, useState } from 'react';
import { getPendientesPorArea, cambiarEstadoPreparacion } from '../api/pedidos';
import toast from 'react-hot-toast';

export const PedidosPage = () => {
    const [area, setArea] = useState('Cocina'); // Por defecto arranca en Cocina
    const [pendientes, setPendientes] = useState([]);

    const cargarPendientes = async () => {
        try {
            const data = await getPendientesPorArea(area);
            setPendientes(data);
        } catch (error) {
            console.error("Error al cargar KDS:", error);
        }
    };

    // Auto-recarga cada 5 segundos para que la cocina vea nuevos pedidos al instante
    useEffect(() => {
        cargarPendientes();
        const intervalo = setInterval(cargarPendientes, 5000);
        return () => clearInterval(intervalo);
    }, [area]);

    const handleMarcarListo = async (detalleId) => {
        try {
            // Mandamos el estado exacto "Listo" como espera el sistema
            await cambiarEstadoPreparacion(detalleId, "Listo");
            toast.success("¡Plato/Bebida marcado como Listo!");
            cargarPendientes(); // Recargamos para que desaparezca de la pantalla
        } catch (error) {
            const mensajeError = error.response?.data?.mensaje || "Error al actualizar estado";
            toast.error(mensajeError);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* CABECERA DEL MONITOR */}
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-black text-white ml-4 flex items-center gap-3">
                    {area === 'Cocina' ? '🍳 Monitor de Cocina' : '🍹 Monitor de Bar'}
                </h1>
                
                {/* SELECTOR DE ÁREA */}
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setArea('Cocina')} 
                        className={`px-8 py-2 rounded-lg font-bold transition-all ${
                            area === 'Cocina' 
                            ? 'bg-orange-500 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Cocina
                    </button>
                    <button 
                        onClick={() => setArea('Bar')} 
                        className={`px-8 py-2 rounded-lg font-bold transition-all ${
                            area === 'Bar' 
                            ? 'bg-blue-500 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Bar
                    </button>
                </div>
            </div>

            {/* CUADRÍCULA DE TICKETS (PENDIENTES) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendientes.length === 0 ? (
                    <div className="col-span-full mt-10 p-12 text-center border-4 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-2xl font-bold text-slate-400">Todo limpio por ahora.</p>
                        <p className="text-slate-500 mt-2">Esperando nuevas comandas...</p>
                    </div>
                ) : (
                    pendientes.map(ticket => (
                        // Las variables de 'ticket' coinciden con el PendienteKDSDTO
                        <div 
                            key={ticket.detalleId} 
                            className={`bg-white rounded-3xl shadow-sm flex flex-col justify-between border-t-8 ${
                                area === 'Cocina' ? 'border-orange-500' : 'border-blue-500'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                                    <span className="bg-slate-100 text-slate-800 px-4 py-1.5 rounded-xl font-black text-sm">
                                        MESA {ticket.mesa}
                                    </span>
                                    <span className="text-slate-400 font-bold text-xs bg-slate-50 px-2 py-1 rounded-md">
                                        ⏱ {ticket.hora}
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-800 leading-tight">
                                    <span className="text-blue-600 mr-2">{ticket.cantidad}x</span> 
                                    {ticket.producto}
                                </h3>
                                
                                {ticket.notas && (
                                    <div className="mt-4 bg-yellow-50/50 border border-yellow-200 p-3 rounded-xl">
                                        <p className="text-yellow-800 text-sm font-medium italic">
                                            📝 {ticket.notas}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 pt-0">
                                <button 
                                    onClick={() => handleMarcarListo(ticket.detalleId)} 
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black tracking-widest hover:bg-green-500 transition-colors uppercase text-sm shadow-md"
                                >
                                    Terminado
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};