import React from 'react';
import { ServicioStreaming } from '../types';
import { ShoppingCart, Eye, Star, Zap, ShieldCheck } from 'lucide-react';

interface ServiceCardProps {
  servicio: ServicioStreaming;
  onComprar: (servicio: ServicioStreaming) => void;
  onVerDetalles: (servicio: ServicioStreaming) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  servicio,
  onComprar,
  onVerDetalles,
}) => {
  const hayDescuento =
    servicio.precio_original && servicio.precio_original > servicio.precio;
  const porcentajeDescuento = hayDescuento
    ? Math.round(
        ((servicio.precio_original! - servicio.precio) / servicio.precio_original!) * 100
      )
    : 0;

  const estaAgotado = servicio.stock <= 0;

  return (
    <div className="group relative bg-[#1a1a1a] border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-1 flex flex-col">
      {/* Etiquetas */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {servicio.destacado && (
          <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-black rounded-lg flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            DESTACADO
          </span>
        )}
        {hayDescuento && (
          <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-lg">
            -{porcentajeDescuento}% OFF
          </span>
        )}
      </div>

      {/* ✅ IMAGEN: Ahora se ve COMPLETA sin recortarse */}
      <div className="relative w-full h-40 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={servicio.logo_url}
          alt={servicio.nombre}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://cdn-icons-png.flaticon.com/512/3163/3163508.png';
          }}
        />
        {estaAgotado && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-black rounded-xl">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nombre y tipo */}
        <div className="mb-2">
          <h3 className="text-base font-black text-white tracking-tight line-clamp-1">
            {servicio.nombre}
          </h3>
          <p className="text-[11px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {servicio.tipo_cuenta || 'Cuenta Oficial'}
          </p>
        </div>

        {/* Características rápidas */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {servicio.duracion && (
            <span className="px-2 py-0.5 bg-zinc-800/80 text-zinc-300 text-[10px] font-bold rounded-md border border-zinc-700">
              ⏱ {servicio.duracion}
            </span>
          )}
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
              estaAgotado
                ? 'bg-rose-950/50 text-rose-300 border-rose-800'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
            }`}
          >
            📦 Stock: {servicio.stock}
          </span>
        </div>

        {/* ✅ PRECIOS: Ahora dice Bs en lugar de $ */}
        <div className="mt-auto pt-3 border-t border-zinc-800">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              Bs {servicio.precio.toFixed(2)}
            </span>
            {hayDescuento && (
              <span className="text-sm text-zinc-500 line-through font-semibold mb-0.5">
                Bs {servicio.precio_original!.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mb-3">
            Precio final • Impuestos incluidos
          </p>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={() => onVerDetalles(servicio)}
              className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-zinc-700"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver
            </button>
            <button
              onClick={() => onComprar(servicio)}
              disabled={estaAgotado}
              className={`flex-[2] py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                estaAgotado
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50 active:scale-95'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {estaAgotado ? 'Agotado' : 'Comprar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;