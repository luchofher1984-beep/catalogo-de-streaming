import React, { useState } from 'react';
import { ServicioStreaming } from '../../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  servicio: ServicioStreaming | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmarEliminar: (id: string) => Promise<boolean>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  servicio,
  isOpen,
  onClose,
  onConfirmarEliminar,
}) => {
  const [eliminando, setEliminando] = useState(false);

  if (!isOpen || !servicio) return null;

  const handleEliminar = async () => {
    setEliminando(true);
    const exito = await onConfirmarEliminar(servicio.id);
    setEliminando(false);
    if (exito) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#181818] border border-rose-900/60 rounded-2xl shadow-2xl shadow-rose-950/40 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">¿Eliminar este servicio?</h3>
            <p className="text-xs text-zinc-400">Esta acción removerá el servicio del catálogo</p>
          </div>
        </div>

        {/* Tarjeta del Servicio a eliminar */}
        <div className="my-4 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black/40 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
            <img
              src={servicio.logo_url}
              alt={servicio.nombre}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{servicio.nombre}</h4>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>${servicio.precio.toFixed(2)}/mes</span>
              <span>•</span>
              <span>{servicio.stock} unidades en stock</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          El servicio <strong className="text-white">"{servicio.nombre}"</strong> dejará de estar disponible para los clientes en la tienda inmediatamente.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-confirmar-eliminar-servicio"
            type="button"
            disabled={eliminando}
            onClick={handleEliminar}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center gap-2 transition-all cursor-pointer"
          >
            {eliminando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
