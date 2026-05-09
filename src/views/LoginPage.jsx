import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import toast from 'react-hot-toast';
import logoImage from '../assets/logo.png';  // Cambié el nombre a logo.png

const LoginPage = () => {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const navigate = useNavigate();

    const handle = async (e) => {
        e.preventDefault();
        try {
            const d = await login(u, p);
            localStorage.setItem('token', d.token);
            localStorage.setItem('rol', d.rol);
            localStorage.setItem('nombre', d.nombreUsuario);
            toast.success("¡Bienvenido!");
            navigate('/mesas');
        } catch {
            toast.error("Error de acceso");
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            {/* Imagen (Logo) al lado izquierdo */}
            <div className="w-1/2 hidden md:block">
                <img src={logoImage} alt="Logo EL GALÁN" className="h-full w-full object-cover" />
            </div>

            {/* Formulario de login a la derecha */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-12 rounded-3xl shadow-xl">
                <form onSubmit={handle} className="w-full max-w-md space-y-6">
                    {/* Logo / Nombre de la app */}
                    <div className="flex justify-center mb-6">
                        <h1 className="text-4xl font-extrabold text-indigo-600">EL GALÁN</h1>
                    </div>

                    {/* Título */}
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">LOGIN</h2>

                    {/* Usuario */}
                    <div className="space-y-4">
                        <input 
                            className="w-full border border-gray-300 p-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            type="text" 
                            placeholder="Usuario" 
                            onChange={e => setU(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-4">
                        <input 
                            className="w-full border border-gray-300 p-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            type="password" 
                            placeholder="Contraseña" 
                            onChange={e => setP(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* Botón de Login */}
                    <div className="mt-6">
                        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-all hover:bg-indigo-700 shadow-md focus:outline-none">
                            INGRESAR
                        </button>
                    </div>

                    {/* Footer - Mensaje informativo */}
                    <div className="text-center mt-4 text-sm text-gray-600">
                        <p className="text-lg">Sistema Interno de Gestión</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;