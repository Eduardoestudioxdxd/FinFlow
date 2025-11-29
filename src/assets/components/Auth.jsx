import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import * as api from '../../api'; // <--- IMPORTANTE: Conexión con el Backend

const Auth = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        let response;
        
        if (isRegister) {
            // REGISTRO REAL EN MONGODB
            await api.registerUser(formData);
            alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
            setIsRegister(false); // Cambiar a pestaña de login
            setLoading(false);
            return;
        } else {
            // LOGIN REAL (Verifica contraseña en MongoDB)
            response = await api.loginUser({ 
                email: formData.email, 
                password: formData.password 
            });
        }
        
        // Si la contraseña es correcta, entramos
        onLogin(response);

    } catch (err) {
        // Si la contraseña está mal, mostramos el error rojo
        console.error(err);
        setError(err.message || "Error de conexión con el servidor");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans text-slate-100">
      <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-1">{isRegister ? 'Crear Cuenta' : 'Bienvenido'}</h1>
          <p className="text-slate-400 text-sm">
            {isRegister ? 'Toma el control de tus finanzas.' : 'Ingresa tus credenciales reales.'}
          </p>
        </div>

        {/* MENSAJE DE ERROR ROJO */}
        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm animate-pulse">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-1">NOMBRE</label>
                <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tu Nombre" 
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                        required={isRegister}
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">CORREO</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                    type="email" 
                    placeholder="ejemplo@correo.com" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                    required
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">CONTRASEÑA</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                    required
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Registrarme' : 'Iniciar Sesión')} 
            {!loading && <ArrowRight size={18}/>}
          </button>

        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isRegister ? '¿Ya tienes cuenta?' : '¿'}
            <button 
                onClick={() => { setIsRegister(!isRegister); setError(''); }} 
                className="ml-2 text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-colors"
            >
                {isRegister ? 'Ingresa aquí' : ''}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Auth;