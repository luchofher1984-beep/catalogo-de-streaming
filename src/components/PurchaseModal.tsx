import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { ServicioStreaming, OrdenCompra } from '../types';

interface PurchaseModalProps {
  servicio: ServicioStreaming | null;
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onCompraExitosa: (orden: OrdenCompra) => void;
  onSuccess?: (data: any) => void;
  duracionSeleccionada?: number;
  precioFinalCalculado?: number;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ 
  servicio, 
  user, 
  isOpen,
  onClose, 
  onCompraExitosa,
  onSuccess,
  duracionSeleccionada = 1,
  precioFinalCalculado,
}) => {
  const [loading, setLoading] = useState(false);
  const [configuracion, setConfiguracion] = useState<any>(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);

  // ✅ CAMPOS QUE EL CLIENTE ESCRIBE
  const [nombreCliente, setNombreCliente] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');

  useEffect(() => {
    const cargarConfig = async () => {
      const { data } = await supabaseService.getConfiguracion();
      setConfiguracion(data);
      setCargandoConfig(false);
    };
    cargarConfig();
  }, []);

  if (!isOpen || !servicio) return null;

  const precioAMostrar = precioFinalCalculado && precioFinalCalculado > 0 
    ? precioFinalCalculado 
    : servicio?.precio ?? 0;

  const textoDuracion = duracionSeleccionada === 1 
    ? '1 MES' 
    : `${duracionSeleccionada} MESES`;

  const handleConfirm = async () => {
    if (!nombreCliente.trim() || !correoCliente.trim()) {
      alert('⚠️ Por favor escribe tu nombre y correo antes de continuar');
      return;
    }

    setLoading(true);
    try {
      if (!servicio.id) {
        throw new Error('El servicio no tiene un ID válido');
      }

      // ✅ DATOS DEL CLIENTE — ASEGURAMOS QUE NO LLEGUEN VACÍOS
      const datosCliente = {
        nombre: nombreCliente.trim(),
        correo: correoCliente.trim() || 'correo-no-registrado@email.com',
        telefono: telefonoCliente.trim() || 'No especificado'
      };

      console.log('👤 Datos enviados → Nombre:', datosCliente.nombre, '| Correo:', datosCliente.correo, '| Teléfono:', datosCliente.telefono);
      console.log('📅 Meses comprados:', duracionSeleccionada);

      // ✅ LLAMADA CORRECTA CON 4 PARÁMETROS
      const { data, error } = await supabaseService.comprarServicio(
        servicio.id, 
        1,
        datosCliente,
        duracionSeleccionada
      );

      if (error) throw new Error(error);

      const numeroWhatsApp = "59169162105"; 
      const nombreServicio = servicio?.nombre ?? 'Servicio';
      const mensaje = `Hola, acabo de realizar el pago de Bs ${precioAMostrar.toFixed(2)} por el servicio de ${nombreServicio} por ${textoDuracion}. Adjunto mi comprobante de pago.`;
      
      const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappUrl, '_blank');

      onCompraExitosa(data as OrdenCompra);
      if (onSuccess) {
        onSuccess(data);
      }

      // ✅ Limpiar campos
      setNombreCliente('');
      setCorreoCliente('');
      setTelefonoCliente('');

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#141414] border border-gray-800 p-8 rounded-xl max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-xl cursor-pointer">✕</button>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Confirmar Compra</h2>
        
        <div className="mb-4 text-center">
          <p className="text-gray-400 mb-2">Estás a punto de adquirir:</p>
          <p className="text-xl font-bold text-white">{servicio?.nombre || 'Servicio'}</p>
          
          <div className="mt-2 inline-block px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-lg">
            <span className="text-xs font-black text-red-300">
              📅 PLAN: {textoDuracion}
            </span>
          </div>
          
          <p className="text-2xl font-bold text-red-500 mt-3">
            Bs {precioAMostrar.toFixed(2)}
          </p>
        </div>

        {/* ✅ CAMPOS PARA DATOS DEL CLIENTE */}
        <div className="mb-6 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-300 font-bold">Tu Nombre</span>
            <input 
              type="text"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Escribe tu nombre completo"
              className="mt-1 w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-300 font-bold">Tu Correo Electrónico</span>
            <input 
              type="email"
              value={correoCliente}
              onChange={(e) => setCorreoCliente(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="mt-1 w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-300 font-bold">Tu Teléfono (opcional)</span>
            <input 
              type="tel"
              value={telefonoCliente}
              onChange={(e) => setTelefonoCliente(e.target.value)}
              placeholder="+591 12345678"
              className="mt-1 w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </label>
        </div>

        {/* QR DE PAGO */}
        <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center mb-6">
          <p className="text-black font-bold text-lg mb-2">Escanea para pagar</p>
          
          {cargandoConfig ? (
            <div className="w-48 h-48 flex items-center justify-center text-gray-500">
              Cargando QR...
            </div>
          ) : configuracion?.qr_imagen_url ? (
            <img 
              src={configuracion.qr_imagen_url} 
              alt="QR de Pago" 
              className="w-48 h-48 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm">
              QR no configurado
            </div>
          )}
          
          <p className="text-gray-600 text-sm mt-2 text-center">
            Total a pagar: Bs {precioAMostrar.toFixed(2)}
          </p>
          
          <p className="text-red-600 text-xs mt-1 font-bold text-center">
            {configuracion?.qr_instrucciones || 'Importante: Envía tu comprobante al confirmar'}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-transparent border border-gray-600 text-white font-bold py-3 rounded hover:bg-gray-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Procesando...' : '✅ Confirmar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
};