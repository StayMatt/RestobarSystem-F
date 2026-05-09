import { useEffect, useState } from 'react';
import { getUsuarios, crearUsuario } from '../api/usuarios';
import toast from 'react-hot-toast';

export const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    
    // El estado coincide EXACTAMENTE con las propiedades de tu CrearUsuarioDTO en C#
    const [form, setForm] = useState({ 
        NombreCompleto: '', 
        Username: '', 
        Password: '', 
        RolId: 2 // Suponiendo que 2 es Mesera (ajusta según tu BD)
    });

    const cargarUsuarios = async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            toast.error("Error al cargar el personal");
        }
    };

    useEffect(() => { 
        cargarUsuarios(); 
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            // Aseguramos que RolId viaje como número entero (int)
            const payload = {
                ...form,
                RolId: parseInt(form.RolId)
            };
            
            await crearUsuario(payload);
            toast.success("Usuario creado con éxito");
            
            // Limpiamos el formulario
            setForm({ NombreCompleto: '', Username: '', Password: '', RolId: 2 });
            
            // Recargamos la tabla
            cargarUsuarios();
        } catch (error) {
            // Captura el BadRequest(new { mensaje = ex.Message }) de tu C#
            const mensajeError = error.response?.data?.mensaje || "Error al crear usuario";
            toast.error(mensajeError);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800">👥 Gestión de Personal</h1>
            
            <form onSubmit={handleCrear} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                    <input 
                        className="w-full border p-2 rounded-lg mt-1" 
                        type="text" 
                        value={form.NombreCompleto} 
                        onChange={e => setForm({...form, NombreCompleto: e.target.value})} 
                        required
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Usuario (Login)</label>
                    <input 
                        className="w-full border p-2 rounded-lg mt-1" 
                        type="text" 
                        value={form.Username} 
                        onChange={e => setForm({...form, Username: e.target.value})} 
                        required
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Contraseña</label>
                    <input 
                        className="w-full border p-2 rounded-lg mt-1" 
                        type="password" 
                        value={form.Password} 
                        onChange={e => setForm({...form, Password: e.target.value})} 
                        required
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Rol</label>
                    <select 
                        className="w-full border p-2 rounded-lg mt-1 bg-white" 
                        value={form.RolId} 
                        onChange={e => setForm({...form, RolId: e.target.value})}
                    >
                        {/* Asegúrate de que estos IDs coincidan con tu base de datos */}
                        <option value={1}>Administrador</option>
                        <option value={2}>Mesera</option>
                        <option value={3}>Cajera</option>
                        <option value={4}>Cocinero</option>
                        <option value={5}>Bartender</option>
                    </select>
                </div>
                <button type="submit" className="col-span-5 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-2">
                    Registrar Empleado
                </button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-xs uppercase text-slate-500">
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id} className="border-b hover:bg-slate-50 transition">
                                <td className="p-4 font-medium text-slate-700">{u.nombreCompleto}</td>
                                <td className="p-4 font-mono text-blue-600">{u.username}</td>
                                <td className="p-4">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                        {u.rol}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};