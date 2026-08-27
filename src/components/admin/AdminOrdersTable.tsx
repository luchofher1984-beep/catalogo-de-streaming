import React, { useState, useMemo } from 'react';
import { OrdenCompra } from '../../types';
import {
  Search,
  Copy,
  Check,
  AlertCircle,
  Calendar,
  Mail,
  User,
  Phone,
  ShieldCheck,
  Lock,
  Hash,
  Trash2,
  MessageCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';


interface TablaOrdenesProps {
  ordenes: OrdenCompra[] | any[];
  perfiles?: any[];
  onEliminarOrden?: (orden: any) => Promise<boolean>;
}


const AdminOrdersTable: React.FC<TablaOrdenesProps> = ({ 
  ordenes, 
  perfiles = [],
  onEliminarOrden 
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [copiandoTodo, setCopiandoTodo] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<{mostrar: boolean; orden: any}>({mostrar: false, orden: null});


  // 🇧🇴 Formatear FECHA SOLA (sin hora)
  const formatearFechaSola = (fechaEntrada: any): string => {
    if (!fechaEntrada) return '—';
    const fecha = new Date(fechaEntrada);
    const fechaBolivia = new Date(fecha.getTime() - 4 * 60 * 60 * 1000);
    const dia = String(fechaBolivia.getUTCDate()).padStart(2, '0');
    const mes = String(fechaBolivia.getUTCMonth() + 1).padStart(2, '0');
    const anio = fechaBolivia.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  };


  // 🇧🇴 Formatear completa (ID & Fecha con hora)
  const formatearFechaCompleta = (fechaEntrada: any): string => {
    if (!fechaEntrada) return '—';
    const fecha = new Date(fechaEntrada);
    const fechaBolivia = new Date(fecha.getTime() - 4 * 60 * 60 * 1000);
    const dia = String(fechaBolivia.getUTCDate()).padStart(2, '0');
    const mes = String(fechaBolivia.getUTCMonth() + 1).padStart(2, '0');
    const anio = fechaBolivia.getUTCFullYear();
    const horas = String(fechaBolivia.getUTCHours()).padStart(2, '0');
    const minutos = String(fechaBolivia.getUTCMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio}, ${horas}:${minutos} ${Number(horas) >= 12 ? 'p.m.' : 'a.m.'}`;
  };


  // ✅ CALCULAR VENCIMIENTO
  const calcularVencimiento = (orden: any): string => {
    const fechaCompra = orden.creada_en || orden.fecha;
    const meses = Number(orden.duracion_meses) || 1;
    if (!fechaCompra) return '—';
    const fecha = new Date(fechaCompra);
    fecha.setMonth(fecha.getMonth() + meses);
    const fechaBolivia = new Date(fecha.getTime() - 4 * 60 * 60 * 1000);
    const dia = String(fechaBolivia.getUTCDate()).padStart(2, '0');
    const mes = String(fechaBolivia.getUTCMonth() + 1).padStart(2, '0');
    const anio = fechaBolivia.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  };


  // Filtrar órdenes
  const ordenesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return ordenes;
    const buscar = busqueda.toLowerCase();
    return ordenes.filter((o: any) =>
      o.servicio_nombre?.toLowerCase().includes(buscar) ||
      o.cliente_nombre?.toLowerCase().includes(buscar) ||
      (o.cliente_correo || o.cliente_email || o.correo || '').toLowerCase().includes(buscar) ||
      o.id?.toLowerCase().includes(buscar)
    );
  }, [ordenes, busqueda]);


  // ✅ COPIAR TODAS LAS CREDENCIALES JUNTAS
  const copiarTodo = (orden: any) => {
    const correo = orden.cuenta_correo || orden.correo || 'Sin correo';
    const pass = orden.cuenta_contrasena || orden.contrasena || orden.clave || 'Sin contraseña';
    const perfil = orden.cuenta_perfil || orden.perfil || 'No especificado';
    const pin = orden.cuenta_pin || orden.pin || 'No especificado';

    const textoCompleto = `📧 Correo: ${correo}\n🔑 Contraseña: ${pass}\n👤 Perfil: ${perfil}\n#️⃣ PIN: ${pin}`;
    
    navigator.clipboard.writeText(textoCompleto);
    setCopiandoTodo(orden.id);
    setTimeout(() => setCopiandoTodo(null), 2000);
  };


  // Copiar ID
  const copiarId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };


  // ✅ MOSTRAR VENTANA DE CONFIRMACIÓN
  const mostrarConfirmarEliminar = (orden: any) => {
    setConfirmacion({ mostrar: true, orden });
  };


  // ✅ CONFIRMAR Y ELIMINAR — SIN VENTANA DE ÉXITO
  const confirmarEliminar = async () => {
    if (!confirmacion.orden || !onEliminarOrden) {
      setConfirmacion({ mostrar: false, orden: null });
      return;
    }

    const ordenAEliminar = confirmacion.orden;
    setConfirmacion({ mostrar: false, orden: null });

    // ✅ ELIMINAMOS — SIN MOSTRAR VENTANA DE ÉXITO
    await onEliminarOrden(ordenAEliminar);
  };


  const cancelarEliminar = () => {
    setConfirmacion({ mostrar: false, orden: null });
  };


  return (
    <div className="space-y-4">
      {/* ✅ VENTANA DE CONFIRMACIÓN — SOLO ESTA APARECE */}
      {confirmacion.mostrar && confirmacion.orden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={22} className="text-amber-400" />
              <h3 className="text-lg font-bold text-white">¿ELIMINAR ESTA ORDEN?</h3>
            </div>
            <div className="space-y-2 mb-6">
              <p className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                La cuenta VOLVERÁ a "Todas las Cuentas" → DISPONIBLE
              </p>
              <p className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                El stock del servicio AUMENTARÁ automáticamente en el catálogo
              </p>
            </div>
            <p className="text-zinc-300 text-sm mb-6">¿Deseas continuar?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarEliminar}
                className="px-6 py-2.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Buscador */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por servicio, cliente, correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>


      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-2 py-3 text-left">ID & Fecha</th>
              <th className="px-2 py-3 text-left">Cliente</th>
              <th className="px-2 py-3 text-left">Servicio</th>
              <th className="px-2 py-3 text-left">Credenciales de la Cuenta</th>
              <th className="px-2 py-3 text-left">Fecha Compra</th>
              <th className="px-2 py-3 text-left">Vencimiento</th>
              <th className="px-2 py-3 text-left">Monto</th>
              <th className="px-2 py-3 text-left">Estado</th>
              <th className="px-2 py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {ordenesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-zinc-500">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  Sin pedidos registrados
                </td>
              </tr>
            ) : (
              ordenesFiltradas.map((orden: any) => {
                const correo = orden.cuenta_correo || orden.correo || 'Sin correo';
                const pass = orden.cuenta_contrasena || orden.contrasena || orden.clave || 'Sin contraseña';
                const perfil = orden.cuenta_perfil || orden.perfil || 'No especificado';
                const pin = orden.cuenta_pin || orden.pin || 'No especificado';
                const vencimiento = calcularVencimiento(orden);

                return (
                  <tr key={orden.id} className="hover:bg-zinc-900/50">
                    {/* ID & Fecha */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => copiarId(orden.id)} 
                          className="text-zinc-400 hover:text-white shrink-0"
                          title="Copiar ID"
                        >
                          {copiadoId === orden.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-zinc-300 truncate max-w-[100px]">
                            {orden.id?.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-zinc-500">
                            {formatearFechaCompleta(orden.creada_en || orden.fecha)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-2 py-2">
                      <div className="font-medium text-white">{orden.cliente_nombre || 'Cliente'}</div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <Mail size={11} />
                        {orden.cliente_correo || orden.cliente_email || 'Sin correo'}
                      </div>
                      {(orden.cliente_telefono || orden.telefono) && (
                        <div className="text-xs text-zinc-500 flex items-center gap-1">
                          <Phone size={11} />
                          {orden.cliente_telefono || orden.telefono}
                          <a 
                            href={`https://wa.me/591${(orden.cliente_telefono || orden.telefono || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-green-400 hover:text-green-300"
                            title="Notificar por WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Servicio */}
                    <td className="px-2 py-2">
                      <div className="font-medium">{orden.servicio_nombre || 'Desconocido'}</div>
                    </td>

                    {/* Credenciales + Botón Copiar Todo */}
                    <td className="px-2 py-2 text-xs">
                      <div className="space-y-0.5 mb-2">
                        <div className="flex items-center gap-1">
                          <Mail size={11} className="text-zinc-400 shrink-0" />
                          <span className="text-emerald-300 truncate max-w-[140px]" title={correo}>{correo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock size={11} className="text-zinc-400 shrink-0" />
                          <span className="text-amber-300">••••••••</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={11} className="text-zinc-400 shrink-0" />
                          <span className="text-blue-300">Perfil: {perfil}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash size={11} className="text-zinc-400 shrink-0" />
                          <span className="text-orange-300">PIN: {pin}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copiarTodo(orden)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900 rounded text-xs border border-emerald-800 transition"
                        title="Copiar TODAS las credenciales"
                      >
                        {copiandoTodo === orden.id ? (
                          <><Check size={12} /> Copiado</>
                        ) : (
                          <><FileText size={12} /> Copiar Todo</>
                        )}
                      </button>
                    </td>

                    {/* Fecha Compra — solo fecha */}
                    <td className="px-2 py-2 text-xs font-medium">
                      {formatearFechaSola(orden.creada_en || orden.fecha)}
                    </td>

                    {/* Vencimiento */}
                    <td className="px-2 py-2 text-xs font-medium text-amber-400">
                      {vencimiento}
                    </td>

                    {/* Monto */}
                    <td className="px-2 py-2 font-bold text-emerald-400 whitespace-nowrap">
                      {Number(orden.total || orden.monto || 0).toFixed(2)} Bs
                    </td>

                    {/* Estado */}
                    <td className="px-2 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        orden.estado === 'completada' || orden.estado === 'entregado' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' :
                        orden.estado === 'pendiente' ? 'bg-amber-950/60 text-amber-400 border border-amber-800' :
                        'bg-red-950/60 text-red-400 border border-red-800'
                      }`}>
                        <ShieldCheck size={10} />
                        {orden.estado || 'pendiente'}
                      </span>
                    </td>

                    {/* Acción — Botón Eliminar */}
                    <td className="px-2 py-2 text-center">
                      {onEliminarOrden ? (
                        <button
                          onClick={() => mostrarConfirmarEliminar(orden)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold border border-red-500 shadow-lg shadow-red-900/50 transition transform hover:scale-105"
                          title="🗑️ ELIMINAR → Liberar cuenta y aumentar stock"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                          Eliminar
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500">Sin acción</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export { AdminOrdersTable };