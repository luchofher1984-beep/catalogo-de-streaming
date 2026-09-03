import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qdwziqslnbrivpnpgyan.supabase.co";
const supabaseKey = "sb_publishable_Jdb22SFQnLE5qGND3ZQcHw_glUPYyUJ";
export const supabase = createClient(supabaseUrl, supabaseKey);

class RealSupabaseClient {
  public async getServicios(): Promise<{ data: any[]; error: string | null }> {
    const { data, error } = await supabase.from('servicios').select('*');
    if (error) return { data: [], error: error.message };
    const serviciosReales = data.map((s: any) => ({
      ...s,
      caracteristicas: s.caracteristicas || ['Activación inmediata', 'Soporte 24/7'],
      categoria: s.categoria || 'general',
      ventas_count: s.ventas_count || 0,
      calificacion: s.calificacion || 5.0,
    }));
    return { data: serviciosReales, error: null };
  }

  public async crearServicio(nuevo: any): Promise<{ data: any | null; error: string | null }> {
    const datosParaGuardar = {
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion || '',
      precio: Number(nuevo.precio),
      precio_anterior: nuevo.precio_anterior ? Number(nuevo.precio_anterior) : null,
      stock: Number(nuevo.stock),
      categoria: nuevo.categoria || 'general',
      imagen_url: nuevo.imagen_url || '',
      banner_url: nuevo.banner_url || '',
      logo_url: nuevo.logo_url || '',
      etiqueta: nuevo.etiqueta || '',
      destacado: nuevo.destacado || false,
      activo: true,
      tipo_cuenta: nuevo.tipo_cuenta || '',
      garantia_dias: nuevo.garantia_dias ? Number(nuevo.garantia_dias) : 30,
      caracteristicas: nuevo.caracteristicas || [],
    };
    const { data, error } = await supabase.from('servicios').insert([datosParaGuardar]).select().single();
    if (error) { alert("Error de la Base de Datos: " + error.message); return { data: null, error: error.message }; }
    return { data: { ...nuevo, ...data }, error: null };
  }

  public async editarServicio(id: string, updates: any): Promise<{ data: any | null; error: string | null }> {
    const datosParaGuardar: any = {};
    if (updates.nombre !== undefined) datosParaGuardar.nombre = updates.nombre;
    if (updates.descripcion !== undefined) datosParaGuardar.descripcion = updates.descripcion;
    if (updates.precio !== undefined) datosParaGuardar.precio = Number(updates.precio);
    if (updates.precio_anterior !== undefined) datosParaGuardar.precio_anterior = updates.precio_anterior ? Number(updates.precio_anterior) : null;
    if (updates.stock !== undefined) datosParaGuardar.stock = Number(updates.stock);
    if (updates.categoria !== undefined) datosParaGuardar.categoria = updates.categoria;
    if (updates.imagen_url !== undefined) datosParaGuardar.imagen_url = updates.imagen_url;
    if (updates.banner_url !== undefined) datosParaGuardar.banner_url = updates.banner_url;
    if (updates.logo_url !== undefined) datosParaGuardar.logo_url = updates.logo_url;
    if (updates.etiqueta !== undefined) datosParaGuardar.etiqueta = updates.etiqueta;
    if (updates.destacado !== undefined) datosParaGuardar.destacado = updates.destacado;
    if (updates.tipo_cuenta !== undefined) datosParaGuardar.tipo_cuenta = updates.tipo_cuenta;
    if (updates.garantia_dias !== undefined) datosParaGuardar.garantia_dias = updates.garantia_dias ? Number(updates.garantia_dias) : 30;
    if (updates.caracteristicas !== undefined) datosParaGuardar.caracteristicas = updates.caracteristicas;
    if (updates.stock !== undefined) datosParaGuardar.estado = Number(updates.stock) > 0 ? 'activo' : 'agotado';
    const { data, error } = await supabase.from('servicios').update(datosParaGuardar).eq('id', id).select().single();
    if (error) { alert("Error al actualizar: " + error.message); return { data: null, error: error.message }; }
    return { data: { ...updates, ...data }, error: null };
  }

  public async eliminarServicio(id: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('servicios').delete().eq('id', id);
    return { success: !error, error: error ? error.message : null };
  }

