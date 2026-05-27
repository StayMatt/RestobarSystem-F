import { useEffect, useState } from 'react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../api/usuarios';
import toast from 'react-hot-toast';

const ROLES = [
    { id: 1, nombre: 'Administrador', color: 'from-red-500 to-rose-600',    badge: 'bg-red-500/15 text-red-400 border-red-500/20',       dot: 'bg-red-400',     icon: '👑' },
    { id: 2, nombre: 'Cajera',        color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20',     dot: 'bg-blue-400',    icon: '💰' },
    { id: 3, nombre: 'Mesera',        color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', icon: '🍽️' },
    { id: 4, nombre: 'Cocinero',      color: 'from-orange-500 to-amber-600', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20', dot: 'bg-orange-400',  icon: '👨‍🍳' },
    { id: 5, nombre: 'Bartender',     color: 'from-purple-500 to-violet-600', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20', dot: 'bg-purple-400',  icon: '🍹' },
];

const getRolConfig = (rolNombre) => ROLES.find(r => r.nombre === rolNombre) || ROLES[2];
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const rol = localStorage.getItem('rol');
    const esAdmin = rol === 'Administrador';

    const [form, setForm] = useState({ NombreCompleto: '', Username: '', Password: '', RolId: 3 });
    const [editForm, setEditForm] = useState({ NombreCompleto: '', Username: '', Password: '', RolId: 3 });

    const cargar = async () => {
        try { setUsuarios(await getUsuarios()); }
        catch (err) { if (err.response?.status !== 401 && err.response?.status !== 403) toast.error("Error al cargar personal"); }
    };
    useEffect(() => { cargar(); }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        try {
            await crearUsuario({ ...form, RolId: parseInt(form.RolId) });
            toast.success("Empleado registrado");
            setForm({ NombreCompleto: '', Username: '', Password: '', RolId: 3 });
            setShowForm(false);
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al crear"); }
    };

    const handleEditar = async () => {
        try {
            await actualizarUsuario(editando.id, {
                NombreCompleto: editForm.NombreCompleto,
                Username: editForm.Username,
                Password: editForm.Password || '', // vacío = no cambiar
                RolId: parseInt(editForm.RolId)
            });
            toast.success("Empleado actualizado");
            setEditando(null);
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al editar"); }
    };

    const handleEliminar = async (id) => {
        try {
            await eliminarUsuario(id);
            toast.success("Empleado eliminado");
            setConfirmDelete(null);
            cargar();
        } catch (err) { toast.error(err.response?.data?.mensaje || "Error al eliminar"); }
    };

    const abrirEditar = (u) => {
        const rolMatch = ROLES.find(r => r.nombre === u.rol);
        setEditando(u);
        setEditForm({
            NombreCompleto: u.nombreCompleto,
            Username: u.username,
            Password: '',
            RolId: rolMatch?.id || 3
        });
    };

    if (!esAdmin) {
        return (
            <div className="text-center py-24 bg-gradient-to-br from-slate-900 to-slate-950 border border-red-500/10 rounded-3xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <span className="text-4xl">🔒</span>
                </div>
                <p className="text-xl font-black text-slate-300">Acceso Restringido</p>
                <p className="text-slate-500 mt-2 text-sm">
                    Solo los <span className="text-red-400 font-bold">Administradores</span> pueden gestionar el personal
                </p>
            </div>
        );
    }

    // Stats por rol
    const statsPorRol = ROLES.map(r => ({
        ...r,
        count: usuarios.filter(u => u.rol === r.nombre).length
    })).filter(r => r.count > 0);

    const inputClass = "w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5";

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <span className="text-lg">👥</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Gestión de Personal</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-[52px]">{usuarios.length} empleados en el sistema</p>
                </div>
                <button onClick={() => setShowForm(v => !v)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg
                        ${showForm
                            ? 'bg-slate-800 text-slate-300 border border-white/10 shadow-none'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:scale-[1.03] shadow-amber-500/25'}`}>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? 'Cancelar' : 'Nuevo Empleado'}
                </button>
            </div>

            {/* ── Stats por rol ── */}
            {statsPorRol.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {statsPorRol.map(r => (
                        <div key={r.id} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${r.badge} bg-opacity-50`}>
                            <span className="text-base">{r.icon}</span>
                            <span className="font-black text-sm">{r.count}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{r.nombre}{r.count !== 1 ? 's' : ''}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Formulario crear ── */}
            {showForm && (
                <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 p-7 rounded-3xl">
                    <h2 className="text-sm font-black text-amber-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        Registrar Nuevo Empleado
                    </h2>
                    <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className={labelClass}>Nombre Completo</label>
                            <input className={inputClass} type="text" placeholder="Apellidos y Nombres"
                                value={form.NombreCompleto} onChange={e => setForm({...form, NombreCompleto: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Usuario</label>
                            <input className={inputClass} type="text" placeholder="user123"
                                value={form.Username} onChange={e => setForm({...form, Username: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Contraseña</label>
                            <input className={inputClass} type="password" placeholder="••••••••"
                                value={form.Password} onChange={e => setForm({...form, Password: e.target.value})} required />
                        </div>
                        <div>
                            <label className={labelClass}>Rol</label>
                            <select className={inputClass} value={form.RolId} onChange={e => setForm({...form, RolId: e.target.value})}>
                                {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.nombre}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4">
                            <button type="submit"
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-500/20">
                                Registrar Empleado
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Grid de usuarios ── */}
            {usuarios.length === 0 ? (
                <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-white/5">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-5">
                        <span className="text-4xl">👥</span>
                    </div>
                    <p className="text-lg font-black text-slate-300">Sin personal registrado</p>
                    <p className="text-slate-500 text-sm mt-1">Registra al primer empleado del equipo</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {usuarios.map((u) => {
                        const rc = getRolConfig(u.rol);
                        return (
                            <div key={u.id}
                                className="relative group bg-slate-900/80 border border-white/5 rounded-3xl p-6 hover:border-white/15 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 overflow-hidden">
                                {/* Glow sutil según rol */}
                                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${rc.color} opacity-[0.07] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500`} />

                                {/* Botones admin en hover */}
                                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <button onClick={() => abrirEditar(u)}
                                        className="w-8 h-8 bg-white/10 hover:bg-blue-500/30 backdrop-blur-md border border-white/10 hover:border-blue-400/50 rounded-xl flex items-center justify-center text-slate-300 hover:text-blue-400 transition-all"
                                        title="Editar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => setConfirmDelete(u)}
                                        className="w-8 h-8 bg-white/10 hover:bg-red-500/30 backdrop-blur-md border border-white/10 hover:border-red-400/50 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-400 transition-all"
                                        title="Eliminar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-start gap-4">
                                    {/* Avatar con gradiente del rol */}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rc.color} flex items-center justify-center text-lg font-black text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {getInitials(u.nombreCompleto)}
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <p className="font-black text-white text-base truncate">{u.nombreCompleto}</p>
                                        <p className="text-xs text-slate-500 font-mono truncate mt-0.5">@{u.username}</p>
                                        <div className="mt-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${rc.badge}`}>
                                                <span className="text-xs">{rc.icon}</span>
                                                {u.rol}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal editar ── */}
            {editando && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditando(null)}>
                    <div className="bg-slate-900 border border-blue-500/20 rounded-3xl shadow-2xl w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header del modal con gradiente */}
                        <div className={`bg-gradient-to-r ${getRolConfig(editando.rol).color} p-6 flex items-center gap-4`}>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl font-black text-white">
                                {getInitials(editando.nombreCompleto)}
                            </div>
                            <div>
                                <h2 className="font-black text-white text-lg">Editar Empleado</h2>
                                <p className="text-white/60 text-xs font-mono">@{editando.username}</p>
                            </div>
                        </div>

                        <div className="p-7 space-y-4">
                            <div>
                                <label className={labelClass}>Nombre Completo</label>
                                <input className={inputClass} type="text" value={editForm.NombreCompleto}
                                    onChange={e => setEditForm({...editForm, NombreCompleto: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Usuario</label>
                                    <input className={inputClass} type="text" value={editForm.Username}
                                        onChange={e => setEditForm({...editForm, Username: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelClass}>Rol</label>
                                    <select className={inputClass} value={editForm.RolId}
                                        onChange={e => setEditForm({...editForm, RolId: e.target.value})}>
                                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>
                                    Nueva Contraseña
                                    <span className="text-slate-600 normal-case tracking-normal ml-2 font-normal">Dejar vacío para mantener la actual</span>
                                </label>
                                <input className={inputClass} type="password" placeholder="••••••••"
                                    value={editForm.Password} onChange={e => setEditForm({...editForm, Password: e.target.value})} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setEditando(null)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">
                                    Cancelar
                                </button>
                                <button onClick={handleEditar}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-blue-500/20">
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal eliminar ── */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-slate-900 border border-red-500/20 p-8 rounded-3xl shadow-2xl w-96 text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">👤</span>
                        </div>
                        <h2 className="font-black text-white text-lg mb-2">¿Eliminar a {confirmDelete.nombreCompleto}?</h2>
                        <p className="text-slate-400 text-sm mb-6">Se eliminará permanentemente del sistema.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-white/10">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmDelete.id)}
                                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-black transition-all shadow-lg shadow-red-500/20">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};