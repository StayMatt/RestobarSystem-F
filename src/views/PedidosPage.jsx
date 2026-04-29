import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategorias } from "../api/categorias";
import { getProductosActivos } from "../api/productos";
import { abrirPedido, enviarComanda } from "../api/pedidos";
import toast from "react-hot-toast";

export function PedidosPage() {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [catSeleccionada, setCatSeleccionada] = useState(null);
  
  // Estados de Pedido
  const [pedidoId, setPedidoId] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar Categorías, Productos y Vincular Pedido
  useEffect(() => {
    const inicializarDatos = async () => {
      setLoading(true);
      try {
        const [resCat, resProd] = await Promise.all([
          getCategorias(),
          getProductosActivos()
        ]);
        setCategorias(resCat.data);
        setProductos(resProd.data);
        if (resCat.data.length > 0) setCatSeleccionada(resCat.data[0].id);

        // Intentar abrir la mesa (Si ya está ocupada, el controlador dará error)
        // Pero necesitamos el pedidoId para trabajar.
        try {
            const resPedido = await abrirPedido(mesaId);
            setPedidoId(resPedido.data.pedidoId);
        } catch (err) {
            // Si el error es porque la mesa ya está ocupada, 
            // aquí deberías tener un endpoint GET /api/Pedidos/mesa/{id}
            // Por ahora, si falla, asumimos que estamos en flujo de apertura.
            console.error("Aviso: Mesa ya abierta o error de apertura");
        }

      } catch (error) {
        toast.error("Error al cargar la configuración de ventas");
      } finally {
        setLoading(false);
      }
    };

    if (mesaId) inicializarDatos();
  }, [mesaId]);

  // 2. Lógica del Carrito
  const agregarAlCarrito = (producto) => {
    // Verificamos si ya está para sumar cantidad o agregarlo
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1, notas: "" }]);
    }
    toast.success(`${producto.nombre} agregado`);
  };

  const eliminarDelCarrito = (tempId) => {
    setCarrito(carrito.filter((_, index) => index !== tempId));
  };

  // 3. Enviar a Cocina/Bar (POST api/Pedidos/comanda)
  const handleEnviarComanda = async () => {
    if (carrito.length === 0) return toast.error("El carrito está vacío");
    if (!pedidoId) return toast.error("No hay un pedido activo para esta mesa");

    try {
      // Estructuramos según EnviarComandaDTO e ItemComandaDTO
      const payload = {
        pedidoId: pedidoId,
        items: carrito.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad,
          notas: item.notas
        }))
      };

      await enviarComanda(payload);
      toast.success("Comanda enviada a producción");
      setCarrito([]); // Limpiar carrito local
    } catch (error) {
      const errorMsg = error.response?.data || "Error al enviar comanda";
      toast.error(errorMsg);
    }
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Cargando Menú...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      
      {/* PANEL IZQUIERDO: SELECCIÓN */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Categorías */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCatSeleccionada(cat.id)}
              className={`px-6 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
                catSeleccionada === cat.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {productos
            .filter(p => p.categoriaId === catSeleccionada)
            .map(p => (
              <button
                key={p.id}
                onClick={() => agregarAlCarrito(p)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[120px] group"
              >
                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.nombre}</span>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{p.areaDestino}</span>
                  <span className="text-emerald-600 font-black text-lg">S/ {p.precio.toFixed(2)}</span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* PANEL DERECHO: TICKET / CARRITO */}
      <div className="w-full lg:w-96 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Mesa {mesaId}</h3>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded-md">ID Pedido: #{pedidoId || '...'}</span>
          </div>
          <p className="text-slate-400 text-xs mt-1 italic text-blue-200">Tomando orden...</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {carrito.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-800 text-sm">{item.nombre}</span>
                <button onClick={() => eliminarDelCarrito(index)} className="text-red-400 hover:text-red-600 text-xs">Quitar</button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">x{item.cantidad}</span>
                  <input 
                    type="text" 
                    placeholder="Notas..." 
                    className="text-[10px] border-b border-slate-200 focus:outline-none w-24 bg-transparent"
                    onChange={(e) => {
                       const newCarrito = [...carrito];
                       newCarrito[index].notas = e.target.value;
                       setCarrito(newCarrito);
                    }}
                  />
                </div>
                <span className="font-bold text-slate-700 text-sm">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {carrito.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300 opacity-60">
              <span className="text-6xl mb-4">✍️</span>
              <p className="font-bold">Selecciona productos</p>
            </div>
          )}
        </div>

        {/* Footer del Ticket */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total a enviar</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">S/ {totalCarrito.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <button
              disabled={carrito.length === 0}
              onClick={handleEnviarComanda}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              🚀 ENVIAR A COCINA
            </button>
            <button
               onClick={() => navigate('/mesas')}
               className="w-full py-3 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
            >
              Volver a Mesas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}