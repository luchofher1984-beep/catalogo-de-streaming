import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Eye, EyeOff } from 'lucide-react';


const esCorreoValido = (correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);


interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialView?: 'login' | 'register';
}


export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, initialView = 'login' }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('+591 '); 
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (valor.startsWith('+591 ')) {
      setTelefono(valor);
    } else {
      setTelefono('+591 ' + valor.replace(/^\+591\s*/, ''));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    // ✅ Validación local antes de llamar a Supabase
    if (!esCorreoValido(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }


    setLoading(true);


    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onSuccess(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        
        if (error) throw error;
        
        if (data.user) {
          const { error: profileError } = await supabase.from('perfiles').upsert([
            {
              id: data.user.id,
              nombre: nombre || 'Sin nombre',
              correo: email,
              contrasena: password, // ✅ ¡NUEVO! GUARDA LA CONTRASEÑA AUTOMÁTICAMENTE
              telefono: telefono,
              estado: 'activo',
              total_gastado: 0,
              created_at: new Date().toISOString()
            }
          ]);


          if (profileError) {
            console.error('Error al guardar el perfil:', profileError.message);
          }


          if (data.session) {
            onSuccess(data.user);
          } else {
            alert('¡Registro exitoso! Por favor, inicia sesión.');
            setIsLogin(true); 
          }
        }
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#141414] border border-gray-800 p-8 rounded-xl max-w-md w-full relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition cursor-pointer"
          aria-label="Cerrar modal"
        >✕</button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta de Cliente'}
        </h2>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="text-gray-400 text-sm block mb-1">Nombre o Apodo</label>
              <input type="text" required className="w-full bg-[#2b2b2b] text-white px-4 py-3 rounded outline-none focus:ring-2 focus:ring-red-600 transition" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" />
            </div>
          )}


          <div>
            <label className="text-gray-400 text-sm block mb-1">Correo Electrónico</label>
            <input type="email" required className="w-full bg-[#2b2b2b] text-white px-4 py-3 rounded outline-none focus:ring-2 focus:ring-red-600 transition" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
          </div>
          
          {!isLogin && (
            <div>
              <label className="text-gray-400 text-sm block mb-1">Número Telefónico / WhatsApp</label>
              <input type="tel" required className="w-full bg-[#2b2b2b] text-white px-4 py-3 rounded outline-none focus:ring-2 focus:ring-red-600 transition font-mono" value={telefono} onChange={handleTelefonoChange} placeholder="+591 70000000" />
            </div>
          )}
          
          <div>
            <label className="text-gray-400 text-sm block mb-1">Contraseña</label>
            <div className="relative">
              <input type={mostrarPassword ? 'text' : 'password'} required minLength={6} className="w-full bg-[#2b2b2b] text-white px-4 py-3 pr-12 rounded outline-none focus:ring-2 focus:ring-red-600 transition" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1 cursor-pointer" aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition disabled:opacity-50 mt-2 cursor-pointer">
            {loading ? 'Cargando...' : (isLogin ? 'Entrar a mi cuenta' : 'Registrarme e ingresar')}
          </button>
        </form>
        <p className="text-gray-400 mt-6 text-center text-sm">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-white ml-2 hover:underline font-semibold cursor-pointer">
            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};