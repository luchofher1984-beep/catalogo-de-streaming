import React from 'react';
import { ServicioStreaming, OrdenCompra } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  AlertTriangle,
  Users,
  Flame,
  Award,
  Layers,
} from 'lucide-react';

interface AdminMetricsViewProps {
  servicios: ServicioStreaming[];
  ordenes: OrdenCompra[];
}

export const AdminMetricsView: React.FC<AdminMetricsViewProps> = ({ servicios, ordenes }) => {
  const stockTotal = servicios.reduce((acc, s) => acc + s.stock, 0);
  const valorInventario = servicios.reduce((acc, s) => acc + s.stock * s.precio, 0);
  const totalVentasRealizadas = servicios.reduce((acc, s) => acc + s.ventas_count, 0);
  const facturacionTotal = ordenes.reduce((acc, o) => acc + o.total, 0);

  const serviciosMasVendidos = [...servicios].sort((a, b) => b.ventas_count - a.ventas_count).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Facturación Clientes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">${facturacionTotal.toFixed(2)}</h3>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              100% cobrado y entregado
            </span>
          </div>
        </div>

        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Unidades en Stock</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{stockTotal} <span className="text-sm font-normal text-zinc-400">cuentas</span></h3>
            <span className="text-xs text-zinc-400 mt-1 block">
              Distribuidas en {servicios.length} plataformas
            </span>
          </div>
        </div>

        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Valor de Inventario</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">${valorInventario.toFixed(2)}</h3>
            <span className="text-xs text-purple-400 font-semibold mt-1 block">
              Valor de venta potencial
            </span>
          </div>
        </div>

        <div className="bg-[#181818] p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Suscripciones Vendidas</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{totalVentasRealizadas} <span className="text-sm font-normal text-zinc-400">activadas</span></h3>
            <span className="text-xs text-zinc-400 mt-1 block">
              Histórico acumulado de la tienda
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 Servicios Más Vendidos */}
      <div className="bg-[#181818] p-6 rounded-2xl border border-zinc-800">
        <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Top 5 Servicios de Streaming Más Demandados</span>
        </h4>

        <div className="space-y-3">
          {serviciosMasVendidos.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-zinc-500 text-sm">
                  #{idx + 1}
                </span>
                <div className="w-9 h-9 rounded-lg bg-black/50 p-1 border border-zinc-800 flex items-center justify-center">
                  <img
                    src={s.logo_url}
                    alt={s.nombre}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-white">{s.nombre}</h5>
                  <span className="text-[11px] text-zinc-400">${s.precio.toFixed(2)} / mes • {s.categoria_label}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-emerald-400">
                  {s.ventas_count} ventas
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {s.stock} en stock actualmente
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
