import React, { useState, useMemo, useCallback } from 'react';
import { ServicioStreaming } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import {
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  Plus,
  Sparkles,
  Key,
  X,
  User,
  Lock,
  Hash,
} from 'lucide-react';

// 📋 Tipo para las cuentas
interface CuentaServicio {
  id: string;
  servicio_id: string;
  usuario_correo: string;
  contrasena: string;
  perfil?: string;
  pin?: string;
  estado: 'disponible' | 'entregada';
  orden_id?: string;
  entregada_en?: string;
}

interface AdminServicesTableProps {
  servicios: ServicioStreaming[];
  todasLasCuentas: CuentaServicio[];
  onEditarServicio: (servicio: ServicioStreaming) => void;
  onEliminarServicio: (servicio: ServicioStreaming) => void;
  onVerServicioEnTienda: (servicio: ServicioStreaming) => void;
  onActualizarStockRapido: (servicioId: string, nuevoStock: number) => void;
  onAbrirModalNuevoServicio: () => void;
  onRecargarTodasCuentas: () => Promise<void>;
}

export const AdminServicesTable: React.FC<AdminServicesTableProps> = ({
  servicios,
  todasLasCuentas,
  onEditarServicio,
  onEliminarServicio,
  onVerServicioEnTienda,
  onAbrirModalNuevoServicio,
  onRecargarTodasCuentas,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'agotados'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'precio_asc' | 'precio_desc' | 'stock_asc' | 'stock_desc'>('stock_desc');

  // 🔑 ESTADOS PARA EL MODAL DE CUENTAS
  const [modalCuentasAbierto, setModalCuentasAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioStreaming | null>(null);
  const [cuentas, setCuentas] = useState<CuentaServicio[]>([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [formAgregarAbierto, setFormAgregarAbierto] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({
    usuario_correo: '',
    contrasena: '',
    perfil: '',
    pin: '',
    cantidad_perfiles: 1,
    nombres_perfiles: ''
  });

  // ==========================================
  // ✅ STOCK AUTOMÁTICO = CUENTAS DISPONIBLES
  // ==========================================
  const getStockDisponible = useCallback((servicioId: string) => {
    return todasLasCuentas.filter(
      cuenta => cuenta.servicio_id === servicioId && cuenta.estado === 'disponible'
    ).length;
  }, [todasLasCuentas]);

  // 📋 Cargar cuentas del servicio seleccionado
  const cargarCuentas = async (servicioId: string) => {
    setCargandoCuentas(true);
    const { data, error } = await supabaseService.getCuentasPorServicio(servicioId);
    if (!error) setCuentas((data as CuentaServicio[]) || []);
    setCargandoCuentas(false);
  };

  // 📂 Abrir modal de cuentas
  const abrirModalCuentas = async (servicio: ServicioStreaming) => {
    setServicioSeleccionado(servicio);
    setModalCuentasAbierto(true);
    setFormAgregarAbierto(false);
    await cargarCuentas(servicio.id);
  };

  // ═══════════════════════════════════════════
  // ✅ AGREGAR CUENTA — SOPORTA MÚLTIPLES PERFILES
  // ═══════════════════════════════════════════
  const handleAgregarCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado) return;
    const cantidad = Math.max(1, Number(nuevaCuenta.cantidad_perfiles) || 1);
    const nombresLista = nuevaCuenta.nombres_perfiles
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    let todoBien = true;
    // ✅ Crea 1 o VARIAS cuentas automáticamente (mismo correo, distinto perfil)
    for (let i = 0; i < cantidad; i++) {
      const perfilAsignado = nombresLista[i] || nuevaCuenta.perfil || `Perfil ${i + 1}`;
      const { error } = await supabaseService.agregarCuenta({
        servicio_id: servicioSeleccionado.id,
        usuario_correo: nuevaCuenta.usuario_correo,
        contrasena: nuevaCuenta.contrasena,
        perfil: perfilAsignado,
        pin: nuevaCuenta.pin || undefined
      });
      if (error) {
        console.error(`❌ Error al agregar cuenta ${i + 1}:`, error);
        todoBien = false;
        break;
      }
    }

    if (todoBien) {
      console.log(`✅ ${cantidad} cuenta(s) agregada(s) — Stock actualizado automáticamente`);
      
      setNuevaCuenta({ 
        usuario_correo: '', 
        contrasena: '', 
        perfil: '', 
        pin: '', 
        cantidad_perfiles: 1, 
        nombres_perfiles: '' 
      });
      setFormAgregarAbierto(false);
      
      await cargarCuentas(servicioSeleccionado.id);
      await onRecargarTodasCuentas();
      
      setModalCuentasAbierto(false);
    }
  };

  // 🗑️ Eliminar cuenta → ACTUALIZA TODO AUTOMÁTICAMENTE ✅
  const handleEliminarCuenta = async (cuentaId: string) => {
    const { success, error } = await supabaseService.eliminarCuenta(cuentaId);
    if (success) {
      console.log('✅ Cuenta eliminada — Stock actualizado automáticamente');
      if (servicioSeleccionado) {
        await cargarCuentas(servicioSeleccionado.id);
        await onRecargarTodasCuentas();
      }
    } else {
      console.error('❌ Error al eliminar:', error);
    }
  };

  // Filtrado y ordenamiento con STOCK REAL
  const serviciosFiltrados = useMemo(() => {
    let list = [...servicios];
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          (s.categoria_label && s.categoria_label.toLowerCase().includes(q)) ||
          (s.tipo_cuenta && s.tipo_cuenta.toLowerCase().includes(q))
      );
    }
    if (filtroEstado === 'activos') {
      list = list.filter((s) => getStockDisponible(s.id) > 0);
    } else if (filtroEstado === 'agotados') {
      list = list.filter((s) => getStockDisponible(s.id) === 0);
    }
    if (filtroCategoria !== 'todas') {
      list = list.filter((s) => s.categoria === filtroCategoria);
    }
    list.sort((a, b) => {
      const stockA = getStockDisponible(a.id);
      const stockB = getStockDisponible(b.id);
      if (ordenarPor === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (ordenarPor === 'precio_asc') return a.precio - b.precio;
      if (ordenarPor === 'precio_desc') return b.precio - a.precio;
      if (ordenarPor === 'stock_asc') return stockA - stockB;
      if (ordenarPor === 'stock_desc') return stockB - stockA;
      return 0;
    });
    return list;
  }, [servicios, busqueda, filtroEstado, filtroCategoria, ordenarPor, getStockDisponible]);

  const totalActivos = servicios.filter((s) => getStockDisponible(s.id) > 0).length;
  const totalAgotados = servicios.filter((s) => getStockDisponible(s.id) === 0).length;
  const disponibles = cuentas.filter(c => c.estado === 'disponible').length;
  const entregadas = cuentas.filter(c => c.estado === 'entregada').length;

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════════
          ✅ BARRA SUPERIOR — BOTÓN AGREGAR SIEMPRE VISIBLE
          ═══════════════════════════════════════════ */}
      <div className="bg-[#181818] p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="admin-buscar-tabla"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, tipo o categoría..."
            className="w-full bg-[#121212] text-white text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-zinc-700/80 focus:border-red-500 focus:outline-none placeholder:text-zinc-500"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        {/* ✅ BOTÓN AGREGAR NUEVO SERVICIO — SIEMPRE VISIBLE */}
        <button
          onClick={onAbrirModalNuevoServicio}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Agregar Nuevo Servicio
        </button>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-[#121212] p-1 border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroEstado === 'todos' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({servicios.length})
            </button>
            <button
              onClick={() => setFiltroEstado('activos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                filtroEstado === 'activos' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Activos ({totalActivos})
            </button>
            <button
              onClick={() => setFiltroEstado('agotados')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                filtroEstado === 'agotados' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Agotados ({totalAgotados})
            </button>
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="bg-[#121212] text-zinc-300 text-xs px-3 py-2.5 rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
          >
            <option value="todas">Todas las categorías</option>
            <option value="peliculas_series">Películas & Series</option>
            <option value="musica">Música & Audio</option>
            <option value="anime_gaming">Anime & Gaming</option>
            <option value="deportes">Deportes en Vivo</option>
            <option value="combos">Combos Especiales</option>
          </select>
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value as any)}
            className="bg-[#121212] text-zinc-300 text-xs px-3 py-2.5 rounded-xl border border-zinc-800 focus:border-red-500 focus:outline-none"
          >
            <option value="stock_desc">Mayor Stock Primero</option>
            <option value="stock_asc">Menor Stock Primero</option>
            <option value="precio_desc">Mayor Precio</option>
            <option value="precio_asc">Menor Precio</option>
            <option value="nombre">Nombre (A - Z)</option>
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TABLA DE SERVICIOS
          ═══════════════════════════════════════════ */}
      <div className="bg-[#181818] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table id="tabla-servicios-admin" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#141414] text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                <th className="py-4 px-4 sm:px-6 w-20 text-center">Logo</th>
                <th className="py-4 px-4 sm:px-6">Nombre del Servicio</th>
                {/* ✅ CAMBIADO: (USD) → (Bs) */}
                <th className="py-4 px-4 sm:px-6">Precio (Bs)</th>
                <th className="py-4 px-4 sm:px-6 text-center">Stock Disponible</th>
                <th className="py-4 px-4 sm:px-6 text-center">Estado</th>
                <th className="py-4 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-xs sm:text-sm">
              {serviciosFiltrados.length > 0 ? (
                serviciosFiltrados.map((servicio) => {
                  const stockReal = getStockDisponible(servicio.id);
                  const estaAgotado = stockReal === 0;
                  return (
                    <tr
                      key={servicio.id}
                      id={`fila-servicio-${servicio.id}`}
                      className="hover:bg-zinc-900/70 transition-colors group"
                    >
                      {/* Logo */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="w-11 h-11 mx-auto rounded-xl bg-black/60 border border-zinc-700/80 p-1.5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                          <img
                            src={servicio.logo_url || ''}
                            alt={servicio.nombre}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3163/3163508.png';
                            }}
                          />
                        </div>
                      </td>
                      {/* Nombre */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                              {servicio.nombre}
                            </span>
                            {servicio.destacado && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                                <Sparkles className="w-2.5 h-2.5" />
                                Top
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-medium border border-zinc-700/50">
                              {servicio.categoria_label || 'Sin categoría'}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-400">{servicio.tipo_cuenta || 'No especificado'}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{servicio.duracion || '30 Días'}</span>
                          </div>
                        </div>
                      </td>
                      {/* Precio — ✅ CAMBIADO: $ → Bs */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold">
                        <div className="flex flex-col">
                          <span className="text-base text-white font-black">
                            Bs {servicio.precio.toFixed(2)}
                            <span className="text-xs text-zinc-500 font-normal ml-0.5">/mes</span>
                          </span>
                          {servicio.precio_original && (
                            <span className="text-[11px] text-zinc-500 line-through">
                              Bs {servicio.precio_original.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* ✅ STOCK QUE SE ACTUALIZA SOLO */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <div className="bg-[#121212] px-4 py-2 rounded-xl border border-zinc-800 shadow-sm">
                            <span className={`text-lg font-black ${
                              estaAgotado ? 'text-rose-400' : stockReal <= 4 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {stockReal}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {stockReal === 1 ? 'Cuenta disponible' : 'Cuentas disponibles'}
                          </span>
                        </div>
                      </td>
                      {/* Estado */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        {estaAgotado ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-950/80 text-rose-400 border border-rose-800/80 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Agotado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Activo
                          </span>
                        )}
                      </td>
                      {/* Acciones */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => abrirModalCuentas(servicio)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-600 text-amber-400 hover:text-white text-xs font-bold transition-all border border-amber-800/60 hover:border-amber-500 shadow-sm cursor-pointer"
                            title="Gestionar cuentas de acceso"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cuentas</span>
                          </button>
                          <button
                            onClick={() => onEditarServicio(servicio)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white text-xs font-bold transition-all border border-zinc-700 hover:border-blue-500 shadow-sm cursor-pointer"
                            title="Editar servicio"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => onEliminarServicio(servicio)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white text-xs font-bold transition-all border border-zinc-700 hover:border-rose-500 shadow-sm cursor-pointer"
                            title="Eliminar servicio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                          <button
                            onClick={() => onVerServicioEnTienda(servicio)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700"
                            title="Vista previa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">No se encontraron servicios</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {busqueda ? 'No hay resultados que coincidan.' : 'No hay servicios registrados.'}
                    </p>
                    <button
                      onClick={onAbrirModalNuevoServicio}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir Primer Servicio
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3.5 bg-[#141414] border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
          <div>Mostrando <strong className="text-white">{serviciosFiltrados.length}</strong> de <strong className="text-white">{servicios.length}</strong> servicios</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {totalActivos} Activos</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> {totalAgotados} Agotados</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          🪟 MODAL: GESTIONAR CUENTAS (CON PERFILES MÚLTIPLES)
          ═══════════════════════════════════════════ */}
      {modalCuentasAbierto && servicioSeleccionado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  Cuentas: {servicioSeleccionado.nombre}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Disponibles: <span className="text-emerald-400 font-bold">{disponibles}</span>
                  {' • '}Entregadas: <span className="text-rose-400 font-bold">{entregadas}</span>
                </p>
              </div>
              <button
                onClick={() => setModalCuentasAbierto(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {!formAgregarAbierto ? (
                <button
                  onClick={() => setFormAgregarAbierto(true)}
                  className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 hover:text-amber-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-amber-600/40"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Nueva Cuenta
                </button>
              ) : (
                /* ═══════════════════════════════════════════
                   ✅ FORMULARIO NUEVO — CON PERFILES MÚLTIPLES
                   ═══════════════════════════════════════════ */
                <form onSubmit={handleAgregarCuenta} className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Nueva Cuenta de Acceso</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> Correo / Usuario *
                      </label>
                      <input
                        type="text"
                        required
                        value={nuevaCuenta.usuario_correo}
                        onChange={(e) => setNuevaCuenta({...nuevaCuenta, usuario_correo: e.target.value})}
                        placeholder="correo@ejemplo.com"
                        className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Contraseña *
                      </label>
                      <input
                        type="text"
                        required
                        value={nuevaCuenta.contrasena}
                        onChange={(e) => setNuevaCuenta({...nuevaCuenta, contrasena: e.target.value})}
                        placeholder="Contraseña"
                        className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    {/* ✅ NUEVO: Cantidad de perfiles */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                        👥 Cantidad de perfiles *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={nuevaCuenta.cantidad_perfiles}
                        onChange={(e) => setNuevaCuenta({...nuevaCuenta, cantidad_perfiles: Number(e.target.value)})}
                        placeholder="Ej: 5"
                        className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Netflix = 5, Disney+ = 7, etc.</p>
                    </div>
                    {/* ✅ NUEVO: Nombres de perfiles */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                        📝 Nombres (separados por coma)
                      </label>
                      <input
                        type="text"
                        value={nuevaCuenta.nombres_perfiles}
                        onChange={(e) => setNuevaCuenta({...nuevaCuenta, nombres_perfiles: e.target.value})}
                        placeholder="Mama, Papa, Niños, Invitado"
                        className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Opcional. Si lo dejas vacío: Perfil 1, Perfil 2...</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> PIN (si aplica)
                      </label>
                      <input
                        type="text"
                        value={nuevaCuenta.pin}
                        onChange={(e) => setNuevaCuenta({...nuevaCuenta, pin: e.target.value})}
                        placeholder="1234"
                        className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* ✅ AVISO: cuántas cuentas se crearán */}
                  <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-300">
                    ⚡ Se crearán automáticamente <strong>{Math.max(1, Number(nuevaCuenta.cantidad_perfiles) || 1)}</strong> cuenta(s) con el mismo correo y contraseña.
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormAgregarAbierto(false);
                        setNuevaCuenta({ 
                          usuario_correo: '', 
                          contrasena: '', 
                          perfil: '', 
                          pin: '', 
                          cantidad_perfiles: 1, 
                          nombres_perfiles: '' 
                        });
                      }}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      ✅ Guardar Cuenta(s)
                    </button>
                  </div>
                </form>
              )}
              {/* Lista de cuentas */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-300">Lista de Cuentas</h3>
                {cargandoCuentas ? (
                  <p className="text-sm text-zinc-500 text-center py-4">Cargando cuentas...</p>
                ) : cuentas.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No hay cuentas registradas. Agrega la primera.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {cuentas.map((cuenta) => (
                      <div
                        key={cuenta.id}
                        className={`p-3 rounded-xl border text-sm ${
                          cuenta.estado === 'disponible'
                            ? 'bg-emerald-950/30 border-emerald-800/50'
                            : 'bg-rose-950/30 border-rose-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{cuenta.usuario_correo}</span>
                              {cuenta.perfil && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300">
                                  👤 {cuenta.perfil}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cuenta.estado === 'disponible'
                                  ? 'bg-emerald-600/30 text-emerald-300'
                                  : 'bg-rose-600/30 text-rose-300'
                              }`}>
                                {cuenta.estado === 'disponible' ? '✅ Disponible' : '❌ Entregada'}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 space-x-3">
                              <span>🔑 {cuenta.contrasena}</span>
                              {cuenta.pin && <span>📌 PIN: {cuenta.pin}</span>}
                            </div>
                            {cuenta.estado === 'entregada' && cuenta.entregada_en && (
                              <div className="text-[10px] text-zinc-500 mt-1">
                                📅 Entregada: {new Date(cuenta.entregada_en).toLocaleString('es-BO')}
                              </div>
                            )}
                          </div>
                          {cuenta.estado === 'disponible' && (
                            <button
                              onClick={() => handleEliminarCuenta(cuenta.id)}
                              className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                              title="Eliminar cuenta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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