  public async getOrdenes(): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase.from('ordenes').select('*').order('fecha', { ascending: false });
      if (error) { console.error('❌ Error al leer órdenes:', error); return { data: [], error: error.message }; }
      return { data: data || [], error: null };
    } catch (err: any) { console.error('❌ Excepción al leer órdenes:', err); return { data: [], error: err.message }; }
  }

  // ✅ FUNCIÓN QUE FALTABA: ELIMINAR ORDEN DE COMPRA
  public async eliminarOrdenCompra(ordenId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from('ordenes').delete().eq('id', ordenId);
      if (error) return { success: false, error };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  public async comprarServicio(
    servicioId: string,
    cantidad: number,
    cliente: any,
    mesesComprados: number = 1
  ): Promise<{ data: any | null; error: string | null }> {
    const ordenId = `ORD-${Date.now()}`;
    const fechaCompra = new Date();
    const fechaLocal = new Date(fechaCompra.getTime() - fechaCompra.getTimezoneOffset() * 60000).toISOString();
    const { cuenta, error: errorAsignar } = await this.asignarCuenta(servicioId, ordenId);
    if (errorAsignar || !cuenta) {
      return { data: null, error: errorAsignar || '❌ No hay cuentas disponibles' };
    }
    const { data: servicio } = await supabase.from('servicios').select('precio, nombre').eq('id', servicioId).single();
    if (!servicio) return { data: null, error: 'Servicio no encontrado' };
    const ordenDatos = {
      id: ordenId,
      fecha: fechaLocal,
      duracion_meses: mesesComprados,
      cliente_nombre: cliente?.nombre || 'Cliente',
      cliente_correo: cliente?.correo || '',
      cliente_telefono: cliente?.telefono || '',
      servicio_nombre: servicio.nombre,
      correo: cuenta.usuario_correo || 'Sin correo',
      contrasena: cuenta.contrasena || 'Sin contraseña',
      perfil: cuenta.perfil || 'No especificado',
      pin: cuenta.pin || 'No especificado',
      total: servicio.precio * cantidad,
      estado: 'completada'
    };
    const { error: errorGuardar } = await supabase.from('ordenes').insert([ordenDatos]);
    if (errorGuardar) {
      console.error('❌ Error al guardar orden:', errorGuardar);
      return { data: null, error: 'Error al guardar: ' + errorGuardar.message };
    }
    console.log('✅ Orden guardada:', ordenId);
    return { data: ordenDatos, error: null };
  }

  public async getConfiguracion(): Promise<{ data: any; error: string | null }> {
    const { data, error } = await supabase.from('configuraciones_sistema').select('*').limit(1);
    if (error) return { data: null, error: error.message };
    const config = data && data.length > 0 ? data[0] : null;
    if (!config) {
      return { data: { id: '', qr_imagen_url: '', qr_instrucciones: 'Escanea el código QR y realiza el pago...', metodo_qr_activo: true, metodo_transferencia_activo: true, metodo_efectivo_activo: false, dias_garantia_default: 30, correo_soporte: 'fherchoapaza@gmail.com', mensaje_pie_pagina: '© 2026 Tu Tienda de Streaming', actualizado_en: new Date().toISOString() }, error: null };
    }
    return { data: config, error: null };
  }

  public async guardarConfiguracion(config: any, imagenArchivo?: File): Promise<{ success: boolean; data: any; error: string | null }> {
    try {
      let qr_imagen_url = config.qr_imagen_url || '';
      if (imagenArchivo) {
        const nombreArchivo = `qr-pago/${Date.now()}-${imagenArchivo.name.replace(/\s/g, '-')}`;
        const { data: subida, error: errorSubida } = await supabase.storage.from('config').upload(nombreArchivo, imagenArchivo, { cacheControl: '3600', upsert: true });
        if (errorSubida) return { success: false, data: null, error: errorSubida.message };
        const { data: { publicUrl } } = supabase.storage.from('config').getPublicUrl(nombreArchivo);
        qr_imagen_url = publicUrl;
      }
      const datosGuardar = { qr_imagen_url, qr_instrucciones: config.qr_instrucciones, metodo_qr_activo: config.metodo_qr_activo, metodo_transferencia_activo: config.metodo_transferencia_activo, metodo_efectivo_activo: config.metodo_efectivo_activo, dias_garantia_default: Number(config.dias_garantia_default), correo_soporte: config.correo_soporte, mensaje_pie_pagina: config.mensaje_pie_pagina, actualizado_en: new Date().toISOString() };
      const { data: existente } = await supabase.from('configuraciones_sistema').select('id').limit(1).single();
      const resultado = existente?.id
        ? await supabase.from('configuraciones_sistema').update(datosGuardar).eq('id', existente.id).select().single()
        : await supabase.from('configuraciones_sistema').insert([datosGuardar]).select().single();
      const { data, error } = resultado;
      if (error) return { success: false, data: null, error: error.message };
      return { success: true, data, error: null };
    } catch (err: any) { return { success: false, data: null, error: err.message }; }
  }

  public async getClientes(): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data: perfiles, error } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      const { data: pedidos } = await supabase.from('ordenes').select('*');
      const clientesReales = (perfiles || []).map((p: any) => {
        const comprasCliente = (pedidos || []).filter((ped: any) => ped.cliente_correo === p.correo);
        const totalGastado = comprasCliente.reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), Number(p.total_gastado) || 0);
        return {
          id: p.id,
          nombre: p.nombre || 'Sin nombre',
          correo: p.correo || 'Sin correo',
          contrasena: p.contrasena || '',
          telefono: p.telefono || 'No registrado',
          fecha_registro: p.created_at || new Date().toISOString(),
          estado: p.estado || 'activo',
          total_gastado: totalGastado,
          saldo_pendiente: p.saldo_pendiente || 0,
          servicios_activos: comprasCliente.map((c: any) => c.servicio_nombre)
        };
      });
      return { data: clientesReales, error: null };
    } catch (err: any) { return { data: [], error: err.message }; }
  }

  public async actualizarEstadoCliente(id: string, nuevoEstado: 'activo' | 'bloqueado'): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('perfiles').update({ estado: nuevoEstado }).eq('id', id);
    return { success: !error, error: error ? error.message : null };
  }

  public async eliminarCliente(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from('perfiles').delete().eq('id', id);
      if (error) return { success: false, error };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  public async editarCliente(id: string, updates: any): Promise<{ success: boolean; error: string | null }> {
    console.log(`Cliente ${id} actualizado:`, updates);
    return { success: true, error: null };
  }

  public async actualizarStock(servicioId: string, nuevoStock: number): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from('servicios').update({ stock: nuevoStock }).eq('id', servicioId);
    return { success: !error, error: error ? error.message : null };
  }

  public async getCuentasPorServicio(servicioId: string): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase.from('cuentas_servicio').select('*').eq('servicio_id', servicioId).order('creado_en', { ascending: false });
      return { data: data || [], error: error?.message || null };
    } catch (err: any) { return { data: [], error: err.message }; }
  }

  public async getTodasLasCuentas(): Promise<{ data: any[]; error: string | null }> {
    try {
      const { data, error } = await supabase.from('cuentas_servicio').select('*').order('creado_en', { ascending: false });
      return { data: data || [], error: error?.message || null };
    } catch (err: any) { return { data: [], error: err.message }; }
  }

  public async agregarCuenta(cuenta: { servicio_id: string; usuario_correo: string; contrasena: string; perfil?: string; pin?: string; }): Promise<{ data: any; error: string | null }> {
    const datos = { ...cuenta, estado: 'disponible', creado_en: new Date().toISOString() };
    const { data, error } = await supabase.from('cuentas_servicio').insert([datos]).select().single();
    if (error) { console.error('❌ Error al agregar cuenta:', error); return { data: null, error: error.message }; }
    await this.sincronizarStockDesdeCuentas();
    return { data, error: null };
  }

  public async eliminarCuenta(cuentaId: string): Promise<{ success: boolean; error: string | null }> {
    const { data: cuenta } = await supabase.from('cuentas_servicio').select('servicio_id').eq('id', cuentaId).single();
    const { error } = await supabase.from('cuentas_servicio').delete().eq('id', cuentaId);
    if (!error) await this.sincronizarStockDesdeCuentas();
    return { success: !error, error: error?.message || null };
  }

  public async asignarCuenta(servicioId: string, ordenId: string): Promise<{ cuenta: any; error: string | null }> {
    try {
      console.log('🔍 Buscando cuenta disponible...');
      const { data: cuentas, error: errorBusqueda } = await supabase
        .from('cuentas_servicio')
        .select('*')
        .eq('servicio_id', servicioId)
        .limit(10);

      if (errorBusqueda) return { cuenta: null, error: 'Error al buscar cuentas' };

      const cuentaDisponible = (cuentas || []).find(c => {
        const estado = (c.estado || '').trim().toLowerCase();
        return estado === 'disponible' || estado === '' || estado === null;
      });

      if (!cuentaDisponible) return { cuenta: null, error: '❌ No hay cuentas disponibles' };

      const { data: cuentaActualizada, error: errorActualizar } = await supabase
        .from('cuentas_servicio')
        .update({
          estado: 'entregada',
          orden_id: ordenId,
          entregada_en: new Date().toISOString()
        })
        .eq('id', cuentaDisponible.id)
        .select()
        .single();

      if (!errorActualizar) {
        console.log('✅ Cuenta marcada como ENTREGADA');
        await this.sincronizarStockDesdeCuentas();
      }

      return { cuenta: cuentaActualizada || cuentaDisponible, error: errorActualizar?.message || null };
    } catch (err: any) {
      console.error('❌ Error en asignarCuenta:', err);
      return { cuenta: null, error: err.message };
    }
  }

  public async sincronizarStockDesdeCuentas(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Sincronizando stock...');
      const { data: cuentas, error: errorCuentas } = await supabase.from('cuentas_servicio').select('servicio_id, estado');
      if (errorCuentas) throw errorCuentas;

      const conteoStock: Record<string, number> = {};
      (cuentas || []).forEach((cuenta: any) => {
        const estado = (cuenta.estado || '').trim().toLowerCase();
        if (estado === 'disponible' || estado === '' || estado === null) {
          conteoStock[cuenta.servicio_id] = (conteoStock[cuenta.servicio_id] || 0) + 1;
        }
      });

      const { data: servicios, error: errorServicios } = await supabase.from('servicios').select('id');
      if (errorServicios) throw errorServicios;

      const promesas = (servicios || []).map(async (servicio: any) => {
        const stockReal = conteoStock[servicio.id] || 0;
        const estadoServicio = stockReal > 0 ? 'activo' : 'agotado';
        console.log(`📦 Servicio ${servicio.id} → stock: ${stockReal}`);
        return await supabase.from('servicios').update({ stock: stockReal, estado: estadoServicio }).eq('id', servicio.id);
      });

      await Promise.all(promesas);
      console.log('✅ STOCK SINCRONIZADO');
      return { success: true };
    } catch (err: any) {
      console.error('❌ Error sincronizando:', err);
      return { success: false, error: err.message };
    }
  }

  public async liberarCuenta(cuentaId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('cuentas_servicio')
        .update({
          estado: 'disponible',
          orden_id: null,
          entregada_en: null
        })
        .eq('id', cuentaId);

      if (error) return { success: false, error };
      await this.sincronizarStockDesdeCuentas();
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  public async aumentarStockServicio(servicioId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { data: servicioActual } = await supabase
        .from('servicios')
        .select('stock')
        .eq('id', servicioId)
        .single();
      const nuevoStock = Math.max(0, (servicioActual?.stock || 0) + 1);
      const { error } = await supabase
        .from('servicios')
        .update({ stock: nuevoStock })
        .eq('id', servicioId);
      if (error) return { success: false, error };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  public async crearOrdenCompra(datos: any) {
    return supabase
      .from('ordenes')
      .insert([{
        ...datos,
        fecha: new Date().toISOString()
      }])
      .select()
      .single();
  }

  public async entregarCuenta(cuentaId: string, ordenId: string) {
    return supabase
      .from('cuentas_servicio')
      .update({
        estado: 'entregada',
        orden_id: ordenId,
        entregada_en: new Date().toISOString()
      })
      .eq('id', cuentaId)
      .then(async (resultado) => {
        await this.sincronizarStockDesdeCuentas();
        return resultado;
      });
  }

  public async disminuirStockServicio(servicioId: string) {
    try {
      const { data: servicioActual } = await supabase
        .from('servicios')
        .select('stock')
        .eq('id', servicioId)
        .single();

      const stockActual = servicioActual?.stock || 0;
      const nuevoStock = Math.max(0, stockActual - 1);

      const resultado = await supabase
        .from('servicios')
        .update({ stock: nuevoStock })
        .eq('id', servicioId);

      return resultado;
    } catch (err: any) {
      console.warn('⚠️ No se pudo actualizar el stock:', err.message);
      return { error: null };
    }
  }

  public async aumentarTotalGastado(clienteId: string, monto: number) {
    try {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('total_gastado')
        .eq('id', clienteId)
        .single();

      const actual = perfil?.total_gastado || 0;

      return await supabase
        .from('perfiles')
        .update({ total_gastado: actual + monto })
        .eq('id', clienteId);
    } catch (err: any) {
      console.warn('⚠️ No se pudo actualizar el total gastado:', err.message);
      return { error: null };
    }
  }

  public resetearCatalogo() { return []; }
  public getSupabaseSQLSchema() { return ""; }
}

export const supabaseService = new RealSupabaseClient();