// src/components/MesaModal.jsx
export function MesaModal({ isOpen, onClose, onSave, numero, setNumero }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-80">
        <h2 className="text-xl font-bold mb-4">Nueva Mesa</h2>
        <input
          type="number"
          placeholder="Número de mesa"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <div className="flex justify-between">
          <button
            onClick={onSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Crear
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}