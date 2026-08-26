import React, { useState, useEffect } from 'react';

interface ConfiguracionSistema {
  id?: string;
  qr_imagen_url?: string;
  qr_instrucciones?: string;
  metodo_qr_activo?: boolean;
  metodo_transferencia_activo?: boolean;
  metodo_efectivo_activo?: boolean;
  dias_garantia_default?: number;
  correo_soporte?: string;
  mensaje_pie_pagina?: string;
  actualizado_en?: string;
}

interface AdminSettingsViewProps {
  configuracion: ConfiguracionSistema | null;
  onGuardarConfiguracion: (config: Partial<ConfiguracionSistema>, imagenQR?: File) => Promise<boolean>;
}

const VALORES_POR_DEFECTO: ConfiguracionSistema = {
  qr_imagen_url: '',
  qr_instrucciones: 'Escanea el código QR y realiza el pago. Luego envía el comprobante por WhatsApp.',
  metodo_qr_activo: true,
  metodo_transferencia_activo: true,
  metodo_efectivo_activo: false,
  dias_garantia_default: 30,
  correo_soporte: 'fherchoapaza@gmail.com',
  mensaje_pie_pagina: '© 2026 Tu Tienda de Streaming • Todos los derechos reservados',
};

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ configuracion, onGuardarConfiguracion }) => {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string>('');

  // 🔑 ESTADO LOCAL: Aquí es donde guardamos los valores del formulario
  const [valores, setValores] = useState<ConfiguracionSistema>(VALORES_POR_DEFECTO);

  // ✅ Cuando llegue la configuración desde AFUERA → ACTUALIZAMOS el formulario
  useEffect(() => {
    console.log('👉 LLEGÓ configuración:', configuracion);
    if (configuracion && Object.keys(configuracion).length > 0) {
      setValores({
        ...VALORES_POR_DEFECTO,
        ...configuracion,
      });
      if (configuracion.qr_imagen_url) {
        setVistaPrevia(configuracion.qr_imagen_url);
      }
    }
  }, [configuracion]); // 👈 Se ejecuta cada vez que cambia "configuracion"

  const handleCambiar = (campo: keyof ConfiguracionSistema, valor: any) => {
    setValores(prev => ({ ...prev, [campo]: valor }));
  };

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      setImagenSeleccionada(archivo);
      const url = URL.createObjectURL(archivo);
      setVistaPrevia(url);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const exito = await onGuardarConfiguracion(valores, imagenSeleccionada || undefined);
      if (exito) {
        setMensaje({ tipo: 'exito', texto: '✅ Configuración guardada correctamente!' });
      } else {
        setMensaje({ tipo: 'error', texto: '❌ Error al guardar. Intenta de nuevo.' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: '❌ Error inesperado.' });
    }
    setCargando(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 🔴 ESTADO DE DEPURACIÓN — Bórralo después de que funcione */}
      <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
        <p className="text-red-300 text-sm font-bold">🔧 Depuración:</p>
        <p className="text-red-200 text-xs">configuracion = {configuracion ? '✅ TIENE DATOS' : '❌ ES NULL'}</p>
        <p className="text-red-200 text-xs">valores.qr_instrucciones = {valores.qr_instrucciones?.substring(0, 30)}...</p>
      </div>

      <h2 className="text-2xl font-black text-white">⚙️ Configuraciones del Sistema</h2>

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* QR de Pago */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-lg font-bold text-white mb-4">📷 Código QR de Pago</h3>
          
          {vistaPrevia ? (
            <div className="mb-4">
              <img src={vistaPrevia} alt="QR de pago" className="w-48 h-48 object-cover rounded-lg border border-zinc-600" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 mb-4">
              Sin imagen
            </div>
          )}

          <label className="block mb-2 text-sm font-medium text-zinc-300">Subir imagen QR</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImagen}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
          />
        </div>

        {/* Instrucciones */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-lg font-bold text-white mb-4">📝 Instrucciones de Pago</h3>
          <textarea
            value={valores.qr_instrucciones || ''}
            onChange={(e) => handleCambiar('qr_instrucciones', e.target.value)}
            rows={4}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Métodos de Pago */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-700">
          <h3 className="text-lg font-bold text-white mb-4">💳 Métodos de Pago Habilitados</h3>
          <div className="space-y-3">
            {[
              { clave: 'metodo_qr_activo', etiqueta: 'Pago por Código QR' },
              { clave: 'metodo_transferencia_activo', etiqueta: 'Transferencia Bancaria' },
              { clave: 'metodo_efectivo_activo', etiqueta: 'Pago en Efectivo' },
            ].map(item => (
              <label key={item.clave} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!valores[item.clave as keyof ConfiguracionSistema]}
                  onChange={(e) => handleCambiar(item.clave as keyof ConfiguracionSistema, e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-red-600 focus:ring-red-500"
                />
                <span className="text-zinc-200">{item.etiqueta}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Datos Generales */}
        <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-700 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">🏷️ Datos Generales</h3>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-zinc-300">Días de Garantía</label>
            <input
              type="number"
              value={valores.dias_garantia_default || 30}
              onChange={(e) => handleCambiar('dias_garantia_default', parseInt(e.target.value) || 30)}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-zinc-300">Correo de Soporte</label>
            <input
              type="email"
              value={valores.correo_soporte || ''}
              onChange={(e) => handleCambiar('correo_soporte', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-zinc-300">Texto del Pie de Página</label>
            <input
              type="text"
              value={valores.mensaje_pie_pagina || ''}
              onChange={(e) => handleCambiar('mensaje_pie_pagina', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Mensaje y Botón */}
        {mensaje && (
          <div className={`p-4 rounded-lg font-medium ${
            mensaje.tipo === 'exito' ? 'bg-green-900/30 text-green-300 border border-green-600' : 'bg-red-900/30 text-red-300 border border-red-600'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 transition-all"
        >
          {cargando ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};