import React, { useState, useEffect, useMemo } from 'react';
import { Cliente } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { 
  Search, Filter, ShieldAlert, ShieldCheck, Mail, 
  Edit, Eye, CreditCard, X, Calendar, AlertCircle, PlayCircle, User
} from 'lucide-react';

export const AdminCustomersTable: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'bloqueado'>('todos');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  useEffect(() => {
    const cargarClientes = async () => {
      setCargando(true);
      const { data } = await supabaseService.getClientes();
      setClientes(data || []);
      setCargando(false);
    };
    cargarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.correo.toLowerCase().includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
      return matchBusqueda && matchEstado;
    });
  }, [clientes, busqueda, filtroEstado]);

  const handleCambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activo' ? 'bloqueado' : 'activo';
    if (confirm(`¿Estás seguro de que deseas ${nuevoEstado === 'bloqueado' ? 'BLOQUEAR' : 'ACTIVAR'} a este cliente?`)) {
      await supabaseService.actualizarEstadoCliente(id, nuevoEstado);
      setClientes(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
      if (clienteSeleccionado?.id === id) {
        setClienteSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      }
    }
  };

  const handleNotificar = (correo: string) => {
    alert(`Se abriría el panel para enviar un correo o WhatsApp a: ${correo}`);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[#181818] p-4 rounded-2xl border border-zinc-800/90 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-[#121212] text-white pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/70 focus:border-red-500 focus:outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="bg-[#121212] text-white px-4 py-2.5 rounded-xl border border-zinc-700/70 focus:border-red-500 focus:outline-none text-sm appearance-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Solo Activos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-[#181818] rounded-2xl border border-zinc-800/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e1e1e] border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Registro</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Finanzas</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {cargando ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Cargando clientes...</td></tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No se encontraron clientes.</td></tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{cliente.nombre}</div>
                          <div className="text-xs text-zinc-500">{cliente.correo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {new Date(cliente.fecha_registro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        cliente.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {cliente.estado === 'activo' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-emerald-400">${cliente.total_gastado.toFixed(2)}</div>
                      {cliente.saldo_pendiente > 0 && (
                        <div className="text-xs text-rose-400 font-medium">Debe: ${cliente.saldo_pendiente.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setClienteSeleccionado(cliente)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors" title="Ver Perfil Completo">
                          <Eye className="w-4 h-4" />
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

      {/* Modal: Perfil del Cliente */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-[#1a1a1a]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center text-white font-bold text-xl">
                  {clienteSeleccionado.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {clienteSeleccionado.nombre}
                    {clienteSeleccionado.estado === 'activo' ? 
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACTIVO</span> : 
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">BLOQUEADO</span>
                    }
                  </h2>
                  <p className="text-sm text-zinc-400">{clienteSeleccionado.correo} • {clienteSeleccionado.telefono || 'Sin teléfono'}</p>
                </div>
              </div>
              <button onClick={() => setClienteSeleccionado(null)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              
              {/* Columna Izquierda: Acciones y Resumen */}
              <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-[#1a1a1a] p-5 rounded-xl border border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider">Resumen Financiero</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                      <span className="text-zinc-500 text-sm">Total Gastado</span>
                      <span className="text-emerald-400 font-bold">${clienteSeleccionado.total_gastado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                      <span className="text-zinc-500 text-sm">Deuda Pendiente</span>
                      <span className="text-rose-400 font-bold">${clienteSeleccionado.saldo_pendiente.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-sm">Miembro desde</span>
                      <span className="text-zinc-300 text-sm">{new Date(clienteSeleccionado.fecha_registro).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={() => handleCambiarEstado(clienteSeleccionado.id, clienteSeleccionado.estado)} className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors border ${clienteSeleccionado.estado === 'activo' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}>
                    {clienteSeleccionado.estado === 'activo' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {clienteSeleccionado.estado === 'activo' ? 'Bloquear Cliente' : 'Activar Cliente'}
                  </button>
                  <button onClick={() => handleNotificar(clienteSeleccionado.correo)} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" /> Notificar / Avisar
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Servicios Activos */}
              <div className="w-full md:w-2/3">
                <h3 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-red-500" /> Servicios y Suscripciones
                </h3>
                
                {(!clienteSeleccionado.servicios_activos || clienteSeleccionado.servicios_activos.length === 0) ? (
                  <div className="bg-[#1a1a1a] border border-zinc-800 border-dashed rounded-xl p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">Este cliente no tiene servicios activos actualmente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clienteSeleccionado.servicios_activos.map(srv => (
                      <div key={srv.id} className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="font-bold text-white text-sm">{srv.servicio_nombre}</div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Inicio: {new Date(srv.fecha_activacion).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1 text-rose-400"><Calendar className="w-3.5 h-3.5" /> Vence: {new Date(srv.fecha_vencimiento).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Activo</span>
                          {srv.pago_pendiente && <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">Pago Pendiente</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};