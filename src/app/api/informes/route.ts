import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/informes - lista de informes mensuales
export async function GET() {
  try {
    const informes = await db.informeMensual.findMany({
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    })

    return NextResponse.json({
      informes: informes.map((i) => ({
        ...i,
        datos: i.datosJson ? JSON.parse(i.datosJson) : null,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch informes' }, { status: 500 })
  }
}

// POST - generar o regenerar informe de un mes específico
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mes = Number(body.mes) || new Date().getMonth() + 1
    const anio = Number(body.anio) || new Date().getFullYear()

    // Recopilar todos los datos del mes
    const inicioMes = new Date(anio, mes - 1, 1)
    const finMes = new Date(anio, mes, 1)

    const [ingresos, egresos, proyectos, tareas, contactos] = await Promise.all([
      db.ingreso.findMany({ where: { fecha: { gte: inicioMes, lt: finMes } }, include: { contacto: true } }),
      db.egreso.findMany({ where: { fecha: { gte: inicioMes, lt: finMes } } }),
      db.proyecto.findMany(),
      db.tarea.findMany({ where: { createdAt: { gte: inicioMes, lt: finMes } } }),
      db.contacto.findMany(),
    ])

    const totalIngresos = ingresos.filter(i => i.estado === 'CONFIRMADO').reduce((s, i) => s + i.monto, 0)
    const totalEgresos = egresos.filter(e => e.estado === 'CONFIRMADO').reduce((s, e) => s + e.monto, 0)

    const egresosPorCategoria: Record<string, number> = {}
    egresos.filter(e => e.estado === 'CONFIRMADO').forEach((e) => {
      egresosPorCategoria[e.categoria] = (egresosPorCategoria[e.categoria] || 0) + e.monto
    })

    const topIngresos = ingresos
      .filter(i => i.estado === 'CONFIRMADO')
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10)
      .map(i => ({ concepto: i.concepto, monto: i.monto, contacto: i.contacto?.nombre }))

    const datosInforme = {
      periodo: { mes, anio, mesNombre: new Date(anio, mes - 1).toLocaleDateString('es-PE', { month: 'long' }) },
      empresa: {
        nombre: 'SEAGULL RECORDS S.A.C.',
        ruc: '20612281352',
        direccion: 'Jr. Ferrocarril 151 Mz. A Lte. 10 P. Joven Bolívar Alto, Chimbote, Áncash, Perú',
        email: 'seagull.records.99@gmail.com',
        telefono: '910 216 278',
      },
      resumen: {
        totalIngresos,
        totalEgresos,
        utilidadNeta: totalIngresos - totalEgresos,
        margenUtilidad: totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0,
      },
      proyectos: {
        activos: proyectos.filter(p => p.estadoGeneral === 'ACTIVO').length,
        entregados: proyectos.filter(p => p.estadoGeneral === 'ENTREGADO').length,
        total: proyectos.length,
      },
      tareas: {
        pendientes: tareas.filter(t => t.estado === 'PENDIENTE').length,
        completadas: tareas.filter(t => t.estado === 'COMPLETADA').length,
        total: tareas.length,
      },
      contactos: {
        activos: contactos.filter(c => c.estado === 'CLIENTE_ACTIVO').length,
        total: contactos.length,
      },
      topIngresos,
      egresosPorCategoria,
    }

    const informe = await db.informeMensual.upsert({
      where: { mes_anio: { mes, anio } },
      update: { datosJson: JSON.stringify(datosInforme), estado: 'GENERADO' },
      create: {
        mes, anio,
        datosJson: JSON.stringify(datosInforme),
        estado: 'GENERADO',
      },
    })

    return NextResponse.json({ informe: { ...informe, datos: datosInforme } })
  } catch (error) {
    console.error('Error generando informe:', error)
    return NextResponse.json({ error: 'Failed to generate informe' }, { status: 500 })
  }
}
