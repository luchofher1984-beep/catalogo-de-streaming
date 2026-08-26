import React, { useState, useMemo, useEffect } from 'react';
import { supabaseService } from '../../services/supabaseService';
import { Search, CheckCircle2, XCircle, RefreshCw, Key } from 'lucide-react';

interface CuentaCompleta {
  id: string;
  servicio_id: string;
  servicio_nombre: string;
  servicio_categoria: string;
  usuario_correo: string;
  contrasena: string;
  perfil?: string;
  pin?: string;
  estado: 'disponible' | 'entregada';
  entregada_en?: string;
  servicio_logo?: string;
}

interface ServicioOpcion {
  id: string;
  nombre: string;
}

export const AdminAllAccounts = () => {
  const [cuentas, setCuentas] = useState<CuentaCompleta[]>([]);
  const [serviciosLista, setServiciosLista] = useState<ServicioOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroServicio, setFiltroServicio] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const cargarTodasCuentas = async () => {
    setCargando(true);
    try {
      const { data: cuentasData, error: errorCuentas } = await supabaseService.getTodasLasCuentas();
      if (errorCuentas) throw errorCuentas;

      const { data: serviciosData, error: errorServicios } = await supabaseService.getServicios();
      if (errorServicios) throw errorServicios;

      const listaServicios = (serviciosData || []).map((s: any) => ({
        id: s.id,
        nombre: s.nombre,
      }));
      setServiciosLista(listaServicios);

      const cuentasCompletas: CuentaCompleta[] = (cuentasData || []).map((cuenta: any) => {
        const servicio = serviciosData?.find((s: any) => s.id === cuenta.servicio_id);
        return {
          id: cuenta.id,
          servicio_id: cuenta.servicio_id,
          servicio_nombre: servicio?.nombre || 'Servicio desconocido',
          servicio_categoria: servicio?.categoria || 'sin_categoria',
          usuario_correo: cuenta.usuario_correo,
          contrasena: cuenta.contrasena,
          perfil: cuenta.perfil,
          pin: cuenta.pin,
          estado: cuenta.estado || 'disponible',
          entregada_en: cuenta.entregada_en,
          servicio_logo: servicio?.logo_url,
        };
      });
      setCuentas(cuentasCompletas);

      // ✅ SINCRONIZAR STOCK AL CARGAR
      await supabaseService.sincronizarStockDesdeCuentas();
      console.log('✅ Stock sincronizado al cargar cuentas');

    } catch (err) {
      console.error('❌ Error cargando cuentas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodasCuentas();
  }, []);

  const cuentasFiltradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      const termino = busqueda.toLowerCase().trim();
      const pasaBusqueda = !termino ||
        cuenta.usuario_correo.toLowerCase().includes(termino) ||
        cuenta.servicio_nombre.toLowerCase().includes(termino) ||
        (cuenta.perfil && cuenta.perfil.toLowerCase().includes(termino));

      const pasaServicio = filtroServicio === 'todos' || cuenta.servicio_id === filtroServicio;

      const pasaEstado = filtroEstado === 'todas' ||
        (filtroEstado === 'libres' && cuenta.estado === 'disponible') ||
        (filtroEstado === 'ocupadas' && cuenta.estado === 'entregada');

      return pasaBusqueda && pasaServicio && pasaEstado;
    });
  }, [cuentas, busqueda, filtroServicio, filtroEstado]);

  const totalLibres = cuentasFiltradas.filter(c => c.estado === 'disponible').length;
  const totalOcupadas = cuentasFiltradas.filter(c => c.estado === 'entregada').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
          <span className="text-xs text-zinc-400 font-bold uppercase">Total Cuentas</span>
          <h3 className="text-2xl font-black text-white mt-1">{cuentasFiltradas.length}</h3>
        </div>
        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
          <span className="text-xs text-zinc-400 font-bold uppercase">✅ Libres</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalLibres}</h3>
        </div>
        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
          <span className="text-xs text-zinc-400 font-bold uppercase">❌ Ocupadas</span>
          <h3 className="text-2xl font-black text-rose-400 mt-1">{totalOcupadas}</h3>
        </div>
      </div>

      <div className="bg-[#181818] p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por correo, servicio o perfil..."
            className="w-full bg-[#121212] text-white text-sm pl-10 pr-10 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs">✕</button>
          )}
        </div>

        <select
          value={filtroServicio}
          onChange={(e) => setFiltroServicio(e.target.value)}
          className="bg-[#121212] text-zinc-300 text-sm px-3 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none min-w-[200px]"
        >
          <option value="todos">Todos los Servicios</option>
          {serviciosLista.map((serv) => (
            <option key={serv.id} value={serv.id}>{serv.nombre}</option>
          ))}
        </select>

        <div className="flex rounded-xl bg-[#121212] p-1 border border-zinc-800 text-sm font-semibold">
          <button onClick={() => setFiltroEstado('todas')} className={`px-3 py-1.5 rounded-lg transition-colors ${filtroEstado === 'todas' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}>Todas</button>
          <button onClick={() => setFiltroEstado('libres')} className={`px-3 py-1.5 rounded-lg transition-colors ${filtroEstado === 'libres' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-zinc-400 hover:text-emerald-400'}`}>✅ Libres</button>
          <button onClick={() => setFiltroEstado('ocupadas')} className={`px-3 py-1.5 rounded-lg transition-colors ${filtroEstado === 'ocupadas' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-zinc-400 hover:text-rose-400'}`}>❌ Ocupadas</button>
        </div>

        <button onClick={cargarTodasCuentas} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      <div className="bg-[#181818] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#141414] text-xs uppercase tracking-wider text-zinc-400 font-bold">
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Correo / Usuario</th>
                <th className="py-3 px-4">Contraseña</th>
                <th className="py-3 px-4">Perfil / PIN</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Entregada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-sm">
              {cargando ? (
                <tr><td colSpan={6} className="py-12 text-center text-zinc-400">🔄 Cargando cuentas...</td></tr>
              ) : cuentasFiltradas.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-zinc-400">❌ No se encontraron cuentas</td></tr>
              ) : (
                cuentasFiltradas.map((cuenta) => (
                  <tr key={cuenta.id} className="hover:bg-zinc-900/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-black/60 border border-zinc-700 flex items-center justify-center overflow-hidden">
                          {cuenta.servicio_logo ? (
                            <img src={cuenta.servicio_logo} alt={cuenta.servicio_nombre} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-400">{cuenta.servicio_nombre.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{cuenta.servicio_nombre}</div>
                          <div className="text-[10px] text-zinc-500">{cuenta.servicio_categoria}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-300">{cuenta.usuario_correo}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{cuenta.contrasena}</td>
                    <td className="py-3 px-4 text-xs text-zinc-400">
                      {cuenta.perfil && <span>👤 {cuenta.perfil}</span>}
                      {cuenta.perfil && cuenta.pin && <span className="mx-1">•</span>}
                      {cuenta.pin && <span>📌 {cuenta.pin}</span>}
                      {!cuenta.perfil && !cuenta.pin && <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {cuenta.estado === 'disponible' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5" /> LIBRE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-950/80 text-rose-400 border border-rose-800/80">
                          <XCircle className="w-3.5 h-3.5" /> OCUPADA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-500">
                      {cuenta.entregada_en ? new Date(cuenta.entregada_en).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-zinc-800 text-xs text-zinc-400">
          Mostrando <strong className="text-white">{cuentasFiltradas.length}</strong> de <strong className="text-white">{cuentas.length}</strong> cuentas
        </div>
      </div>
    </div>
  );
};