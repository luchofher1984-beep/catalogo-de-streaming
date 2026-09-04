import React, { useState, useMemo, useEffect } from 'react';
import { ServicioStreaming, OrdenCompra, ConfiguracionSistema } from '../../types';
import { AdminSidebar } from './AdminSidebar';
import { AdminServicesTable } from './AdminServicesTable';
import { AdminOrdersTable } from './AdminOrdersTable';
import { AdminCustomersTable } from './AdminCustomersTable';
import { AdminMetricsView } from './AdminMetricsView';
import { AdminSettingsView } from './AdminSettingsView';
import { AddServiceModal } from './AddServiceModal';
import { EditServiceModal } from './EditServiceModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { LogoutModal } from './LogoutModal';
import { AdminAllAccounts } from './AdminAllAccounts';

// ✅ Importamos el servicio Y el cliente supabase directamente
import { supabaseService, supabase } from '../../services/supabaseService';
import {
  Plus,
  Menu,
  Store,
  RefreshCw,
} from 'lucide-react';

// ✅ Tipo AdminTab que coincide con tus nombres
type AdminTabLocal = 
  | 'catalogo'
  | 'cuentas'
  | 'pedidos'
  | 'clientes'
  | 'metricas'
  | 'configuraciones';

interface AdminDashboardProps {
  servicios: ServicioStreaming[];
  ordenes: OrdenCompra[];
  onCrearServicio: (servicio: Omit<ServicioStreaming, 'id' | 'created_at' | 'ventas_count' | 'calificacion'>) => Promise<boolean>;
  onEditarServicio: (id: string, updates: Partial<ServicioStreaming>) => Promise<boolean>;
  onEliminarServicio: (id: string) => Promise<boolean>;
  onActualizarStockRapido: (servicioId: string, nuevoStock: number) => void;
  onIrATienda: () => void;
  onVerServicioEnTienda: (servicio: ServicioStreaming) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  servicios,
  ordenes,
  onCrearServicio,
  onEditarServicio,
  onEliminarServicio,
  onActualizarStockRapido,
  onIrATienda,
  onVerServicioEnTienda,
}) => {
  const [tabActiva, setTabActiva] = useState<AdminTabLocal>('catalogo');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [configuracion, setConfiguracion] = useState<ConfiguracionSistema | null>(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [todasLasCuentas, setTodasLasCuentas] = useState<any[]>([]);

  const cargarTodasLasCuentas = async () => {
    console.log('🔄 Recargando lista completa de cuentas...');
    const { data, error } = await supabaseService.getTodasLasCuentas();
    if (error) {
      console.error('❌ Error cargando cuentas:', error);
    } else {
      console.log('✅ Cuentas actualizadas:', data?.length || 0);
      setTodasLasCuentas(data || []);
    }
  };

  const cargarPerfiles = async () => {
    console.log('🔄 Cargando perfiles de clientes...');
    const { data, error } = await supabaseService.getClientes();
    if (error) {
      console.error('❌ Error cargando perfiles:', error);
    } else {
      console.log('✅ Perfiles cargados:', data?.length || 0);
      setPerfiles(data || []);
    }
  };

  useEffect(() => {
    const cargarConfig = async () => {
      console.log('🔄 Cargando configuración...');
      const { data, error } = await supabaseService.getConfiguracion();
      if (error) {
        console.error('❌ Error cargando configuración:', error);
      } else {
        console.log('✅ Configuración cargada:', data);
        setConfiguracion(data);
      }
      setCargandoConfig(false);
    };
    cargarConfig();
  }, []);

  useEffect(() => {
    cargarTodasLasCuentas();
    cargarPerfiles();
  }, []);

  const handleGuardarConfiguracion = async (config: Partial<ConfiguracionSistema>, imagenQR?: File): Promise<boolean> => {
    const { success, data } = await supabaseService.guardarConfiguracion(config, imagenQR);
    if (success && data) setConfiguracion(data);
    return success;
  };

  // ═══════════════════════════════════════════════════════════
  // ✅ FUNCIÓN REFORZADA: ASEGURA QUE LOS MESES SE USEN BIEN
  // ═══════════════════════════════════════════════════════════
  const asignarCuentaManualmente = async (
    clienteId: string,
    cuentaId: string,
    servicioId: string,
    meses: number = 1,
    fechaVencimientoManual?: string
  ): Promise<boolean> => {
    try {
      // ✅ 🔍 VERIFICACIÓN: ¿Qué valor de meses llegó?
      console.log('🔍 VALOR DE MESES RECIBIDO:', meses);
      console.log('🔍 FECHA MANUAL RECIBIDA:', fechaVencimientoManual);

      // ✅ Asegurar que meses sea un número válido
      const mesesFinal = Number(meses) && Number(meses) > 0 ? Number(meses) : 1;
      console.log('✅ MESES FINAL A USAR:', mesesFinal);

      // PASO 1: Buscar datos del servicio
      const servicio = servicios.find(s => s.id === servicioId);
      if (!servicio) {
        alert('❌ Servicio no encontrado');
        return false;
      }

      // PASO 2: Buscar datos de la cuenta
      const cuenta = todasLasCuentas.find(c => c.id === cuentaId);
      if (!cuenta) {
        alert('❌ Cuenta no encontrada');
        return false;
      }

      // PASO 3: Buscar datos del cliente
      const cliente = perfiles.find((p: any) => p.id === clienteId);
      if (!cliente) {
        alert('❌ Cliente no encontrado');
        return false;
      }

      // ✅ PASO 4: Calcular TODO con MESES FINAL
      const precioTotal = servicio.precio * mesesFinal;
      const etiquetaMeses = `${mesesFinal} Mes${mesesFinal > 1 ? 'es' : ''}`;
      
      console.log('💰 PRECIO TOTAL CALCULADO:', precioTotal);
      console.log('⏳ ETIQUETA MESES:', etiquetaMeses);

      let fechaVencimiento: Date;
      let fechaVencimientoStr: string;

      if (fechaVencimientoManual) {
        fechaVencimiento = new Date(fechaVencimientoManual + 'T23:59:59');
        fechaVencimientoStr = fechaVencimiento.toLocaleDateString('es-BO');
        console.log('📅 Usando FECHA MANUAL:', fechaVencimientoStr);
      } else {
        fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mesesFinal);
        fechaVencimientoStr = fechaVencimiento.toLocaleDateString('es-BO');
        console.log('📅 Fecha calculada AUTOMÁTICAMENTE:', fechaVencimientoStr);
      }

      // PASO 5: Crear la orden CON TODOS LOS CAMPOS
      const ordenId = `ORD-${Date.now()}`;
      const ordenDatos: any = {
        id: ordenId,
        fecha: new Date().toISOString(),
        duracion_meses: mesesFinal, // ✅ Usa mesesFinal
        cliente_nombre: cliente.nombre || 'Cliente',
        cliente_correo: cliente.correo || '',
        cliente_telefono: cliente.telefono || '',
        servicio_nombre: servicio.nombre,
        correo: cuenta.usuario_correo || 'Sin correo',
        contrasena: cuenta.contrasena || 'Sin contraseña',
        perfil: cuenta.perfil || 'No especificado',
        pin: cuenta.pin || 'No especificado',
        total: precioTotal, // ✅ Usa precioTotal = precio × meses
        estado: 'completada',
        vencimiento: fechaVencimiento.toISOString(),
        cliente_id: clienteId,
        servicio_id: servicioId,
        cuenta_id: cuentaId,
        monto: precioTotal, // ✅ Usa precioTotal
        metodo_pago: 'manual',
        tipo_venta: 'directa_admin'
      };

      console.log('📋 DATOS DE LA ORDEN A GUARDAR:', ordenDatos);

      // Guardar la orden directamente con supabase
      const { error: errorGuardar } = await supabase
        .from('ordenes')
        .insert([ordenDatos]);

      if (errorGuardar) {
        console.error('❌ Error al guardar orden:', errorGuardar);
        alert('❌ Error al crear la orden:\n' + errorGuardar.message);
        return false;
      }
      console.log('✅ Orden creada correctamente');

      // PASO 6: Marcar la cuenta como ENTREGADA
      const { error: errorEntregar } = await supabaseService.entregarCuenta(cuentaId, ordenId);
      if (errorEntregar) {
        alert('❌ Error al entregar la cuenta:\n' + errorEntregar.message);
        return false;
      }
      console.log('✅ Cuenta marcada como Entregada');

      // PASO 7: Disminuir stock
      const { error: errorStock } = await supabaseService.disminuirStockServicio(servicioId);
      if (errorStock) {
        console.warn('⚠️ No se pudo actualizar el stock automáticamente');
      }

      // PASO 8: Aumentar total gastado del cliente
      await supabaseService.aumentarTotalGastado(clienteId, precioTotal);

      // ═══════════════════════════════════════════════════════════
      // ✅ MENSAJE WHATSAPP — CON MESES Y TOTAL CORRECTOS 💎
      // ═══════════════════════════════════════════════════════════
      const telefono = (cliente.telefono || '').replace(/\D/g, '');
      if (telefono) {
        const mensaje = encodeURIComponent(
`✅ CUENTA ACTIVA — ${servicio.nombre}

Cliente: ${cliente.nombre}

📧 Correo: ${cuenta.usuario_correo}
🔑 Contraseña: ${cuenta.contrasena}
👤 Perfil: ${cuenta.perfil || 'No especificado'}
📌 PIN: ${cuenta.pin || 'No especificado'}

📅 Vence: ${fechaVencimientoStr}
⏳ Duración: ${etiquetaMeses}
💰 Total: $${precioTotal.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 No cambies la contraseña ni el PIN.
¡Gracias por tu compra! 🙌`
        );
        console.log('📱 MENSAJE WHATSAPP GENERADO:', {
          duracion: etiquetaMeses,
          total: precioTotal.toFixed(2)
        });
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
      } else {
        alert('⚠️ Cuenta asignada correctamente, pero el cliente no tiene teléfono registrado para enviar WhatsApp.');
      }

      await cargarTodasLasCuentas();
      console.log('✅ ¡ASIGNACIÓN COMPLETA!');
      return true;

    } catch (err: any) {
      console.error('❌ Error en asignación manual:', err);
      alert('❌ Error inesperado:\n' + (err.message || 'Error desconocido'));
      return false;
    }
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<ServicioStreaming | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<ServicioStreaming | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // ✅ FUNCIÓN ELIMINAR ORDEN — SIN VENTANA DE ÉXITO
  const eliminarOrden = async (orden: any): Promise<boolean> => {
    try {
      console.log('🗑️ Eliminando orden:', orden.id);
      console.log('📋 Datos de la orden → cuenta_id:', orden.cuenta_id, '| servicio_id:', orden.servicio_id);

      // PASO 1: LIBERAR LA CUENTA → vuelve a DISPONIBLE
      if (orden.cuenta_id) {
        console.log('🔓 Liberando cuenta ID:', orden.cuenta_id);
        const { error } = await supabaseService.liberarCuenta(orden.cuenta_id);
        if (error) {
          alert('❌ Error al liberar la cuenta:\n' + error.message);
          return false;
        }
        console.log('✅ Cuenta liberada → ✅ LIBRE en "Todas las Cuentas"');
      } else {
        console.warn('⚠️ Esta orden NO tiene cuenta_id, no se pudo liberar la cuenta');
      }

      // PASO 2: AUMENTAR EL STOCK del servicio
      if (orden.servicio_id) {
        console.log('📦 Aumentando stock del servicio:', orden.servicio_id);
        const { error } = await supabaseService.aumentarStockServicio(orden.servicio_id);
        if (error) {
          alert('❌ Error al aumentar el stock:\n' + error.message);
          return false;
        }
        console.log('✅ Stock aumentado +1 → se refleja en el Catálogo');
      } else {
        console.warn('⚠️ Esta orden NO tiene servicio_id, no se pudo actualizar el stock');
      }

      // PASO 3: ELIMINAR LA ORDEN de la tabla
      const { error: errorOrden } = await supabaseService.eliminarOrdenCompra(orden.id);
      if (errorOrden) {
        alert('❌ Error al eliminar la orden:\n' + errorOrden.message);
        return false;
      }
      console.log('✅ Orden eliminada de la lista');

      // ✅ RECARGAMOS TODO
      await cargarTodasLasCuentas();
      return true;

    } catch (err: any) {
      console.error('❌ Error inesperado:', err);
      alert('❌ Ocurrió un error inesperado:\n' + (err?.message || 'Error desconocido'));
      return false;
    }
  };

  const totalStock = useMemo(() => {
    return todasLasCuentas.filter(c => 
      (c.estado || '').trim().toLowerCase() === 'disponible' || 
      c.estado === null || 
      c.estado === ''
    ).length;
  }, [todasLasCuentas]);

  const totalActivos = useMemo(() => {
    const serviciosConStock = new Set(
      todasLasCuentas.filter(c => 
        (c.estado || '').trim().toLowerCase() === 'disponible' || 
        c.estado === null || 
        c.estado === ''
      ).map(c => c.servicio_id)
    );
    return serviciosConStock.size;
  }, [todasLasCuentas]);

  const totalAgotados = useMemo(() => {
    const serviciosConStock = new Set(
      todasLasCuentas.filter(c => 
        (c.estado || '').trim().toLowerCase() === 'disponible' || 
        c.estado === null || 
        c.estado === ''
      ).map(c => c.servicio_id)
    );
    return servicios.length - serviciosConStock.size;
  }, [servicios, todasLasCuentas]);

  return (
    <div className="min-h-screen bg-[#101010] text-white flex flex-col lg:flex-row antialiased font-sans overflow-x-hidden">
      <AdminSidebar
        tabActiva={tabActiva as any}
        onCambiarTab={(tab: any) => {
          console.log('👉 Cambiando a pestaña:', tab);
          setTabActiva(tab);
        }}
        totalServicios={servicios.length}
        totalPedidos={ordenes.length}
        onCerrarSesion={() => setIsLogoutModalOpen(true)}
        onIrATienda={onIrATienda}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-[#141414]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobileSidebar(true)}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Panel de Administrador</span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {tabActiva === 'catalogo' && 'Catálogo de Servicios'}
                {tabActiva === 'cuentas' && 'Todas las Cuentas'}
                {tabActiva === 'pedidos' && 'Pedidos de Clientes'}
                {tabActiva === 'clientes' && 'Gestión de Clientes'}
                {tabActiva === 'metricas' && 'Métricas & Finanzas'}
                {tabActiva === 'configuraciones' && 'Configuraciones del Sistema'}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {tabActiva !== 'configuraciones' && tabActiva !== 'cuentas' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-400 font-bold uppercase">Total Servicios</span>
                <h3 className="text-2xl font-black text-white mt-1">{servicios.length}</h3>
              </div>
              <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-400 font-bold uppercase">Servicios Activos</span>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalActivos}</h3>
              </div>
              <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-400 font-bold uppercase">Servicios Agotados</span>
                <h3 className="text-2xl font-black text-rose-400 mt-1">{totalAgotados}</h3>
              </div>
              <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-400 font-bold uppercase">Stock Total</span>
                <h3 className="text-2xl font-black text-white mt-1">{totalStock}</h3>
              </div>
            </div>
          )}

          {tabActiva === 'catalogo' && <AdminServicesTable 
            servicios={servicios} 
            todasLasCuentas={todasLasCuentas}
            onRecargarTodasCuentas={cargarTodasLasCuentas}
            onEditarServicio={setServicioAEditar} 
            onEliminarServicio={setServicioAEliminar} 
            onActualizarStockRapido={onActualizarStockRapido} 
            onAbrirModalNuevoServicio={() => setIsAddModalOpen(true)} 
            onVerServicioEnTienda={onVerServicioEnTienda} 
          />}
          
          {/* ✅ TODAS LAS CUENTAS */}
          {tabActiva === 'cuentas' && <AdminAllAccounts />}
          
          {/* ✅ PEDIDOS — CON FUNCIÓN ELIMINAR CONECTADA */}
          {tabActiva === 'pedidos' && (
            <AdminOrdersTable 
              ordenes={ordenes} 
              perfiles={perfiles} 
              onEliminarOrden={eliminarOrden}
            />
          )}

          {/* ✅ CLIENTES — CON FUNCIÓN DE ASIGNAR CUENTA CONECTADA */}
          {tabActiva === 'clientes' && (
            <AdminCustomersTable
              servicios={servicios}
              todasLasCuentas={todasLasCuentas}
              onAsignarCuentaManual={asignarCuentaManualmente}
            />
          )}

          {tabActiva === 'metricas' && <AdminMetricsView servicios={servicios} ordenes={ordenes} />}
          
          {tabActiva === 'configuraciones' && (
            <div>
              {cargandoConfig ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                  <span className="ml-3 text-zinc-400">Cargando configuración...</span>
                </div>
              ) : (
                <AdminSettingsView configuracion={configuracion} onGuardarConfiguracion={handleGuardarConfiguracion} />
              )}
            </div>
          )}
        </main>
      </div>

      <AddServiceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCrearServicio={onCrearServicio} />
      <EditServiceModal servicio={servicioAEditar} isOpen={!!servicioAEditar} onClose={() => setServicioAEditar(null)} onGuardarCambios={onEditarServicio} />
      <DeleteConfirmModal servicio={servicioAEliminar} isOpen={!!servicioAEliminar} onClose={() => setServicioAEliminar(null)} onConfirmarEliminar={onEliminarServicio} />
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirmarLogout={() => { setIsLogoutModalOpen(false); onIrATienda(); }} />
    </div>
  );
};

// ✅ EXPORTACIÓN
export default AdminDashboard;