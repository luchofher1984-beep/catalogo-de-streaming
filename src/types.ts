// ==========================================
// TIPOS DEL SISTEMA DE STREAMING
// ==========================================


// ✅ Categorías de Servicios
export type CategoriaServicio = 
  | 'todas'
  | 'peliculas_series'
  | 'musica'
  | 'anime_gaming'
  | 'deportes'
  | 'combos'
  | 'general';


// Servicios de Streaming
export interface ServicioStreaming {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_anterior?: number;
  precio_original?: number;
  stock: number;
  categoria: CategoriaServicio | string;
  categoria_label?: string;
  imagen_url: string;
  banner_url?: string;
  logo_url?: string;
  tipo_cuenta?: string;
  duracion?: string;
  garantia_dias?: number;
  caracteristicas?: string[];
  etiqueta?: string;
  destacado: boolean;
  activo: boolean;
  ventas_count: number;
  calificacion: number;
  created_at: string;
}


// ✅ Órdenes / Compras — CAMPOS AGREGADOS para que coincida con todo el sistema
export interface OrdenCompra {
  id: string;
  servicio_id: string;
  servicio_nombre: string;
  cuenta_id?: string;           // ✅ Para liberar cuenta al eliminar
  cliente_nombre: string;
  cliente_correo?: string;       // ✅ Correo del cliente registrado
  cliente_telefono?: string;     // ✅ Teléfono del cliente
  cliente_email?: string;        // ✅ Mantener compatibilidad
  cantidad: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'entregado' | 'cancelado' | 'completada';
  codigo_entrega?: string;
  codigo_activacion?: string;
  instrucciones?: string;
  duracion_meses?: number;       // ✅ Meses de duración → calcular vencimiento
  fecha_vencimiento?: string;    // ✅ Fecha de vencimiento calculada
  correo?: string;               // ✅ Correo de la cuenta
  contrasena?: string;            // ✅ Contraseña de la cuenta
  clave?: string;                // ✅ Alias contraseña
  perfil?: string;               // ✅ Perfil de la cuenta
  pin?: string;                  // ✅ PIN de la cuenta
  cuenta_correo?: string;        // ✅ Alias correo cuenta
  cuenta_contrasena?: string;    // ✅ Alias contraseña cuenta
  cuenta_perfil?: string;        // ✅ Alias perfil cuenta
  cuenta_pin?: string;           // ✅ Alias PIN cuenta
  items?: Array<{
    servicio_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    codigo_activacion: string;
    instrucciones: string;
  }>;
  datos_pago?: {
    metodo: string;
    comprobante_url?: string;
    fecha_pago?: string;
  };
  creada_en?: string;
  fecha?: string;                // ✅ Fecha de compra
  entregada_en?: string;
  telefono?: string;             // ✅ Teléfono alias
}


// Perfil de Cliente
export interface PerfilCliente {
  id: string;
  auth_id: string;
  nombre: string;
  email: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  estado: 'activo' | 'bloqueado' | 'pendiente';
  total_compras?: number;
  total_gastado?: number;
  gasto_total?: number;
  saldo_pendiente?: number;
  servicios_activos?: string[];
  creado_en: string;
  fecha_registro?: string;
}


// ⚙️ Configuraciones del Sistema
export interface ConfiguracionSistema {
  id?: string;
  qr_imagen_url: string;
  qr_instrucciones: string;
  metodo_qr_activo: boolean;
  metodo_transferencia_activo: boolean;
  metodo_efectivo_activo: boolean;
  dias_garantia_default: number;
  correo_soporte: string;
  mensaje_pie_pagina: string;
  creado_en?: string;
  actualizado_en?: string;
}


// ✅ Pestañas del Panel de Administración — NOMBRES COINCIDEN EXACTAMENTE
export type AdminTab = 
  | 'servicios'    // ✅ ← CAMBIADO de 'catalogo' a 'servicios'
  | 'cuentas'
  | 'pedidos'
  | 'clientes'
  | 'metricas'
  | 'configuracion'; // ✅ ← CAMBIADO de 'configuraciones' a 'configuracion'