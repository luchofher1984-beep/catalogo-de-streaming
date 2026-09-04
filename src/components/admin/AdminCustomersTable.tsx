import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, ShieldCheck, Calendar, Trash2, Gift, X, MessageCircle } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  correo: string;
  contrasena?: string;
  telefono?: string;
  fecha_registro: string;
  estado: 'activo' | 'bloqueado';
  total_gastado: number;
}

interface CuentaServicio {
  id: string;
  servicio_id: string;
  usuario_correo: string;
  contrasena: string;
  perfil?: string;
  pin?: string;
  estado: 'disponible' | 'entregada';
}

interface ServicioStreaming {
  id: string;
  nombre: string;
  logo_url?: string;
  precio: number;
  categoria_label?: string;
}

interface AdminCustomersTableProps {
  servicios: ServicioStreaming[];
  todasLasCuentas: CuentaServicio[];
  onEliminarCliente?: (id: string) => Promise<boolean>;
  onAsignarCuentaManual: (
    clienteId: string,
    cuentaId: string,
    servicioId: string,
    meses: number,
    fechaVencimientoManual?: string // ✅ NUEVO: Fecha manual
  ) => Promise<boolean>;
}

export const AdminCustomersTable: React.FC<AdminCustomersTableProps> = ({
  servicios,
  todasLasCuentas,
  onEliminarCliente,
  onAsignarCuentaManual,
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'bloqueado'>('todos');
  const [confirmacion, setConfirmacion] = useState<{mostrar: boolean; cliente: Cliente | null}>({mostrar: false, cliente: null});
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<string>('');
  const [cuentaSeleccionadaId, setCuentaSeleccionadaId] = useState<string>('');
  const [mesesSeleccionados, setMesesSeleccionados] = useState<number>(1);
  const [fechaVencimientoManual, setFechaVencimientoManual] = useState<string>(''); // ✅ NUEVO: Estado fecha manual
  const [procesando, setProcesando] = useState(false);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const { supabaseService } = await import('../../services/supabaseService');
      const { data } = await supabaseService.getClientes();
      setClientes(data || []);
    } catch (err) {
      console.error('❌ Error al cargar clientes:', err);
    } finally {
      setCargando(false);
    }
  };

  React.useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    return (clientes as any[]).filter((c) => {
      const termino = busqueda.toLowerCase().trim();
      const pasaBusqueda = !termino ||
        (c.nombre || '').toLowerCase().includes(termino) ||
        (c.correo || '').toLowerCase().includes(termino);
      const pasaEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
      return pasaBusqueda && pasaEstado;
    });
  }, [clientes, busqueda, filtroEstado]);

  const cuentasDisponibles = useMemo(() => {
    if (!servicioSeleccionadoId) return [];
    return todasLasCuentas.filter(
      c => c.servicio_id === servicioSeleccionadoId && c.estado === 'disponible'
    );
  }, [servicioSeleccionadoId, todasLasCuentas]);

  const servicioSeleccionado = servicios.find(s => s.id === servicioSeleccionadoId);
  const precioTotal = servicioSeleccionado ? servicioSeleccionado.precio * mesesSeleccionados : 0;

  const abrirModalAsignar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setServicioSeleccionadoId('');
    setCuentaSeleccionadaId('');
    setMesesSeleccionados(1);
    setFechaVencimientoManual(''); // ✅ Reiniciar fecha al abrir
    setModalAsignarAbierto(true);
  };

  const confirmarAsignacion = async () => {
    if (!clienteSeleccionado || !cuentaSeleccionadaId || !servicioSeleccionadoId) return;
    setProcesando(true);

    // ✅ Usar fecha manual si la escribió, si no calcular automáticamente
    let fechaVencimiento: string;
    if (fechaVencimientoManual) {
      fechaVencimiento = fechaVencimientoManual;
    } else {
      const fechaCalc = new Date();
      fechaCalc.setMonth(fechaCalc.getMonth() + mesesSeleccionados);
      fechaVencimiento = fechaCalc.toISOString().split('T')[0];
    }

    const exito = await onAsignarCuentaManual!(
      clienteSeleccionado.id,
      cuentaSeleccionadaId,
      servicioSeleccionadoId,
      mesesSeleccionados,
      fechaVencimiento // ✅ Enviamos la fecha manual
    );

    setProcesando(false);
    if (exito) {
      alert(`✅ Cuenta asignada correctamente a ${clienteSeleccionado.nombre}\n📅 Vencimiento: ${fechaVencimiento}\n📱 WhatsApp abierto con el mensaje listo para enviar`);
      setModalAsignarAbierto(false);
      await cargarClientes();
    }
  };

  const mostrarConfirmarEliminar = (cliente: Cliente) => {
    setConfirmacion({ mostrar: true, cliente });
  };

  const confirmarEliminar = async () => {
    if (!confirmacion.cliente) return;
    
    try {
      let exito = false;
      if (onEliminarCliente) {
        exito = await onEliminarCliente(confirmacion.cliente.id);
      } else {
        const { supabaseService } = await import('../../services/supabaseService');
        const resultado = await supabaseService.eliminarCliente(confirmacion.cliente.id);
        exito = resultado.success;
        
        if (!exito) {
          console.error('❌ Error al eliminar:', resultado.error);
          alert('❌ Error: ' + (resultado.error?.message || 'No se pudo eliminar'));
        }
      }
      if (exito) {
        alert('✅ Cliente eliminado correctamente');
        await cargarClientes();
      }
    } catch (err: any) {
      console.error('❌ Excepción al eliminar:', err);
      alert('❌ Error: ' + (err.message || 'Error al eliminar cliente'));
    }
    
    setConfirmacion({ mostrar: false, cliente: null });
  };

  const cancelarEliminar = () => {
    setConfirmacion({ mostrar: false, cliente: null });
  };

  const formatearFecha = (fecha: any) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-BO');
  };

  if (cargando) {
    return <div className="p-8 text-center text-zinc-400">🔄 Cargando clientes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* MODAL: ASIGNAR CUENTA MANUALMENTE */}
      {modalAsignarAbierto && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-zinc-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  Asignar Cuenta Manualmente
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Cliente: <span className="text-white font-semibold">{clienteSeleccionado.nombre}</span>
                  {clienteSeleccionado.telefono && (
                    <span className="ml-2 text-emerald-400">📱 {clienteSeleccionado.telefono}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setModalAsignarAbierto(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* PASO 1: Elegir servicio */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">
                  📌 Paso 1: Elige el servicio
                </label>
                <select
                  value={servicioSeleccionadoId}
                  onChange={(e) => {
                    setServicioSeleccionadoId(e.target.value);
                    setCuentaSeleccionadaId('');
                  }}
                  className="w-full bg-[#121212] text-white border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Selecciona un servicio --</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} - ${s.precio.toFixed(2)}/mes
                    </option>
                  ))}
                </select>
              </div>

              {/* Duración en meses */}
              {servicioSeleccionadoId && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    📅 Duración en meses
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 6, 12].map(m => (
                      <button
                        key={m}
                        onClick={() => setMesesSeleccionados(m)}
                        className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                          mesesSeleccionados === m
                            ? 'bg-amber-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {m} mes{m > 1 ? 'es' : ''}
                      </button>
                    ))}
                  </div>
                  {servicioSeleccionado && (
                    <p className="mt-2 text-xs text-amber-400 font-bold">
                      💰 Total: ${precioTotal.toFixed(2)} (${servicioSeleccionado.precio.toFixed(2)} × {mesesSeleccionados} meses)
                    </p>
                  )}
                </div>
              )}

              {/* ✅ NUEVO: FECHA DE VENCIMIENTO MANUAL */}
              {servicioSeleccionadoId && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    📅 Fecha de Vencimiento <span className="text-amber-400">(Escríbela tú)</span>
                  </label>
                  <input
                    type="date"
                    value={fechaVencimientoManual}
                    onChange={(e) => setFechaVencimientoManual(e.target.value)}
                    className="w-full bg-[#121212] text-white border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    💡 Si no eliges fecha, se calculará automáticamente según los meses
                  </p>
                </div>
              )}

              {/* PASO 2: Elegir cuenta disponible */}
              {servicioSeleccionadoId && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    🔑 Paso 2: Elige una cuenta disponible
                    <span className="ml-2 text-amber-400">
                      ({cuentasDisponibles.length} disponibles)
                    </span>
                  </label>
                  
                  {cuentasDisponibles.length === 0 ? (
                    <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-sm text-rose-300">
                      ⚠️ No hay cuentas disponibles para este servicio. Agrega cuentas primero.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {cuentasDisponibles.map(cuenta => (
                        <label
                          key={cuenta.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            cuentaSeleccionadaId === cuenta.id
                              ? 'bg-amber-950/40 border-amber-600/60'
                              : 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cuenta"
                            checked={cuentaSeleccionadaId === cuenta.id}
                            onChange={() => setCuentaSeleccionadaId(cuenta.id)}
                            className="mt-1 accent-amber-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm break-all">
                                {cuenta.usuario_correo}
                              </span>
                              {cuenta.perfil && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300">
                                  👤 {cuenta.perfil}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1 space-x-3">
                              <span>🔑 {cuenta.contrasena}</span>
                              {cuenta.pin && <span>📌 PIN: {cuenta.pin}</span>}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESUMEN */}
              {cuentaSeleccionadaId && servicioSeleccionado && (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs">
                  <p className="text-emerald-300">
                    ✅ Se creará una orden por <strong>${precioTotal.toFixed(2)}</strong> ({mesesSeleccionados} mes{mesesSeleccionados > 1 ? 'es' : ''})
                    <br />
                    📅 Vencimiento: <strong>{fechaVencimientoManual || 'Se calculará automáticamente'}</strong>
                    <br />
                    📱 Al confirmar se abrirá <strong>WhatsApp</strong> con el mensaje listo para enviar
                    <br />
                    La cuenta se marcará como <strong>Entregada</strong> y el stock bajará automáticamente.
                  </p>
                </div>
              )}

              {/* BOTONES */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalAsignarAbierto(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold transition-colors"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAsignacion}
                  disabled={!cuentaSeleccionadaId || procesando}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {procesando ? '⏳ Procesando...' : '✅ Asignar + WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VENTANA DE CONFIRMACIÓN ELIMINAR */}
      {confirmacion.mostrar && confirmacion.cliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">⚠️ Confirmar Eliminación</h3>
            <p className="text-zinc-300 mb-6">
              ¿Desea eliminar al cliente: <strong className="text-amber-400">{confirmacion.cliente.nombre}</strong>?
            </p>
            <p className="text-rose-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarEliminar}
                className="px-6 py-2.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 font-medium transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmarEliminar}
                className="px-6 py-2.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-medium transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'activo', 'bloqueado'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {estado === 'todos' ? 'Todos' : estado === 'activo' ? 'Activos' : 'Bloqueados'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-left text-zinc-300">
            <tr>
              <th className="py-3 px-4">CLIENTE</th>
              <th className="py-3 px-4">FECHA REGISTRO</th>
              <th className="py-3 px-4">ESTADO</th>
              <th className="py-3 px-4">TOTAL GASTADO</th>
              <th className="py-3 px-4">CONTRASEÑA</th>
              <th className="py-3 px-4 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-400">❌ No se encontraron clientes</td>
              </tr>
            ) : (
              clientesFiltrados.map((cli: any) => (
                <tr key={cli.id} className="hover:bg-zinc-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {(cli.nombre || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{cli.nombre}</div>
                        <div className="text-xs text-zinc-400">{cli.correo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">{formatearFecha(cli.fecha_registro)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      cli.estado === 'activo' 
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' 
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                    }`}>
                      {cli.estado === 'activo' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      {(cli.estado || 'activo').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">
                    ${Number(cli.total_gastado || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-amber-400 font-bold">
                    {cli.contrasena || 'Sin contraseña'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => abrirModalAsignar(cli)}
                        className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors"
                        title="🎁 Asignar cuenta + WhatsApp"
                      >
                        <Gift className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => mostrarConfirmarEliminar(cli)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};