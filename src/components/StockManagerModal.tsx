import React from 'react';
import { ServicioStreaming } from '../types';
import { Sliders, RefreshCw, X, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

interface StockManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicios: ServicioStreaming[];
  onActualizarStock: (servicioId: string, nuevoStock: number) => void;
  onResetearCatalogo: () => void;
}

export const StockManagerModal: React.FC<StockManagerModalProps> = ({
  isOpen,
  onClose,
  servicios,
  onActualizarStock,
  onResetearCatalogo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Cabecera */}
        <div className="p-5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Simulador de Stock en Tiempo Real
              </h2>
              <p className="text-xs text-zinc-400">
                Ajusta el stock de cada servicio para probar el botón 'Agotado' y 'Comprar'
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones Rápidas */}
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-zinc-400">
            Prueba rápida del requerimiento:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetearCatalogo}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Valores Iniciales</span>
            </button>
          </div>
        </div>

        {/* Lista de Servicios con Controles de Stock */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {servicios.map((s) => {
            const estaAgotado = s.stock === 0;

            return (
              <div
                key={s.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  estaAgotado
                    ? 'bg-rose-950/20 border-rose-900/40'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-zinc-800 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={s.logo_url}
                      alt={s.nombre}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {s.nombre}
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      ${s.precio.toFixed(2)} USD • {s.tipo_cuenta}
                    </span>
                  </div>
                </div>

                {/* Control de Stock */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => onActualizarStock(s.id, Math.max(0, s.stock - 1))}
                      className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                    >
                      -
                    </button>
                    <span
                      className={`w-10 text-center font-mono font-bold text-xs ${
                        estaAgotado ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {s.stock}
                    </span>
                    <button
                      onClick={() => onActualizarStock(s.id, s.stock + 1)}
                      className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onActualizarStock(s.id, estaAgotado ? 5 : 0)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      estaAgotado
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                        : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                    }`}
                  >
                    {estaAgotado ? 'Reponer (+5)' : 'Poner en 0'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Los cambios se reflejan inmediatamente en el catálogo y base de datos.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-md"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
