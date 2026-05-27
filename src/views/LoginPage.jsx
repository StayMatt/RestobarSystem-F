import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import toast from 'react-hot-toast';
import logoImage from '../assets/logo.png';

const LoginPage = () => {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handle = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const d = await login(u, p);
            localStorage.setItem('token', d.token);
            localStorage.setItem('usuarioId', d.usuarioId);
            localStorage.setItem('rol', d.rol);
            localStorage.setItem('nombre', d.nombreUsuario);
            toast.success("¡Bienvenido!");
            navigate('/mesas');
        } catch {
            toast.error("Error de acceso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            {/* Panel izquierdo — imagen */}
            <div className="w-1/2 hidden md:flex relative overflow-hidden">
                <img
                    src={logoImage}
                    alt="Logo EL GALÁN"
                    className="h-full w-full object-cover"
                />
                {/* Overlay elegante */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-12 left-10 animate-fade-in-up">
                    <p className="text-amber-400 font-bold text-sm uppercase tracking-[0.3em] mb-2">Bienvenido a</p>
                    <h1 className="text-5xl font-black text-white leading-tight drop-shadow-2xl">EL GALÁN</h1>
                    <p className="text-slate-300 mt-2 text-lg">Sistema de Gestión</p>
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md animate-scale-in">
                    {/* Card del formulario */}
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-black/50">
                        {/* Logo móvil */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-4">
                                <span className="text-3xl">🍽️</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Iniciar Sesión</h2>
                            <p className="text-slate-400 text-sm mt-1">Sistema Interno de Gestión</p>
                        </div>

                        <form onSubmit={handle} className="space-y-5">
                            {/* Campo Usuario */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Usuario
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all"
                                        type="text"
                                        placeholder="Ingresa tu usuario"
                                        onChange={e => setU(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Campo Contraseña */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="w-full bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all"
                                        type="password"
                                        placeholder="••••••••"
                                        onChange={e => setP(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Botón */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Ingresando...
                                    </span>
                                ) : (
                                    'Ingresar al Sistema'
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-slate-600 mt-8">
                            © 2025 El Galán Restobar · Todos los derechos reservados
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;