import React, { useState } from 'react';
import { OrdenCompra, ConfiguracionSistema } from '../types';
import { CheckCircle2, Copy, Check, ShieldCheck, Mail, Key, User, Hash, X, Sparkles } from 'lucide-react';


interface OrderSuccessModalProps {
  orden: OrdenCompra | null;
  configuracion?: ConfiguracionSistema | null;
  isOpen: boolean;
  onClose: () => void;
}


export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orden,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !orden) return null;

  const [copiado, setCopiado] = useState(false);

  const copiarTexto = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Texto completo para copiar TODO de una vez
  const textoParaCopiar = `
ID de Compra: ${orden.id}
Cliente: ${orden.cliente_nombre}
Servicio: ${(orden as any).servicio_nombre || 'Servicio'}

Correo: ${(orden as any).correo || ''}
Contraseña: ${(orden as any).contrasena || ''}
Usuario / Perfil: ${(orden as any).perfil || ''}
PIN: ${(orden as any).pin || ''}

Total: $${((orden as any).total || 0).toFixed(2)} USD
  `.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#181818] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner Superior de Éxito */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/60 to-zinc-900 border-b border-zinc-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Compra Exitosa & Entregada
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            ¡Disfruta de tu Streaming!
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Orden #{orden.id} • Guardada en Supabase
          </p>
        </div>

        {/* DATOS DE ACCESO - SIN QR NI CÓDIGO INNECESARIO */}
        <div className="p-6 space-y-4">
          
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
              <span>Cliente: <strong className="text-white">{orden.cliente_nombre}</strong></span>
              <span>Total: <strong className="text-emerald-400 font-bold text-sm">${((orden as any).total || 0).toFixed(2)} USD</strong></span>
            </div>

            {/* DATOS DE ACCESO */}
            <div className="bg-black/70 p-4 rounded-lg border border-zinc-700 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Tus Datos de Acceso
              </h3>
              
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300">
                  <strong className="text-zinc-100">Servicio:</strong> {(orden as any).servicio_nombre || 'Servicio'}
                </p>
                <p className="text-zinc-300">
                  <Mail className="w-3.5 h-3.5 inline mr-2 text-emerald-400" />
                  <strong>Correo:</strong> {(orden as any).correo || 'No disponible'}
                </p>
                <p className="text-zinc-300">
                  <Key className="w-3.5 h-3.5 inline mr-2 text-emerald-400" />
                  <strong>Contraseña:</strong> {(orden as any).contrasena || 'No disponible'}
                </p>
                <p className="text-zinc-300">
                  <User className="w-3.5 h-3.5 inline mr-2 text-emerald-400" />
                  <strong>Usuario / Perfil:</strong> {(orden as any).perfil || 'No especificado'}
                </p>
                <p className="text-zinc-300">
                  <Hash className="w-3.5 h-3.5 inline mr-2 text-emerald-400" />
                  <strong>PIN:</strong> {(orden as any).pin || 'No especificado'}
                </p>
              </div>
            </div>

            {/* BOTÓN COPIAR TODO */}
            <button
              onClick={() => copiarTexto(textoParaCopiar)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors mt-2"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Todos los Datos
                </>
              )}
            </button>
          </div>

          {/* Garantía */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de reposición activa</span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-900/40"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};