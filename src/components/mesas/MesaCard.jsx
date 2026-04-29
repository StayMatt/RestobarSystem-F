// src/components/MesaCard.jsx
export function MesaCard({ mesa, onToggle, onDelete }) {
  const isLibre = mesa.estado === "Libre";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Capacidad: 4 pers.</span>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mesa {mesa.numero}</h3>
        </div>
        {/* Indicador de estado */}
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isLibre ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isLibre ? "bg-emerald-500" : "bg-orange-500 animate-pulse"}`}></span>
          {mesa.estado.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onToggle(mesa)}
          className={`py-2.5 rounded-xl font-semibold text-sm transition-all border ${
            isLibre 
            ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {isLibre ? "Ocupar" : "Liberar"}
        </button>
        
        <button
          onClick={() => onDelete(mesa.id)}
          className="py-2.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}