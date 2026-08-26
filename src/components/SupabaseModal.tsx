import React, { useState } from 'react';
import { ServicioStreaming } from '../types';
import { supabaseService } from '../services/supabaseService';
import { Database, Code2, Table, X, Check, Copy, Sparkles, RefreshCw } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicios: ServicioStreaming[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  servicios,
}) => {
  if (!isOpen) return null;

  const [tabActiva, setTabActiva] = useState<'tabla' | 'json' | 'sql'>('tabla');
  const [copiado, setCopiado] = useState(false);

  const sqlSchema = supabaseService.getSupabaseSQLSchema();

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#141414] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Cabecera */}
        <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Base de Datos Supabase (Simulada)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  v2.0 • PostgreSQL
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Tabla: <code className="text-emerald-400">public.servicios_streaming</code> (campos: nombre, precio, stock, logo_url)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-800 bg-zinc-900/40">
          <button
            onClick={() => setTabActiva('tabla')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              tabActiva === 'tabla'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Vista de Registros ({servicios.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('json')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              tabActiva === 'json'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Respuesta JSON Supabase Client</span>
          </button>

          <button
            onClick={() => setTabActiva('sql')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              tabActiva === 'sql'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Esquema SQL & RLS</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-zinc-300 space-y-4">
          {tabActiva === 'tabla' && (
            <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <th className="p-3 font-semibold">logo_url</th>
                    <th className="p-3 font-semibold">nombre</th>
                    <th className="p-3 font-semibold">precio</th>
                    <th className="p-3 font-semibold">stock</th>
                    <th className="p-3 font-semibold">categoría</th>
                    <th className="p-3 font-semibold">estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {servicios.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3">
                        <img
                          src={s.logo_url}
                          alt={s.nombre}
                          className="w-7 h-7 object-contain bg-zinc-900 rounded p-0.5 border border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="p-3 font-bold text-white">{s.nombre}</td>
                      <td className="p-3 text-emerald-400 font-semibold">${s.precio.toFixed(2)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            s.stock === 0
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : s.stock <= 5
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {s.stock}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-400">{s.categoria}</td>
                      <td className="p-3">
                        {s.stock === 0 ? (
                          <span className="text-rose-400">🔴 Agotado</span>
                        ) : (
                          <span className="text-emerald-400">🟢 Disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tabActiva === 'json' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-sans">
                  Query: <code className="text-emerald-400">supabase.from('servicios_streaming').select('id, nombre, precio, stock, logo_url, categoria')</code>
                </span>
                <button
                  onClick={() => copiarTexto(JSON.stringify(servicios, null, 2))}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? 'Copiado' : 'Copiar JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto text-[11px] text-emerald-300 leading-relaxed max-h-96">
                {JSON.stringify(
                  servicios.map((s) => ({
                    id: s.id,
                    nombre: s.nombre,
                    precio: s.precio,
                    stock: s.stock,
                    logo_url: s.logo_url,
                    categoria: s.categoria,
                    estado: s.stock === 0 ? 'Agotado' : 'En stock',
                  })),
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {tabActiva === 'sql' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 font-sans">
                  Script de creación DDL para Supabase SQL Editor:
                </span>
                <button
                  onClick={() => copiarTexto(sqlSchema)}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? 'Copiado' : 'Copiar SQL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto text-[11px] text-zinc-300 leading-relaxed max-h-96">
                {sqlSchema}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Persistencia local en tiempo real activa</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
