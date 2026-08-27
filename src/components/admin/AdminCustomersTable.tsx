import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, ShieldCheck, Eye, Calendar, Trash2 } from 'lucide-react';



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



interface AdminCustomersTableProps {
  onEliminarCliente?: (id: string) => Promise<boolean>;
}



export const AdminCustomersTable: React.FC<AdminCustomersTableProps> = ({ onEliminarCliente }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'bloqueado'>('todos');
  const [confirmacion, setConfirmacion] = useState<{mostrar: boolean; cliente: Cliente | null}>({mostrar: false, cliente: null});



  // ✅ CARGAR CLIENTES — AHORA TRAE LA CONTRASEÑA
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



  // ✅ FILTRAR CLIENTES
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



  // ✅ MOSTRAR VENTANA DE CONFIRMACIÓN
  const mostrarConfirmarEliminar = (cliente: Cliente) => {
    setConfirmacion({ mostrar: true, cliente });
  };



  // ✅ CONFIRMAR Y ELIMINAR — ✅ ARREGLADO ✅
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
        
        // ✅ MUESTRA EL ERROR REAL EN CONSOLA
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



  // ✅ CANCELAR
  const cancelarEliminar = () => {
    setConfirmacion({ mostrar: false, cliente: null });
  };



  // ✅ FORMATEAR FECHA
  const formatearFecha = (fecha: any) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-BO');
  };



  if (cargando) {
    return <div className="p-8 text-center text-zinc-400">🔄 Cargando clientes...</div>;
  }



  return (
    <div className="space-y-4">
      {/* ✅ VENTANA DE CONFIRMACIÓN EN EL CENTRO */}
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



      {/* ✅ BUSCADOR Y FILTROS */}
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



      {/* ✅ TABLA DE CLIENTES — AHORA MUESTRA LA CONTRASEÑA */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-left text-zinc-300">
            <tr>
              <th className="py-3 px-4">CLIENTE</th>
              <th className="py-3 px-4">FECHA REGISTRO</th>
              <th className="py-3 px-4">ESTADO</th>
              <th className="py-3 px-4">TOTAL GASTADO</th>
              <th className="py-3 px-4">CONTRASEÑA</th>
              <th className="py-3 px-4 text-center">ACCIÓN</th>
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
                  {/* ✅ AQUÍ MUESTRA LA CONTRASEÑA REAL */}
                  <td className="py-3 px-4 font-mono text-xs text-amber-400 font-bold">
                    {cli.contrasena || 'Sin contraseña'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => mostrarConfirmarEliminar(cli)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
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