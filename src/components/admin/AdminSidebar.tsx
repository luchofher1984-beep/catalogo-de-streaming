import React from 'react';
import { AdminTab } from '../../types';
import {
  Film,
  ShoppingCart,
  LogOut,
  Store,
  Layers,
  Sparkles,
  BarChart3,
  Database,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sliders,
  Users,
  Settings,
  Key  // ✅ AGREGADO: icono para "Todas las Cuentas"
} from 'lucide-react';


interface AdminSidebarProps {
  tabActiva: AdminTab;
  onCambiarTab: (tab: AdminTab) => void;
  totalServicios: number;
  totalPedidos: number;
  onCerrarSesion: () => void;
  onIrATienda: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}


export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  tabActiva,
  onCambiarTab,
  totalServicios,
  totalPedidos,
  onCerrarSesion,
  onIrATienda,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'catalogo' as AdminTab,
      label: 'Catálogo de Servicios',
      icon: Film,
      badge: totalServicios,
      descripcion: 'Gestión de precios y stock',
    },
    // ✅ ==== NUEVA OPCIÓN: TODAS LAS CUENTAS ====
    {
      id: 'cuentas' as AdminTab,
      label: 'Todas las Cuentas',
      icon: Key,
      badge: null,
      descripcion: 'Lista completa con estado',
    },
    // ✅ ==== FIN NUEVA OPCIÓN ====
    {
      id: 'pedidos' as AdminTab,
      label: 'Pedidos de Clientes',
      icon: ShoppingCart,
      badge: totalPedidos,
      descripcion: 'Historial de compras y códigos',
    },
    {
      id: 'clientes' as AdminTab,
      label: 'Gestión de Clientes',
      icon: Users,
      badge: null,
      descripcion: 'Perfiles, compras y estado',
    },
    {
      id: 'metricas' as AdminTab,
      label: 'Métricas & Finanzas',
      icon: BarChart3,
      badge: null,
      descripcion: 'Ingresos y rendimiento',
    },
    {
      id: 'configuraciones' as AdminTab,
      label: 'Configuraciones del Sistema',
      icon: Settings,
      badge: null,
      descripcion: 'QR, pagos y ajustes generales',
    },
  ];


  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}


      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#121212] border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-lg shadow-red-900/50">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-white tracking-wide">
                  STREAM<span className="text-red-600">ADMIN</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Panel de Control
                </span>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white lg:hidden"
            >
              ✕
            </button>
          </div>
        </div>


        {/* Navegación */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Administración
          </div>


          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = tabActiva === item.id;


            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  console.log('👉 CLIC en:', item.id);
                  onCambiarTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-red-400'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm">{item.label}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-red-100 font-normal' : 'text-zinc-400'
                      }`}
                    >
                      {item.descripcion}
                    </span>
                  </div>
                </div>


                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}


          {/* Accesos Directos */}
          <div className="pt-6 mt-6 border-t border-zinc-800/80">
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Vistas de la Tienda
            </div>


            <button
              id="btn-sidebar-ir-tienda"
              onClick={onIrATienda}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-xs font-semibold group border border-zinc-800 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Ver Tienda de Clientes</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300" />
            </button>
          </div>
        </div>


        {/* Pie - Perfil y Cerrar Sesión */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#101010] space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center font-black text-white text-sm">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121212]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">Admin Master</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 truncate block">
                fherchoapaza@gmail.com
              </span>
            </div>
          </div>


          <button
            id="sidebar-btn-cerrar-sesion"
            onClick={onCerrarSesion}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/70 hover:bg-rose-600 text-zinc-300 hover:text-white transition-all text-xs font-bold border border-zinc-700 hover:border-rose-500 group shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};