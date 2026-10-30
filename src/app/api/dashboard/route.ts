import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard - KPIs y datos para el dashboard principal
export async function GET() {
  try {
    const [
      contactos,
      servicios,
      cotizaciones,
      proyectos,
      tareas,
      contratos,
      ingresos,
      egresos,
      eventos,
      actividades,
      integraciones,
      config,
    ] = await Promise.all([
      db.contacto.findMany(),
      db.servicio.findMany({ where: { activo: true } }),
      db.cotizacion.findMany({ include: { contacto: true, items: true } }),
      db.proyecto.findMany({ include: { contacto: true, cotizacion: true } }),
      db.tarea.findMany({ include: { proyecto: true } }),
      db.contrato.findMany({ include: { contacto: true } }),
      db.ingreso.findMany({ include: { contacto: true } }),
      db.egreso.findMany(),
      db.evento.findMany({ include: { contacto: true, proyecto: true } }),
      db.actividad.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { contacto: true, proyecto: true },
      }),
      db.googleIntegration.findMany(),
      db.config.findMany(),
    ])

    // Convertir config a objeto key-value
    const configMap: Record<string, string> = {}
    config.forEach((c) => (configMap[c.key] = c.value))

    // Calcular KPIs
    const totalIngresos = ingresos.filter(i => i.estado === 'CONFIRMADO').reduce((s, i) => s + i.monto, 0)
    const totalEgresos = egresos.filter(e => e.estado === 'CONFIRMADO').reduce((s, e) => s + e.monto, 0)
    const utilidadNeta = totalIngresos - totalEgresos

    // Saldos pendientes (cuentas por cobrar)
    const saldosPendientes = contratos.filter(c => c.estado === 'FIRMADO').reduce((s, c) => s + c.saldoPendiente, 0)
    const contratosConSaldo = contratos.filter(c => c.estado === 'FIRMADO' && c.saldoPendiente > 0)

    // Proyectos activos
    const proyectosActivos = proyectos.filter(p => p.estadoGeneral === 'ACTIVO')
    const proyectosEntregados = proyectos.filter(p => p.estadoGeneral === 'ENTREGADO')

    // Tareas
    const tareasPendientes = tareas.filter(t => t.estado === 'PENDIENTE')
    const hoy = new Date()
    const tareasVencidas = tareasPendientes.filter(t => t.fechaLimite && t.fechaLimite < hoy)
    const tareasEstaSemana = tareasPendientes.filter(t => {
      if (!t.fechaLimite) return false
      const dias = (t.fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      return dias >= 0 && dias <= 7
    })

    // Cotizaciones
    const cotizacionesEnviadas = cotizaciones.filter(c => c.estado === 'ENVIADA')
    const cotizacionesAprobadas = cotizaciones.filter(c => c.estado === 'APROBADA')

    // Datos mensuales (últimos 6 meses)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const monthEnd = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 1)
      const mIng = ingresos.filter(i => i.fecha >= monthStart && i.fecha < monthEnd && i.estado === 'CONFIRMADO').reduce((s, i) => s + i.monto, 0)
      const mEgr = egresos.filter(e => e.fecha >= monthStart && e.fecha < monthEnd && e.estado === 'CONFIRMADO').reduce((s, e) => s + e.monto, 0)
      monthlyData.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'short' }),
        ingresos: Number(mIng.toFixed(2)),
        egresos: Number(mEgr.toFixed(2)),
        utilidad: Number((mIng - mEgr).toFixed(2)),
      })
    }

    // Distribución de ingresos por tipo
    const ingresosPorTipo: Record<string, number> = {}
    ingresos.filter(i => i.estado === 'CONFIRMADO').forEach((i) => {
      const concepto = i.concepto.toLowerCase()
      let tipo = 'OTROS'
      if (concepto.includes('anticipo')) tipo = 'ANTICIPO'
      else if (concepto.includes('saldo')) tipo = 'SALDO'
      else if (concepto.includes('sala')) tipo = 'SALA_ENSAYO'
      else if (concepto.includes('grabación') || concepto.includes('grabacion')) tipo = 'GRABACION'
      ingresosPorTipo[tipo] = (ingresosPorTipo[tipo] || 0) + i.monto
    })
    const ingresosPorTipoData = Object.entries(ingresosPorTipo).map(([tipo, monto]) => ({ tipo, monto: Number(monto.toFixed(2)) }))

    // Egresos por categoría
    const egresosPorCategoria: Record<string, number> = {}
    egresos.filter(e => e.estado === 'CONFIRMADO').forEach((e) => {
      egresosPorCategoria[e.categoria] = (egresosPorCategoria[e.categoria] || 0) + e.monto
    })
    const egresosPorCategoriaData = Object.entries(egresosPorCategoria).map(([cat, monto]) => ({ categoria: cat, monto: Number(monto.toFixed(2)) }))

    // Proyectos por etapa (para kanban)
    const etapas = ['PREPRODUCCION', 'GRABACION', 'EDICION', 'MEZCLA', 'MASTERIZACION', 'REVISION', 'ENTREGA', 'FINALIZADO']
    const proyectosPorEtapa = etapas.map(etapa => ({
      etapa,
      count: proyectosActivos.filter(p => p.estadoFlujo === etapa).length,
      proyectos: proyectosActivos.filter(p => p.estadoFlujo === etapa),
    }))

    // Top contactos por ingresos
    const ingresosPorContacto: Record<string, { nombre: string; codigo: string; total: number; count: number }> = {}
    ingresos.filter(i => i.estado === 'CONFIRMADO' && i.contacto).forEach((i) => {
      const k = i.contactoId!
      if (!ingresosPorContacto[k]) {
        ingresosPorContacto[k] = { nombre: i.contacto!.nombre, codigo: i.contacto!.codigo, total: 0, count: 0 }
      }
      ingresosPorContacto[k].total += i.monto
      ingresosPorContacto[k].count += 1
    })
    const topContactos = Object.values(ingresosPorContacto).sort((a, b) => b.total - a.total).slice(0, 5)

    // Próximos eventos (agenda)
    const proximosEventos = eventos
      .filter(e => e.fechaInicio >= hoy)
      .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime())
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        titulo: e.titulo,
        tipo: e.tipo,
        fechaInicio: e.fechaInicio,
        estado: e.estado,
        contactoNombre: e.contacto?.nombre,
        proyectoNombre: e.proyecto?.nombreProyecto,
      }))

    return NextResponse.json({
      empresa: {
        nombre: configMap['empresa_nombre'] || 'SEAGULL RECORDS',
        ruc: configMap['ruc'],
        direccion: configMap['direccion'],
        telefono: configMap['telefono'],
        email: configMap['email'],
        moneda: configMap['moneda_simbolo'] || 'S/.',
        igv: parseFloat(configMap['igv'] || '0.18'),
      },
      kpis: {
        totalIngresos,
        totalEgresos,
        utilidadNeta,
        saldosPendientes,
        contratosConSaldoCount: contratosConSaldo.length,
        proyectosActivos: proyectosActivos.length,
        proyectosEntregados: proyectosEntregados.length,
        tareasPendientes: tareasPendientes.length,
        tareasVencidas: tareasVencidas.length,
        tareasEstaSemana: tareasEstaSemana.length,
        contactosActivos: contactos.filter(c => c.estado === 'CLIENTE_ACTIVO').length,
        contactosCotizacionEnviada: contactos.filter(c => c.estado === 'COTIZACION_ENVIADA').length,
        cotizacionesEnviadas: cotizacionesEnviadas.length,
        cotizacionesAprobadas: cotizacionesAprobadas.length,
        servicios: servicios.length,
      },
      monthlyData,
      ingresosPorTipo: ingresosPorTipoData,
      egresosPorCategoria: egresosPorCategoriaData,
      proyectosPorEtapa,
      topContactos,
      proximosEventos,
      actividades: actividades.map(a => ({
        id: a.id,
        tipo: a.tipo,
        titulo: a.titulo,
        descripcion: a.descripcion,
        severidad: a.severidad,
        createdAt: a.createdAt,
        contactoNombre: a.contacto?.nombre,
        proyectoNombre: a.proyecto?.nombreProyecto,
      })),
      integraciones: integraciones.map(i => ({
        service: i.service,
        status: i.status,
        lastSync: i.lastSync,
        metadata: i.metadata ? JSON.parse(i.metadata) : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
