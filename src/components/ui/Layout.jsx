import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

// ── Configuración de roles ──
const ROL_THEME = {
    'Administrador': { color: 'text-red-400',     bg: 'from-red-500 to-rose-600',     badge: 'bg-red-500/15 border-red-500/20 text-red-400',     icon: '👑' },
    'Mesera':        { color: 'text-emerald-400',  bg: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400', icon: '🍽️' },
    'Cajera':        { color: 'text-blue-400',     bg: 'from-blue-500 to-indigo-600',  badge: 'bg-blue-500/15 border-blue-500/20 text-blue-400',   icon: '💰' },
    'Cocinero':      { color: 'text-orange-400',   bg: 'from-orange-500 to-amber-600', badge: 'bg-orange-500/15 border-orange-500/20 text-orange-400', icon: '👨‍🍳' },
    'Bartender':     { color: 'text-purple-400',   bg: 'from-purple-500 to-violet-600', badge: 'bg-purple-500/15 border-purple-500/20 text-purple-400', icon: '🍹' },
};

const NAV_ITEMS = [
    { to: '/mesas',      label: 'Mapa de Mesas',   roles: ['Administrador','Mesera','Cajera'],      iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/pedidos',    label: 'Monitor KDS',      roles: ['Administrador','Cocinero','Bartender'], iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { to: '/productos',  label: 'Productos',        roles: ['Administrador'],                       iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { to: '/categorias', label: 'Categorías',       roles: ['Administrador'],                       iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
];

const ADMIN_LINKS = [
    { to: '/usuarios', label: 'Gestión Personal', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { to: '/reabastecimiento', label: 'Reabastecimiento', iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
];

const CAJA_LINKS = [
    { to: '/caja', label: 'Caja del Día', roles: ['Administrador','Cajera'], iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
];

export const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const rol = localStorage.getItem('rol');
    const theme = ROL_THEME[rol] || ROL_THEME['Mesera'];
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const initials = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const visibleLinks = NAV_ITEMS.filter(link => link.roles.includes(rol));
    const showAdmin = rol === 'Administrador';

    const NavLink = ({ to, label, iconPath }) => {
        const active = location.pathname === to;
        return (
            <Link to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group relative
                    ${active ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full" />}
                <span className={`transition-colors ${active ? 'text-amber-400' : 'text-slate-500 group-hover:text-white'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                </span>
                {label}
            </Link>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-5 lg:p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                        <span className="text-lg">🍽️</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white leading-tight">EL GALÁN</h1>
                        <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">Restobar</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Navegación</p>
                {visibleLinks.map(link => (
                    <NavLink key={link.to} {...link} />
                ))}

                {CAJA_LINKS.filter(l => l.roles.includes(rol)).length > 0 && (
                    <>
                        <div className="border-t border-white/5 my-4" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Caja</p>
                        {CAJA_LINKS.filter(l => l.roles.includes(rol)).map(link => (
                            <NavLink key={link.to} {...link} />
                        ))}
                    </>
                )}

                {showAdmin && (
                    <>
                        <div className="border-t border-white/5 my-4" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Administración</p>
                        {ADMIN_LINKS.map(link => (
                            <NavLink key={link.to} {...link} />
                        ))}
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="p-3 lg:p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-lg`}>
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{nombre}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border mt-1 ${theme.badge}`}>
                            <span>{theme.icon}</span>
                            {rol}
                        </span>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-500/20 hover:text-red-300 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-72 max-w-[85vw] bg-[#0f1117] flex flex-col border-r border-white/5 z-50 shadow-2xl">
                        {/* Close button */}
                        <button onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 bg-[#0f1117] fixed h-full flex-col border-r border-white/5 z-40">
                <SidebarContent />
            </aside>

            {/* Main content */}
            <main className="flex-1 lg:ml-64 min-h-screen bg-slate-950">
                <div className="p-4 pt-16 lg:p-8 lg:pt-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};