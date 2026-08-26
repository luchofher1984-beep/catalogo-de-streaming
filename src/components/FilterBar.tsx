import React from 'react';
import { CategoriaServicio } from '../types';
import { Film, Music, Tv, Trophy, Layers, Filter, CheckCircle2 } from 'lucide-react';

interface FilterBarProps {
  categoriaActiva: CategoriaServicio;
  onSelectCategoria: (cat: CategoriaServicio) => void;
  soloEnStock: boolean;
  onToggleSoloEnStock: (val: boolean) => void;
  ordenarPor: 'destacados' | 'precio_asc' | 'precio_desc' | 'stock_desc';
  onOrdenarPorChange: (val: 'destacados' | 'precio_asc' | 'precio_desc' | 'stock_desc') => void;
  conteoPorCategoria: Record<CategoriaServicio, number>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categoriaActiva,
  onSelectCategoria,
  soloEnStock,
  onToggleSoloEnStock,
  ordenarPor,
  onOrdenarPorChange,
  conteoPorCategoria,
}) => {
  const categorias: { id: CategoriaServicio; label: string; icon: React.ReactNode }[] = [
    { id: 'todas', label: 'Todos los Servicios', icon: <Layers className="w-4 h-4" /> },
    { id: 'peliculas_series', label: 'Películas & Series', icon: <Film className="w-4 h-4" /> },
    { id: 'musica', label: 'Música & Audio', icon: <Music className="w-4 h-4" /> },
    { id: 'anime_gaming', label: 'Anime & Gaming', icon: <Tv className="w-4 h-4" /> },
    { id: 'deportes', label: 'Deportes', icon: <Trophy className="w-4 h-4" /> },
    { id: 'combos', label: 'Combos Especiales', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col gap-4 mb-8 bg-[#181818] p-3 sm:p-4 rounded-xl border border-zinc-800 shadow-md">
      {/* Botones de Categorías tipo Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categorias.map((cat) => {
          const isActive = categoriaActiva === cat.id;
          const count = conteoPorCategoria[cat.id] || 0;

          return (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => onSelectCategoria(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/60'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-red-800 text-white' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Controles secundarios: Filtro de solo stock y selector de orden */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80 text-xs">
        {/* Toggle Solo en Stock */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-300 hover:text-white transition-colors">
          <input
            id="checkbox-solo-stock"
            type="checkbox"
            checked={soloEnStock}
            onChange={(e) => onToggleSoloEnStock(e.target.checked)}
            className="w-4 h-4 rounded text-red-600 bg-zinc-800 border-zinc-700 focus:ring-red-500 focus:ring-offset-zinc-900"
          />
          <span className="font-medium">Mostrar solo servicios con stock disponible</span>
        </label>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-zinc-400 font-medium">Ordenar por:</span>
          <select
            id="select-ordenar"
            value={ordenarPor}
            onChange={(e) =>
              onOrdenarPorChange(
                e.target.value as 'destacados' | 'precio_asc' | 'precio_desc' | 'stock_desc'
              )
            }
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-200 text-xs focus:border-red-500 focus:outline-none"
          >
            <option value="destacados">Más Populares & Destacados</option>
            <option value="precio_asc">Precio: Menor a Mayor</option>
            <option value="precio_desc">Precio: Mayor a Menor</option>
            <option value="stock_desc">Mayor Stock Disponible</option>
          </select>
        </div>
      </div>
    </div>
  );
};
