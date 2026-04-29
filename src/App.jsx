// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Importamos el Layout y las vistas reales
import { Layout } from "./components/ui/Layout";
import { MesasPage } from "./views/MesasPage";
import { ProductosPage } from "./views/ProductosPage";
import { CategoriasPage } from "./views/CategoriasPage";
import { PedidosPage } from "./views/PedidosPage"; // Importamos la vista real

/**
 * Componente Principal
 * Define el enrutador global y todas las rutas disponibles en la aplicación.
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
            },
          }} 
        />
        
        <Routes>
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/mesas" replace />} />
          
          {/* Rutas principales del sistema */}
          <Route path="/mesas" element={<MesasPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          
          {/* Ruta de Pedidos: 
            Usamos ":mesaId" para que la página sepa qué mesa estamos atendiendo.
            Si entras a /pedidos sin ID, también podemos mostrar la página (opcional)
          */}
          <Route path="/pedidos/:mesaId" element={<PedidosPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;