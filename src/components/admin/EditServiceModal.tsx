import React, { useState, useEffect } from 'react';
import { ServicioStreaming } from '../../types';
import { X, Check, DollarSign, Package, Save, Info, AlertTriangle } from 'lucide-react';



interface EditServiceModalProps {
  servicio: ServicioStreaming | null;
  isOpen: boolean;
  onClose: () => void;
  onGuardarCambios: (id: string, updates: Partial<ServicioStreaming>) => Promise<boolean>;
}



export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  servicio,
  isOpen,
  onClose,
  onGuardarCambios,
}) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioOriginal, setPrecioOriginal] = useState('');
  const [stock, setStock] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('');
  const [duracion, setDuracion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');



  useEffect(() => {
    if (servicio) {
      setNombre(servicio.nombre);
      setPrecio(servicio.precio.toString());

      // ✅ precio_original
      let po: string = '';
      if (servicio.precio_original !== undefined && servicio.precio_original !== null) {
        po = String(servicio.precio_original);
      }
      setPrecioOriginal(po);

      setStock(servicio.stock.toString());

      // ✅ logo_url — CORREGIDO
      let logo: string = '';
      if (servicio.logo_url !== undefined && servicio.logo_url !== null) {
        logo = servicio.logo_url;
      }
      setLogoUrl(logo);

      // ✅ tipo_cuenta
      let tc: string = 'Cuenta Completa 4K';
      if (servicio.tipo_cuenta !== undefined && servicio.tipo_cuenta !== null) {
        tc = servicio.tipo_cuenta;
      }
      setTipoCuenta(tc);

      // ✅ duracion
      let dur: string = '30 Días';
      if (servicio.duracion !== undefined && servicio.duracion !== null) {
        dur = servicio.duracion;
      }
      setDuracion(dur);

      // ✅ descripcion
      let desc: string = '';
      if (servicio.descripcion !== undefined && servicio.descripcion !== null) {
        desc = servicio.descripcion;
      }
      setDescripcion(desc);

      setDestacado(!!servicio.destacado);
      setErrorMsg('');
    }
  }, [servicio]);



  if (!isOpen || !servicio) return null;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');


    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorMsg('El precio debe ser un número válido mayor a 0.');
      return;
    }


    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }


    setGuardando(true);


    const updates: Partial<ServicioStreaming> = {
      nombre: nombre.trim(),
      precio: precioNum,
      stock: stockNum,
      logo_url: logoUrl.trim() || servicio.logo_url,
      tipo_cuenta: tipoCuenta,
      duracion,
      descripcion,
      destacado,
    };


    if (precioOriginal.trim() !== '') {
      updates.precio_original = parseFloat(precioOriginal);
    }


    const exito = await onGuardarCambios(servicio.id, updates);


    setGuardando(false);
    if (exito) {
      onClose();
    }
  };



  const stockNum = parseInt(stock || '0', 10);



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 p-1.5 flex items-center justify-center">
              <img
                src={servicio.logo_url}
                alt={servicio.nombre}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Editar Servicio
              </h2>
              <p className="text-xs text-zinc-400">
                Actualiza precio, stock y datos de {servicio.nombre}
              </p>
            </div>
          </div>


          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>


        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}


          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Nombre del Servicio
            </label>
            <input
              id="input-editar-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-[#121212] text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Precio de Venta (Bs.)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">Bs.</span>
                <input
                  id="input-editar-precio"
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full bg-[#121212] text-white text-sm pl-10 pr-3 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                />
              </div>
            </div>


            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Stock Disponible (Unidades)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStock(Math.max(0, parseInt(stock, 10) - 1).toString())}
                  className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-base flex items-center justify-center border border-zinc-700"
                >
                  -
                </button>
                <input
                  id="input-editar-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="flex-1 text-center bg-[#121212] text-white text-sm py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setStock((parseInt(stock, 10) + 1).toString())}
                  className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-base flex items-center justify-center border border-zinc-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>


          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            parseInt(stock || '0', 10) === 0
              ? 'bg-rose-950/50 border-rose-800/80 text-rose-300'
              : parseInt(stock || '0', 10) <= 3
                ? 'bg-amber-950/50 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              parseInt(stock || '0', 10) === 0 ? 'bg-rose-500' : parseInt(stock || '0', 10) <= 3 ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
            <div>
              <strong>Estado en catálogo: </strong>
              {parseInt(stock || '0', 10) === 0 ? (
                <span>El botón mostrará <span className="underline font-bold">Agotado</span> y estará deshabilitado.</span>
              ) : (
                <span>El botón mostrará <span className="underline font-bold">Comprar</span> con {parseInt(stock || '0', 10)} unidades disponibles.</span>
              )}
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Precio Regular / Anterior (Bs.)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Bs.</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precioOriginal}
                onChange={(e) => setPrecioOriginal(e.target.value)}
                placeholder="7,99"
                className="w-full bg-[#121212] text-zinc-300 text-sm pl-10 pr-3 py-2.5 rounded-xl border border-zinc-700 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              URL del Logo
            </label>
            <input
              id="input-editar-logo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-[#121212] text-zinc-300 text-xs px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
            />
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Tipo de Cuenta
              </label>
              <input
                type="text"
                value={tipoCuenta}
                onChange={(e) => setTipoCuenta(e.target.value)}
                className="w-full bg-[#121212] text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Duración
              </label>
              <input
                type="text"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-[#121212] text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-[#121212] text-white text-xs sm:text-sm p-3 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none resize-none"
            />
          </div>


          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <input
              id="checkbox-editar-destacado"
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded bg-zinc-800 border-zinc-700 focus:ring-red-500"
            />
            <label htmlFor="checkbox-editar-destacado" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Servicio Destacado en Catálogo
            </label>
          </div>


          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-edicion-servicio"
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-900/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};