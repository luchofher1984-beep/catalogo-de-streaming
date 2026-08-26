import React, { useState, useEffect, useMemo } from 'react';
import { ServicioStreaming, CategoriaServicio, OrdenCompra, ConfiguracionSistema } from './types';
import { supabaseService, supabase } from './services/supabaseService';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { ServiceCard } from './components/ServiceCard';
import { PurchaseModal } from './components/PurchaseModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import { StockManagerModal } from './components/StockManagerModal';
import AdminDashboard from './components/admin/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { AlertCircle, LayoutDashboard, User, Package, ChevronLeft, Calendar, CreditCard, CheckCircle2, Mail, Film } from 'lucide-react';



export function App() {
  const [vista, setVista] = useState<'admin' | 'tienda'>('tienda');
  const CORREO_ADMIN = 'fherchoapaza@gmail.com'; 
  
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'register'>('login');
  const [accionPendiente, setAccionPendiente] = useState<ServicioStreaming | null>(null);
  const [promptInstalacion, setPromptInstalacion] = useState<any>(null);

  // ✅ NUEVO: Vista del cliente (tienda o mis servicios)
  const [vistaCliente, setVistaCliente] = useState<'tienda' | 'mis-servicios'>('tienda');


  const [servicios, setServicios] = useState<ServicioStreaming[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionSistema | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaServicio>('todas');
  const [soloEnStock, setSoloEnStock] = useState<boolean>(false);
  const [ordenarPor, setOrdenarPor] = useState<'destacados' | 'precio_asc' | 'precio_desc' | 'stock_desc'>('stock_desc');



  const [toastMensaje, setToastMensaje] = useState<{ texto: string; tipo: 'exito' | 'info' | 'error' } | null>(null);



  const [servicioSeleccionadoParaCompra, setServicioSeleccionadoParaCompra] = useState<ServicioStreaming | null>(null);
  const [servicioSeleccionadoDetalles, setServicioSeleccionadoDetalles] = useState<ServicioStreaming | null>(null);
  const [ordenCompletada, setOrdenCompletada] = useState<OrdenCompra | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isStockManagerOpen, setIsStockManagerOpen] = useState<boolean>(false);


  // ✅ ESTADOS PARA GUARDAR DURACIÓN Y PRECIO SELECCIONADO
  const [duracionCompra, setDuracionCompra] = useState<number>(1);
  const [precioFinalCompra, setPrecioFinalCompra] = useState<number>(0);



  const mostrarToast = (texto: string, tipo: 'exito' | 'info' | 'error' = 'exito') => {
    setToastMensaje({ texto, tipo });
    setTimeout(() => setToastMensaje(null), 3500);
  };



  const cargarDatosDesdeSupabase = async () => {
    try {
      try {
        await supabaseService.sincronizarStockDesdeCuentas();
      } catch (errSinc) {
        console.warn('⚠️ No se pudo sincronizar stock:', errSinc);
      }



      const { data: srvs } = await supabaseService.getServicios();
      const { data: ords } = await supabaseService.getOrdenes();
      const respuestaConfig = await supabaseService.getConfiguracion();
      const cfg = respuestaConfig?.data;
      
      setServicios(srvs || []);
      setOrdenes(ords || []);
      setConfiguracion(cfg);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
    } finally {
      setCargando(false);
    }
  };



  const handleGuardarConfiguracion = async (nuevaConfig: Partial<ConfiguracionSistema>, imagenQR?: File): Promise<boolean> => {
    const resultado = await supabaseService.guardarConfiguracion(nuevaConfig, imagenQR);
    if (resultado?.success && resultado?.data) {
      setConfiguracion(resultado.data);
      return true;
    }
    return false;
  };



  useEffect(() => {
    cargarDatosDesdeSupabase();



    const suscripcionServicios = supabase
      .channel('cambios-servicios')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'servicios' },
        () => {
          cargarDatosDesdeSupabase();
        }
      )
      .subscribe();



    const suscripcionCuentas = supabase
      .channel('cambios-cuentas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cuentas_servicio' },
        () => {
          cargarDatosDesdeSupabase();
        }
      )
      .subscribe();



    const intervaloRespaldo = setInterval(() => {
      cargarDatosDesdeSupabase();
    }, 3000);



    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstalacion(e);
    };
    window.addEventListener('beforeinstallprompt', handler);



    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setUsuarioActual(user);
      if (user && user.email === CORREO_ADMIN) {
        setVista('admin');
      }
    });



    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUsuarioActual(user);
      if (user) {
        setVista(user.email === CORREO_ADMIN ? 'admin' : 'tienda');
        setVistaCliente('tienda'); // Resetear vista del cliente al iniciar sesión
      } else {
        setVista('tienda');
        setVistaCliente('tienda');
      }
    });



    return () => {
      supabase.removeChannel(suscripcionServicios);
      supabase.removeChannel(suscripcionCuentas);
      clearInterval(intervaloRespaldo);
      window.removeEventListener('beforeinstallprompt', handler);
      authSub.unsubscribe();
    };
  }, []);



  const handleInstalarApp = async () => {
    if (promptInstalacion) {
      promptInstalacion.prompt();
      const { outcome } = await promptInstalacion.userChoice;
      if (outcome === 'accepted') {
        mostrarToast('¡Aplicación instalada exitosamente!', 'exito');
        setPromptInstalacion(null);
      }
    } else {
      alert('Para instalar en tu celular: presiona el menú de 3 puntos y selecciona "Agregar a la pantalla principal".');
    }
  };



  const handleIntentarCompra = (srv: ServicioStreaming) => {
    if (!usuarioActual) {
      setAccionPendiente(srv);
      setModoAuth('register');
      setMostrarAuth(true);
    } else {
      setServicioSeleccionadoParaCompra(srv);
    }
  };



  const handleAuthSuccess = (user: any) => {
    setMostrarAuth(false);
    setUsuarioActual(user);
    if (user.email === CORREO_ADMIN) {
      mostrarToast('Bienvenido Administrador.', 'exito');
    } else {
      mostrarToast('Sesión iniciada correctamente.', 'exito');
      if (accionPendiente) setServicioSeleccionadoParaCompra(accionPendiente);
    }
    setAccionPendiente(null);
  };



  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    setVistaCliente('tienda'); // Volver a tienda al cerrar sesión
    mostrarToast('Sesión cerrada correctamente', 'info');
  };



  const handleCrearServicio = async (nuevo: any): Promise<boolean> => {
    const { data, error } = await supabaseService.crearServicio(nuevo);
    if (error || !data) return false;
    cargarDatosDesdeSupabase();
    return true;
  };



  const handleEditarServicio = async (id: string, updates: any): Promise<boolean> => {
    const { data, error } = await supabaseService.editarServicio(id, updates);
    if (error || !data) return false;
    setServicios((prev) => prev.map((s) => (s.id === id ? data : s)));
    return true;
  };



  const handleEliminarServicio = async (id: string): Promise<boolean> => {
    const { success } = await supabaseService.eliminarServicio(id);
    if (success) setServicios((prev) => prev.filter((s) => s.id !== id));
    return success;
  };



  const handleActualizarStockRapido = (servicioId: string, nuevoStock: number) => {
    supabaseService.actualizarStock(servicioId, nuevoStock);
    setServicios((prev) => prev.map((s) => (s.id === servicioId ? { ...s, stock: nuevoStock } : s)));
  };



  const handleCompraExitosa = (orden: OrdenCompra) => {
    setOrdenCompletada(orden);
    cargarDatosDesdeSupabase();
  };



  const conteoPorCategoria = useMemo(() => {
    const conteos: Record<CategoriaServicio, number> = {
      todas: servicios.length,
      peliculas_series: 0, musica: 0, anime_gaming: 0,
      deportes: 0, combos: 0, general: 0
    };
    servicios.forEach((s) => {
      const cat = s.categoria as CategoriaServicio;
      if (conteos[cat] !== undefined) conteos[cat] += 1;
    });
    return conteos;
  }, [servicios]);



  const serviciosFiltrados = useMemo(() => {
    let resultado = [...servicios];


    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter((s) => 
        s?.nombre?.toLowerCase().includes(q) || s?.descripcion?.toLowerCase().includes(q)
      );
    }
    if (categoriaActiva !== 'todas') {
      resultado = resultado.filter((s) => s?.categoria === categoriaActiva);
    }
    if (soloEnStock) {
      resultado = resultado.filter((s) => s?.stock > 0);
    }


    resultado.sort((a, b) => {
      const stockA = a?.stock || 0;
      const stockB = b?.stock || 0;
      
      if (stockB !== stockA) {
        return stockB - stockA;
      }
      const nombreA = a?.nombre?.toLowerCase() || '';
      const nombreB = b?.nombre?.toLowerCase() || '';
      return nombreA.localeCompare(nombreB);
    });


    return resultado;
  }, [servicios, busqueda, categoriaActiva, soloEnStock]);


  // ✅ NUEVO: Filtrar compras SOLO del cliente actual
  const ordenesCliente = useMemo(() => {
    if (!ordenes || !usuarioActual?.email) return [];
    return ordenes.filter((o: any) =>
      o.cliente_correo?.trim()?.toLowerCase() === usuarioActual.email.trim().toLowerCase()
    ).sort((a: any, b: any) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [ordenes, usuarioActual?.email]);


  // ✅ NUEVO: Formatear fecha para Bolivia
  const formatearFecha = (fecha: any) => {
    if (!fecha) return '-';
    const f = new Date(new Date(fecha).getTime() - 4 * 60 * 60 * 1000);
    return f.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  };


  // ✅ NUEVO: Calcular fecha de vencimiento
  const calcularVencimiento = (fecha: any, meses: number = 1) => {
    if (!fecha) return '-';
    const f = new Date(fecha);
    f.setMonth(f.getMonth() + Number(meses || 1));
    const fBolivia = new Date(f.getTime() - 4 * 60 * 60 * 1000);
    return fBolivia.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  };


  const serviciosEnStock = servicios.filter((s) => s?.stock > 0).length;
  const serviciosAgotados = servicios.filter((s) => s?.stock === 0).length;
  const servicioDestacado = servicios.length > 0 ? (servicios.find((s) => s?.destacado) || servicios[0]) : undefined;



  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col selection:bg-red-600 selection:text-white font-sans antialiased overflow-x-hidden w-full">
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className="px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-sm font-semibold backdrop-blur-md bg-emerald-950/95 border-emerald-700 text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMensaje.texto}</span>
          </div>
        </div>
      )}



      {vista === 'admin' ? (
        <AdminDashboard
          servicios={servicios}
          ordenes={ordenes}
          onCrearServicio={handleCrearServicio}
          onEditarServicio={handleEditarServicio}
          onEliminarServicio={handleEliminarServicio}
          onActualizarStockRapido={handleActualizarStockRapido}
          onIrATienda={() => setVista('tienda')}
          onVerServicioEnTienda={(srv) => { setVista('tienda'); setServicioSeleccionadoDetalles(srv); }}
        />
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* ✅ BARRA ROJA SUPERIOR — CON BOTÓN "MIS SERVICIOS" DENTRO DEL PANEL DEL CLIENTE */}
          <div className="bg-red-950/80 border-b border-red-800/60 px-4 py-2 text-xs flex items-center justify-between text-red-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span><strong>Tienda Oficial</strong> • Conexión Segura</span>
            </div>
            <div className="flex items-center gap-4">
              {usuarioActual && (
                <div className="flex items-center gap-2 text-white flex-wrap">
                  {/* ✅ NUEVO: BOTÓN "MIS SERVICIOS" DENTRO DEL PANEL DEL CLIENTE */}
                  <button
                    onClick={() => setVistaCliente(vistaCliente === 'mis-servicios' ? 'tienda' : 'mis-servicios')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      vistaCliente === 'mis-servicios'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-800/60 hover:bg-red-700/60 text-white border border-red-700/60'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Mis Servicios
                    {ordenesCliente.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                        {ordenesCliente.length}
                      </span>
                    )}
                  </button>

                  <User className="w-3.5 h-3.5" />
                  <span className="font-semibold">{usuarioActual?.email || 'Usuario'}</span>
                  <button onClick={handleCerrarSesion} className="ml-2 bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded text-white font-bold transition cursor-pointer">Salir</button>
                </div>
              )}
              {usuarioActual?.email === CORREO_ADMIN && (
                <button onClick={() => setVista('admin')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Volver a Panel Admin</span>
                </button>
              )}
            </div>
          </div>


          {/* ============================================ */}
          {/* ✅ VISTA: MIS SERVICIOS COMPRADOS (NUEVA) */}
          {/* ============================================ */}
          {vistaCliente === 'mis-servicios' && usuarioActual ? (
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {/* Encabezado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-3">
                    <Package className="w-8 h-8 text-emerald-500" />
                    Mis Servicios Comprados
                  </h2>
                  <p className="text-zinc-400">
                    Hola <strong className="text-white">{usuarioActual.email}</strong>, aquí están todos tus servicios activos
                  </p>
                </div>
                <button
                  onClick={() => setVistaCliente('tienda')}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition flex items-center gap-2 w-fit"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver a la Tienda
                </button>
              </div>


              {/* Tarjetas resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold uppercase">Servicios Comprados</span>
                  <h3 className="text-2xl font-black text-white mt-1">{ordenesCliente.length}</h3>
                </div>
                <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold uppercase">Total Invertido</span>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">
                    Bs {ordenesCliente.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0).toFixed(2)}
                  </h3>
                </div>
                <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-bold uppercase">Servicios Activos</span>
                  <h3 className="text-2xl font-black text-white mt-1">{ordenesCliente.length}</h3>
                </div>
              </div>


              {/* Lista de compras */}
              {ordenesCliente.length === 0 ? (
                <div className="bg-[#181818] rounded-3xl p-12 text-center border border-zinc-800">
                  <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Aún no tienes servicios comprados</h3>
                  <p className="text-zinc-400 mb-6">Explora la tienda y adquiere tu primer servicio</p>
                  <button
                    onClick={() => setVistaCliente('tienda')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                  >
                    Ir a la Tienda
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordenesCliente.map((orden: any) => (
                    <div
                      key={orden.id}
                      className="bg-[#181818] rounded-2xl border border-zinc-800 overflow-hidden hover:border-emerald-700/50 transition"
                    >
                      {/* Encabezado */}
                      <div className="bg-gradient-to-r from-emerald-900/30 to-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center">
                            <Film className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{orden.servicio_nombre}</h4>
                            <p className="font-mono text-xs text-zinc-400">{orden.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-zinc-400">Monto Pagado</p>
                            <p className="text-xl font-black text-emerald-400">Bs {Number(orden.total || 0).toFixed(2)}</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-900/40 text-emerald-400 rounded-full text-xs font-bold border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" /> Activo
                          </span>
                        </div>
                      </div>


                      {/* Contenido */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Fechas */}
                        <div>
                          <p className="text-xs text-zinc-400 font-bold uppercase mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" /> Fecha de Compra
                          </p>
                          <p className="text-white font-medium">{formatearFecha(orden.fecha)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 font-bold uppercase mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" /> Vence el
                          </p>
                          <p className="text-amber-400 font-bold">
                            {calcularVencimiento(orden.fecha, orden.duracion_meses)}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Plan: {Number(orden.duracion_meses || 1)} mes(es)
                          </p>
                        </div>


                        {/* Credenciales */}
                        <div className="lg:col-span-2">
                          <p className="text-xs text-zinc-400 font-bold uppercase mb-2">🔑 Tus Credenciales</p>
                          <div className="bg-[#121212] rounded-xl p-4 space-y-2 text-sm border border-zinc-800">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Mail className="w-4 h-4 text-zinc-500" />
                              <span className="text-zinc-400 w-24">Correo:</span>
                              <span className="text-white font-mono">{orden.correo || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-zinc-500 w-4">🔑</span>
                              <span className="text-zinc-400 w-24">Contraseña:</span>
                              <span className="text-white font-mono">{orden.contrasena || '-'}</span>
                            </div>
                            {orden.perfil && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <User className="w-4 h-4 text-zinc-500" />
                                <span className="text-zinc-400 w-24">Perfil:</span>
                                <span className="text-white font-mono">{orden.perfil}</span>
                              </div>
                            )}
                            {orden.pin && orden.pin !== 'No especificado' && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-zinc-500 w-4">#️⃣</span>
                                <span className="text-zinc-400 w-24">PIN:</span>
                                <span className="text-white font-mono">{orden.pin}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          ) : (
            /* ============================================ */
            /* ✅ VISTA: TIENDA NORMAL (SE MANTIENE IGUAL) */
            /* ============================================ */
            <>
              <Navbar
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                totalServicios={servicios.length}
                serviciosEnStock={serviciosEnStock}
                serviciosAgotados={serviciosAgotados}
                onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                isLoggedIn={!!usuarioActual}
                onOpenLogin={() => { setModoAuth('login'); setMostrarAuth(true); }}
                onOpenRegister={() => { setModoAuth('register'); setMostrarAuth(true); }}
                onInstalarApp={handleInstalarApp}
              />



              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {!busqueda && categoriaActiva === 'todas' && servicioDestacado && (
                  <HeroBanner 
                    servicioDestacado={servicioDestacado} 
                    onComprar={handleIntentarCompra} 
                    onVerDetalles={(srv) => setServicioSeleccionadoDetalles(srv)} 
                  />
                )}
                <FilterBar 
                  categoriaActiva={categoriaActiva} 
                  onSelectCategoria={setCategoriaActiva} 
                  soloEnStock={soloEnStock} 
                  onToggleSoloEnStock={setSoloEnStock} 
                  ordenarPor={ordenarPor} 
                  onOrdenarPorChange={setOrdenarPor} 
                  conteoPorCategoria={conteoPorCategoria} 
                />
                
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>Catálogo de Suscripciones</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">{serviciosFiltrados.length} disponibles</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Cuentas oficiales con activación inmediata y garantía directa</p>
                  </div>
                </div>



                {cargando ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => <div key={n} className="h-80 bg-zinc-900/60 rounded-xl animate-pulse border border-zinc-800" />)}
                  </div>
                ) : serviciosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {serviciosFiltrados.map((servicio) => (
                      <ServiceCard 
                        key={servicio?.id || Math.random()} 
                        servicio={servicio} 
                        onComprar={handleIntentarCompra} 
                        onVerDetalles={(srv) => setServicioSeleccionadoDetalles(srv)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 bg-[#181818] rounded-2xl border border-zinc-800">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4 text-zinc-500" />
                    <h3 className="text-lg font-bold text-white mb-1">No se encontraron servicios</h3>
                    <button onClick={() => { setBusqueda(''); setCategoriaActiva('todas'); setSoloEnStock(false); }} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">
                      Restablecer Filtros
                    </button>
                  </div>
                )}
              </main>
            </>
          )}
        </div>
      )}



      {mostrarAuth && (
        <AuthModal 
          initialView={modoAuth} 
          onClose={() => { setMostrarAuth(false); setAccionPendiente(null); }} 
          onSuccess={handleAuthSuccess} 
        />
      )}



      {/* ✅ PurchaseModal: RECIBE DURACIÓN Y PRECIO CALCULADO */}
      <PurchaseModal 
        servicio={servicioSeleccionadoParaCompra}
        user={usuarioActual} 
        isOpen={!!servicioSeleccionadoParaCompra} 
        onClose={() => setServicioSeleccionadoParaCompra(null)} 
        onCompraExitosa={handleCompraExitosa} 
        duracionSeleccionada={duracionCompra}
        precioFinalCalculado={precioFinalCompra}
      />


      {/* ✅ ServiceDetailModal: GUARDA DURACIÓN Y PRECIO AL HACER CLIC */}
      <ServiceDetailModal 
        servicio={servicioSeleccionadoDetalles} 
        isOpen={!!servicioSeleccionadoDetalles} 
        onClose={() => setServicioSeleccionadoDetalles(null)} 
        onComprar={(srv, duracion, precioFinal) => { 
          setServicioSeleccionadoDetalles(null); 
          setDuracionCompra(duracion); 
          setPrecioFinalCompra(precioFinal); 
          setServicioSeleccionadoParaCompra(srv); 
        }} 
      />


      <OrderSuccessModal 
        orden={ordenCompletada}
        configuracion={configuracion}
        isOpen={!!ordenCompletada} 
        onClose={() => setOrdenCompletada(null)} 
      />
      <SupabaseModal 
        isOpen={isSupabaseModalOpen} 
        onClose={() => setIsSupabaseModalOpen(false)} 
        servicios={servicios} 
      />
      <StockManagerModal 
        isOpen={isStockManagerOpen} 
        onClose={() => setIsStockManagerOpen(false)} 
        servicios={servicios} 
        onActualizarStock={handleActualizarStockRapido} 
        onResetearCatalogo={() => {}}
      />
    </div>
  );
}



export default App;