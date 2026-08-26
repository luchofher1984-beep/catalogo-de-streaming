import React, { useState, useEffect } from 'react';
import { ServicioStreaming } from '../types';
import {
  X,
  ShoppingCart,
  Star,
  ShieldCheck,
  Clock,
  Package,
  Zap,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface ServiceDetailModalProps {
  servicio: ServicioStreaming | null;
  isOpen: boolean;
  onClose: () => void;
  onComprar: (servicio: ServicioStreaming, duracionSeleccionada: number, precioFinal: number) => void;
}

// Opciones de duración en meses
const OPCIONES_DURACION = [
  { meses: 1, etiqueta: '1 MES', multiplicador: 1 },
  { meses: 2, etiqueta: '2 MESES', multiplicador: 2 },
  { meses: 3, etiqueta: '3 MESES', multiplicador: 3 },
];

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  servicio,
  isOpen,
  onClose,
  onComprar,
}) => {
  // ✅ Estado para la duración seleccionada (por defecto 1 mes)
  const [duracionSeleccionada, setDuracionSeleccionada] = useState(1);

  // Resetear a 1 mes cada vez que se abre un servicio nuevo
  useEffect(() => {
    if (isOpen && servicio) {
      setDuracionSeleccionada(1);
    }
  }, [isOpen, servicio]);

  if (!isOpen || !servicio) return null;

  const estaAgotado = servicio.stock <= 0;
  const hayDescuento =
    servicio.precio_original && servicio.precio_original > servicio.precio;

  // ✅ Cálculo automático del precio según la duración
  const opcionActual = OPCIONES_DURACION.find(
    (o) => o.meses === duracionSeleccionada
  )!;
  const precioBase = servicio.precio;
  const precioFinal = precioBase * opcionActual.multiplicador;

  // Precio original tachado (si hay descuento)
  const precioOriginalFinal = hayDescuento
    ? servicio.precio_original! * opcionActual.multiplicador
    : null;

  const ahorroTotal = precioOriginalFinal
    ? precioOriginalFinal - precioFinal
    : 0;

  const handleComprar = () => {
    if (estaAgotado) return;
    onComprar(servicio, duracionSeleccionada, precioFinal);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ✅ SECCIÓN DEL LOGO — AHORA SE VE GRANDE Y CLARO */}
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-8 flex items-center justify-center border-b border-zinc-800">
          {/* Etiquetas */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {servicio.destacado && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-black rounded-lg flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                DESTACADO
              </span>
            )}
            {hayDescuento && (
              <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg shadow-lg">
                ¡OFERTA!
              </span>
            )}
          </div>

          {/* ✅ LOGO GRANDE Y VISIBLE */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/95 rounded-2xl p-4 flex items-center justify-center shadow-xl border border-zinc-600">
            <img
              src={servicio.logo_url}
              alt={servicio.nombre}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://cdn-icons-png.flaticon.com/512/3163/3163508.png';
              }}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Título y tipo */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {servicio.nombre}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {servicio.tipo_cuenta || 'Cuenta Oficial y Completa'}
            </p>
          </div>

          {/* Descripción */}
          {servicio.descripcion && (
            <p className="text-sm text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 leading-relaxed">
              {servicio.descripcion}
            </p>
          )}

          {/* Características */}
          {servicio.caracteristicas && servicio.caracteristicas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicio.caracteristicas.map((caract, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900/40 px-3 py-2 rounded-lg border border-zinc-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{caract}</span>
                </div>
              ))}
            </div>
          )}

          {/* Info rápida */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-center">
              <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Duración</p>
              <p className="text-xs font-black text-white">
                {servicio.duracion || '30 Días'}
              </p>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-center">
              <Package className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Stock</p>
              <p
                className={`text-xs font-black ${
                  estaAgotado ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {estaAgotado ? 'Agotado' : `${servicio.stock} disponibles`}
              </p>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-center">
              <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Garantía</p>
              <p className="text-xs font-black text-white">
                {servicio.garantia_dias || 30} días
              </p>
            </div>
          </div>

          {/* ✅ SELECCIÓN DE DURACIÓN — 1 MES, 2 MESES, 3 MESES */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
              Selecciona la duración de tu plan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OPCIONES_DURACION.map((opcion) => {
                const seleccionada = duracionSeleccionada === opcion.meses;
                const precioOpcion = precioBase * opcion.multiplicador;
                return (
                  <button
                    key={opcion.meses}
                    type="button"
                    onClick={() => setDuracionSeleccionada(opcion.meses)}
                    className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                      seleccionada
                        ? 'border-red-500 bg-red-600/10 ring-2 ring-red-500/30'
                        : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
                    }`}
                  >
                    {seleccionada && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                        ✓
                      </span>
                    )}
                    <p
                      className={`text-sm font-black ${
                        seleccionada ? 'text-white' : 'text-zinc-300'
                      }`}
                    >
                      {opcion.etiqueta}
                    </p>
                    <p
                      className={`text-xs mt-1 font-bold ${
                        seleccionada ? 'text-red-300' : 'text-zinc-400'
                      }`}
                    >
                      Bs {precioOpcion.toFixed(2)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ✅ RESUMEN DE PRECIO — SE ACTUALIZA AUTOMÁTICAMENTE */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 p-4 rounded-xl border border-emerald-800/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-300 font-bold">
                Plan seleccionado:
              </span>
              <span className="text-xs font-black text-emerald-300">
                {duracionSeleccionada} {duracionSeleccionada === 1 ? 'MES' : 'MESES'}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                {precioOriginalFinal && (
                  <p className="text-sm text-zinc-500 line-through font-semibold">
                    Bs {precioOriginalFinal.toFixed(2)}
                  </p>
                )}
                <p className="text-3xl font-black text-emerald-300 tracking-tight">
                  Bs {precioFinal.toFixed(2)}
                </p>
              </div>
              {ahorroTotal > 0 && (
                <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg">
                  AHORRAS Bs {ahorroTotal.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400/70 mt-1">
              Precio final • Impuestos incluidos • Entrega inmediata
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleComprar}
            disabled={estaAgotado}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              estaAgotado
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 hover:shadow-red-900/60 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {estaAgotado
              ? 'Servicio Agotado'
              : `Comprar por Bs ${precioFinal.toFixed(2)}`}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;