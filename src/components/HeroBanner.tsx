import React from 'react';
import { ServicioStreaming } from '../types';
import { ShoppingCart, Info } from 'lucide-react';


interface HeroBannerProps {
  servicio?: ServicioStreaming;
  servicioDestacado?: ServicioStreaming;
  onComprar: (servicio: ServicioStreaming) => void;
  // ✅ Agregamos onVerDetalles (es el nombre que usas en App.tsx)
  onVerDetalles?: (servicio: ServicioStreaming) => void;
  // Mantenemos onViewSpecs por si acaso, pero ahora usaremos onVerDetalles
  onViewSpecs?: (servicio: ServicioStreaming) => void;
}


export const HeroBanner: React.FC<HeroBannerProps> = ({
  servicio,
  servicioDestacado,
  onComprar,
  // ✅ Recibimos onVerDetalles
  onVerDetalles
}) => {
  // Escudo nivel máximo: Toma la información sin importar cómo la llame App.tsx
  const data = servicio || servicioDestacado;


  // Si todavía no hay datos, se esconde en lugar de poner la pantalla negra
  if (!data) return null;


  return (
    <div className="relative h-[60vh] w-full bg-zinc-900 overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0">
        <img
          src={data?.banner_url || data?.logo_url || ''}
          alt={data?.nombre || 'Servicio destacado'}
          className="w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
      </div>


      {/* Contenido */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <div className="max-w-2xl mt-16">
          <span className="inline-block px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded mb-4">
            Servicio Destacado
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 drop-shadow-lg">
            {data?.nombre}
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base mb-8 max-w-xl line-clamp-3">
            {data?.descripcion}
          </p>


          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onComprar(data)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/50 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* Protegemos el precio para que no rompa la página */}
              Comprar Bs {data?.precio ? data.precio.toFixed(2) : '0.00'}
            </button>

            {/* ✅ Nuevo botón: Ver detalles (usa el onVerDetalles que viene de App.tsx) */}
            {onVerDetalles && (
              <button
                onClick={() => onVerDetalles(data)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all backdrop-blur-sm cursor-pointer border border-white/20"
              >
                <Info className="w-5 h-5" />
                Ver detalles
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};