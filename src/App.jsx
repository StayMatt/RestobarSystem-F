import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./views/LoginPage";
import { Layout } from "./components/ui/Layout";
import { MesasPage } from "./views/MesasPage";
import { UsuariosPage } from "./views/UsuariosPage";
import { ProductosPage } from "./views/ProductosPage";
import { CategoriasPage } from "./views/CategoriasPage";
import { PedidosPage } from "./views/PedidosPage";
import { CajaPage } from "./views/CajaPage";
import { ReabastecimientoPage } from "./views/ReabastecimientoPage";

// ── Mapa de permisos por ruta ──
// Define qué roles pueden acceder a cada ruta
const ROLE_ACCESS = {
    mesas:      ['Administrador', 'Mesera', 'Cajera'],
    pedidos:    ['Administrador', 'Cocinero', 'Bartender'],
    productos:  ['Administrador'],
    categorias: ['Administrador'],
    usuarios:   ['Administrador'],
    caja:       ['Administrador', 'Cajera'],
    reabastecimiento: ['Administrador'],
};

// Ruta default según rol (a dónde va al entrar)
const DEFAULT_ROUTE = {
    'Administrador': '/mesas',
    'Mesera':        '/mesas',
    'Cajera':        '/mesas',
    'Cocinero':      '/pedidos',
    'Bartender':     '/pedidos',
};

// Componente que verifica autenticación
const ProtectedLayout = () => {
    const isAuth = !!localStorage.getItem('token');
    return isAuth ? <Layout /> : <Navigate to="/login" replace />;
};

// Componente que verifica rol para acceder a una ruta
const RoleGuard = ({ allowedRoles, children }) => {
    const rol = localStorage.getItem('rol');
    if (!allowedRoles.includes(rol)) {
        const defaultRoute = DEFAULT_ROUTE[rol] || '/mesas';
        return <Navigate to={defaultRoute} replace />;
    }
    return children;
};

// Redirige a la ruta correcta según el rol del usuario logueado
const RoleRedirect = () => {
    const rol = localStorage.getItem('rol');
    const target = DEFAULT_ROUTE[rol] || '/mesas';
    return <Navigate to={target} replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedLayout />}>
                    {/* Redirige a la ruta correcta según rol */}
                    <Route index element={<RoleRedirect />} />

                    {/* Rutas protegidas por rol */}
                    <Route path="mesas" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.mesas}>
                            <MesasPage />
                        </RoleGuard>
                    } />
                    <Route path="pedidos" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.pedidos}>
                            <PedidosPage />
                        </RoleGuard>
                    } />
                    <Route path="productos" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.productos}>
                            <ProductosPage />
                        </RoleGuard>
                    } />
                    <Route path="categorias" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.categorias}>
                            <CategoriasPage />
                        </RoleGuard>
                    } />
                    <Route path="usuarios" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.usuarios}>
                            <UsuariosPage />
                        </RoleGuard>
                    } />
                    <Route path="caja" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.caja}>
                            <CajaPage />
                        </RoleGuard>
                    } />
                    <Route path="reabastecimiento" element={
                        <RoleGuard allowedRoles={ROLE_ACCESS.reabastecimiento}>
                            <ReabastecimientoPage />
                        </RoleGuard>
                    } />

                    {/* Cualquier ruta no definida → redirige según rol */}
                    <Route path="*" element={<RoleRedirect />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;