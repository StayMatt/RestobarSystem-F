import { Link, Outlet, useNavigate } from 'react-router-dom';

export const Layout = () => {
    const navigate = useNavigate();
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const rol = localStorage.getItem('rol');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-t from-slate-100 via-blue-50 to-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white fixed h-full flex flex-col shadow-xl rounded-tr-3xl rounded-br-3xl">
                <div className="p-6 text-3xl font-extrabold text-blue-400 border-b border-slate-700 tracking-tight">
                    <span>EL GALÁN 🍽️</span>
                </div>
                <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <Link to="/mesas" className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-700 transition-all duration-300 hover:text-blue-300">
                        <span>📍</span><span>Mapa de Mesas</span>
                    </Link>
                    <Link to="/pedidos" className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-700 transition-all duration-300 hover:text-blue-300">
                        <span>📝</span><span>Pedidos / Cocina</span>
                    </Link>
                    <Link to="/productos" className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-700 transition-all duration-300 hover:text-blue-300">
                        <span>🍔</span><span>Productos</span>
                    </Link>
                    <Link to="/categorias" className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-700 transition-all duration-300 hover:text-blue-300">
                        <span>📁</span><span>Categorías</span>
                    </Link>

                    {rol === 'Administrador' && (
                        <Link to="/usuarios" className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-700 transition-all duration-300 text-blue-300 border-t border-slate-700 mt-4 pt-4">
                            <span>👥</span><span>Gestión Personal</span>
                        </Link>
                    )}
                </nav>
                <div className="p-6 border-t border-slate-700 bg-slate-800 rounded-b-xl">
                    <div className="mb-3">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Sesión:</p>
                        <p className="text-sm text-blue-200 font-semibold">{nombre}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="w-full bg-red-600 text-white p-3 rounded-md hover:bg-red-700 hover:text-white transition-all duration-300 font-bold shadow-lg mt-4"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 ml-64 p-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 transform hover:scale-105">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};