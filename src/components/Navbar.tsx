import React from 'react';
import { Search, Database, UserPlus, LogIn, Download } from 'lucide-react';

interface NavbarProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  totalServicios: number;
  serviciosEnStock: number;
  serviciosAgotados: number;
  onOpenSupabaseModal: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  isLoggedIn?: boolean;
  onInstalarApp?: () => void;
  mostrarBotonInstalar?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  busqueda,
  onBusquedaChange,
  onOpenLogin,
  onOpenRegister,
  isLoggedIn,
  onInstalarApp,
  mostrarBotonInstalar = true
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#141414]/95 backdrop-blur-md border-b border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-0">
        
        {/* En móvil se pone en 2 filas (flex-col), en PC en 1 fila (flex-row) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:h-20 gap-3 sm:gap-4">
          
          {/* Fila 1 en móvil: Logo a la izquierda, Botones a la derecha */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            
            {/* Logo compacto */}
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg sm:text-xl tracking-tighter shadow-lg shadow-red-900/50">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-2xl text-red-600 tracking-wider font-sans leading-none mt-1">
                  STREAM<span className="text-white">STORE</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
                  Catálogo Oficial
                </span>
              </div>
            </a>

            {/* Botones (En móvil se oculta el texto y solo queda el icono) */}
            <div className="flex items-center gap-2">
              {mostrarBotonInstalar && onInstalarApp && (
                <button
                  onClick={onInstalarApp}
                  title="Instalar App"
                  className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold shadow-md animate-pulse cursor-pointer"
                >
                  <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Instalar App</span>
                </button>
              )}

              {!isLoggedIn && (
                <>
                  {onOpenLogin && (
                    <button
                      onClick={onOpenLogin}
                      title="Iniciar Sesión"
                      className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline ml-1.5">Ingresar</span>
                    </button>
                  )}
                  {onOpenRegister && (
                    <button
                      onClick={onOpenRegister}
                      title="Registrarse"
                      className="flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline ml-1.5">Registro</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Fila 2 en móvil: Buscador ocupando todo el ancho inferior */}
          <div className="w-full sm:flex-1 sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => onBusquedaChange(e.target.value)}
                placeholder="Buscar servicio..."
                className="w-full bg-[#1e1e1e] hover:bg-[#252525] focus:bg-[#222222] text-white text-sm pl-10 pr-4 py-2.5 rounded-lg border border-zinc-700/70 focus:border-red-500 focus:outline-none transition-all placeholder:text-zinc-500"
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};