import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./views/LoginPage";
import { Layout } from "./components/ui/Layout";
import { MesasPage } from "./views/MesasPage";
import { UsuariosPage } from "./views/UsuariosPage";
import { ProductosPage } from "./views/ProductosPage";
import { CategoriasPage } from "./views/CategoriasPage";
import { PedidosPage } from "./views/PedidosPage";

function App() {
    const isAuth = !!localStorage.getItem('token');

    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={isAuth ? <Layout /> : <Navigate to="/login" />}>
                    <Route index element={<Navigate to="/mesas" />} />
                    <Route path="mesas" element={<MesasPage />} />
                    <Route path="usuarios" element={<UsuariosPage />} />
                    <Route path="productos" element={<ProductosPage />} />
                    <Route path="categorias" element={<CategoriasPage />} />
                    <Route path="pedidos" element={<PedidosPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;