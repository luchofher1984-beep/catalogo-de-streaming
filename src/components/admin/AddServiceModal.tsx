import React, { useState, useRef } from 'react';
import { ServicioStreaming, CategoriaServicio } from '../../types';
import { X, Plus, Sparkles, Image as ImageIcon, Upload, DollarSign, Package, Layers, ShieldCheck, Tag, Info, Check } from 'lucide-react';



interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrearServicio: (servicio: Omit<ServicioStreaming, 'id' | 'created_at' | 'ventas_count' | 'calificacion'>) => Promise<boolean>;
}



// Logos preconfigurados de servicios populares para selección en 1-click
const LOGOS_PREDETERMINADOS = [
  { nombre: 'Netflix', url: 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png', color: '#E50914' },
  { nombre: 'Disney+', url: 'https://static-assets.bamgrid.com/product/disneyplus/images/disney-plus-logo-ms.png', color: '#113CCF' },
  { nombre: 'Spotify', url: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png', color: '#1DB954' },
  { nombre: 'Max (HBO)', url: 'https://images.ctfassets.net/4cd45et68cgf/7LrExJ6KmAgEgnkJWqnoSj/2cd62f83151817cf7b5c65f8cfb75653/HBO_Max_Logo.svg', color: '#002BE7' },
  { nombre: 'YouTube', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png', color: '#FF0000' },
  { nombre: 'Prime Video', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/512px-Amazon_Prime_Video_logo.svg.png', color: '#00A8E1' },
  { nombre: 'Crunchyroll', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Crunchyroll_Logo.svg/512px-Crunchyroll_Logo.svg.png', color: '#F47521' },
  { nombre: 'Paramount+', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Paramount_Plus.svg/512px-Paramount_Plus.svg.png', color: '#0064FF' },
  { nombre: 'Apple TV+', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Apple_TV_Plus_Logo.svg/512px-Apple_TV_Plus_Logo.svg.png', color: '#FFFFFF' },
  { nombre: 'DAZN', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/DAZN_Logo_Master.svg/512px-DAZN_Logo_Master.svg.png', color: '#F5FF00' },
];



export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onCrearServicio,
}) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('3.99');
  const [precioOriginal, setPrecioOriginal] = useState<string | undefined>('7.99');
  const [stock, setStock] = useState('10');
  const [logoUrl, setLogoUrl] = useState(LOGOS_PREDETERMINADOS[0].url);
  const [imagenCargada, setImagenCargada] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<'peliculas_series' | 'musica' | 'anime_gaming' | 'deportes' | 'combos'>('peliculas_series');
  const [tipoCuenta, setTipoCuenta] = useState('Cuenta Completa Privada');
  const [duracion, setDuracion] = useState('30 Días');
  const [garantiaDias, setGarantiaDias] = useState('30');
  const [descripcion, setDescripcion] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const inputArchivoRef = useRef<HTMLInputElement>(null);

  // ✅ Manejar carga de imagen desde archivo
  const manejarCargarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    const lector = new FileReader();
    lector.onload = (evento) => {
      const urlImagen = evento.target?.result as string;
      setImagenCargada(urlImagen);
      setLogoUrl(urlImagen); // ✅ Llena automáticamente el campo URL
      setErrorMsg('');
    };
    lector.readAsDataURL(archivo);
  };

  // ✅ Seleccionar logo predeterminado
  const seleccionarLogoPredeterminado = (url: string, nombreServicio: string) => {
    setLogoUrl(url);
    setImagenCargada(null); // Quita la imagen cargada si se elige uno predeterminado
    if (!nombre) setNombre(nombreServicio + ' Premium 4K');
  };



  if (!isOpen) return null;



  const categoriasLabels: Record<string, string> = {
    peliculas_series: 'Películas & Series',
    musica: 'Música & Audio',
    anime_gaming: 'Anime & Gaming',
    deportes: 'Deportes en Vivo',
    combos: 'Combos Especiales',
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');



    if (!nombre.trim()) {
      setErrorMsg('Por favor ingresa el nombre del servicio.');
      return;
    }



    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorMsg('El precio debe ser un número mayor a 0.');
      return;
    }



    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }



    setGuardando(true);



    const caracteristicasDefault = [
      `Acceso oficial a ${nombre.trim()}`,
      `Calidad Ultra HD / 4K garantizada`,
      `Garantía oficial por ${duracion}`,
      `Soporte 24/7 y entrega automática inmediata`,
    ];



    // ✅ Construimos el objeto de forma segura para TypeScript
    const datosServicio: any = {
      nombre: nombre.trim(),
      precio: precioNum,
      stock: stockNum,
      logo_url: logoUrl.trim() || LOGOS_PREDETERMINADOS[0].url,
      categoria,
      categoria_label: categoriasLabels[categoria] || 'Streaming',
      tipo_cuenta: tipoCuenta,
      duracion,
      garantia_dias: parseInt(garantiaDias, 10) || 30,
      descripcion: descripcion.trim() || `Suscripción oficial a ${nombre} con activación instantánea y garantía asegurada.`,
      caracteristicas: caracteristicasDefault,
      destacado,
    };


    // ✅ Solo agregamos precio_original si tiene valor
    if (precioOriginal && precioOriginal.trim() !== '') {
      datosServicio.precio_original = parseFloat(precioOriginal);
    }



    const exito = await onCrearServicio(datosServicio);



    setGuardando(false);
    if (exito) {
      // Reset form
      setNombre('');
      setPrecio('3.99');
      setPrecioOriginal('7.99');
      setStock('10');
      setDescripcion('');
      setImagenCargada(null);
      onClose();
    }
  };



  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#181818] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                Añadir Nuevo Servicio de Streaming
              </h2>
              <p className="text-xs text-zinc-400">
                Registra un nuevo plan o suscripción para el catálogo de clientes
              </p>
            </div>
          </div>



          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>



        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}



          {/* Nombre del Servicio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Nombre del Servicio <span className="text-red-500">*</span>
            </label>
            <input
              id="input-nuevo-servicio-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Star+ Premium Ultra HD, Spotify Familiar, etc."
              className="w-full bg-[#121212] text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-zinc-600"
            />
          </div>



          {/* ✅ LOGO SECCIÓN — CON OPCIÓN DE CARGAR IMAGEN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Logo Oficial (Selecciona, Carga imagen o pega URL)
            </label>

            {/* ✅ BOTÓN CARGAR IMAGEN PROPIA — NUEVO */}
            <button
              type="button"
              onClick={() => inputArchivoRef.current?.click()}
              className="w-full mb-3 p-3 border-2 border-dashed border-zinc-600 hover:border-red-500 rounded-xl flex items-center justify-center gap-2 text-zinc-300 hover:text-white transition-colors bg-zinc-900/50"
            >
              <Upload size={18} className="text-red-400" />
              <span className="text-sm font-medium">📁 Cargar imagen desde mi equipo</span>
            </button>
            <input
              ref={inputArchivoRef}
              type="file"
              accept="image/*"
              onChange={manejarCargarImagen}
              className="hidden"
            />

            {/* ✅ Vista previa de imagen cargada */}
            {imagenCargada && (
              <div className="mb-3 p-2 bg-zinc-800/50 rounded-xl flex items-center gap-3 border border-emerald-700/50">
                <img src={imagenCargada} alt="Vista previa" className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                    <Check size={14} /> Imagen cargada correctamente
                  </p>
                  <p className="text-xs text-zinc-400">Se usará esta imagen como logo</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setImagenCargada(null); setLogoUrl(LOGOS_PREDETERMINADOS[0].url); }}
                  className="text-zinc-400 hover:text-rose-400 text-xs"
                >
                  Quitar
                </button>
              </div>
            )}

            {/* Logos Populares (Selección Rápida) */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-3">
              {LOGOS_PREDETERMINADOS.map((item) => {
                const isSelected = logoUrl === item.url && !imagenCargada;
                return (
                  <button
                    key={item.nombre}
                    type="button"
                    onClick={() => seleccionarLogoPredeterminado(item.url, item.nombre)}
                    className={`relative p-2 rounded-xl border transition-all flex flex-col items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 ${
                      isSelected
                        ? 'border-red-500 ring-2 ring-red-500/40 bg-zinc-800'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                    title={item.nombre}
                  >
                    <img
                      src={item.url}
                      alt={item.nombre}
                      className="w-7 h-7 object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>



            <div className="flex items-center gap-2">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center">
                <img
                  src={logoUrl || LOGOS_PREDETERMINADOS[0].url}
                  alt="Preview Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3163/3163508.png';
                  }}
                />
              </div>
              <input
                id="input-nuevo-servicio-logo"
                type="url"
                value={logoUrl}
                onChange={(e) => { setLogoUrl(e.target.value); setImagenCargada(null); }}
                placeholder="https://ejemplo.com/logo.png"
                className="flex-1 bg-[#121212] text-white text-xs px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-zinc-300"
              />
            </div>
          </div>



          {/* Fila: Precio, Precio Original y Stock — AHORA EN BOLIVIANOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Precio de Venta (Bs.) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">Bs.</span>
                <input
                  id="input-nuevo-servicio-precio"
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="3,99"
                  className="w-full bg-[#121212] text-white text-sm pl-10 pr-3 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                />
              </div>
            </div>



            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Precio Regular / Anterior (Bs.)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Bs.</span>
                <input
                  id="input-nuevo-servicio-precio-original"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioOriginal}
                  onChange={(e) => setPrecioOriginal(e.target.value)}
                  placeholder="7,99"
                  className="w-full bg-[#121212] text-zinc-400 text-sm pl-10 pr-3 py-2.5 rounded-xl border border-zinc-800 focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>



            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Stock Inicial (Cuentas) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-nuevo-servicio-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-[#121212] text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                />
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {parseInt(stock || '0', 10) === 0 ? '⚠️ Se marcará como Agotado' : '✅ Disponible para compra'}
              </span>
            </div>
          </div>



          {/* Fila: Categoría y Tipo de Cuenta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Categoría
              </label>
              <select
                id="select-nuevo-servicio-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full bg-[#121212] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
              >
                <option value="peliculas_series">Películas & Series</option>
                <option value="musica">Música & Audio</option>
                <option value="anime_gaming">Anime & Gaming</option>
                <option value="deportes">Deportes en Vivo</option>
                <option value="combos">Combos Especiales</option>
              </select>
            </div>



            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Tipo de Cuenta / Formato
              </label>
              <input
                id="input-nuevo-servicio-tipo-cuenta"
                type="text"
                value={tipoCuenta}
                onChange={(e) => setTipoCuenta(e.target.value)}
                placeholder="Ej: Cuenta Completa 4K, Perfil con PIN"
                className="w-full bg-[#121212] text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>



          {/* Fila: Duración y Garantía */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Duración de Suscripción
              </label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-[#121212] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
              >
                <option value="30 Días">30 Días (1 Mes)</option>
                <option value="3 Meses">3 Meses (Trimestral)</option>
                <option value="6 Meses">6 Meses (Semestral)</option>
                <option value="1 Año">1 Año (Anual)</option>
              </select>
            </div>



            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Días de Garantía
              </label>
              <input
                type="number"
                min="0"
                value={garantiaDias}
                onChange={(e) => setGarantiaDias(e.target.value)}
                placeholder="30"
                className="w-full bg-[#121212] text-white text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>



          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Descripción del Servicio
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla las características principales del servicio, calidad de reproducción, pantallas, etc."
              className="w-full bg-[#121212] text-white text-xs sm:text-sm p-3 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-zinc-600 resize-none"
            />
          </div>



          {/* Destacado */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <input
              id="checkbox-nuevo-servicio-destacado"
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded bg-zinc-800 border-zinc-700 focus:ring-red-500"
            />
            <label htmlFor="checkbox-nuevo-servicio-destacado" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Marcar como <strong className="text-white">Servicio Destacado</strong> (Aparece en los primeros lugares y con insignia especial)
            </label>
          </div>



          {/* Botones de Acción */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-nuevo-servicio"
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-900/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando en Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardar y Publicar Servicio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};