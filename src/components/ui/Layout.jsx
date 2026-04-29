// src/components/ui/Layout.jsx
import { NavLink, useLocation } from "react-router-dom";

export function Layout({ children }) {
  // Obtenemos la ruta actual para cambiar el título dinámicamente
  const location = useLocation();

  // Definimos nuestro menú en un array para que sea fácil agregar más opciones luego
  const menuItems = [
    { path: "/mesas", name: "Mesas", icon: "🪑" },
    { path: "/pedidos", name: "Pedidos", icon: "📋" },
    { path: "/productos", name: "Productos", icon: "📦" },
    { path: "/categorias", name: "Categorías", icon: "🏷️" },
  ];

  // Buscamos el nombre de la página actual, si no lo encuentra pone "Panel"
  const paginaActual = menuItems.find(item => item.path === location.pathname)?.name || "Panel";

  // Generamos la fecha de hoy de forma dinámica
  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-600">🍽️</span> Restobar<span className="text-blue-600">PRO</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              AD
            </div>
            <span className="text-sm font-medium text-slate-600">Admin</span>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      {/* Añadimos ml-64 (margin-left) porque el sidebar ahora es fixed (fijo) */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-700 capitalize">
            Gestión de {paginaActual}
          </h2>
          <div className="text-sm text-slate-400 font-medium capitalize">
            {fechaHoy}
          </div>
        </header>
        
        <section className="p-8 flex-1">
          {children}
        </section>
      </main>
    </div>
  );
}