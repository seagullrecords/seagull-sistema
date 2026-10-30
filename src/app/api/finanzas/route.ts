import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [ingresos, egresos] = await Promise.all([
      db.ingreso.findMany({
        include: { contacto: true, proyecto: true },
        orderBy: { fecha: 'desc' },
      }),
      db.egreso.findMany({ orderBy: { fecha: 'desc' } }),
    ])

    const totalIngresos = ingresos.filter(i => i.estado === 'CONFIRMADO').reduce((s, i) => s + i.monto, 0)
    const totalEgresos = egresos.filter(e => e.estado === 'CONFIRMADO').reduce((s, e) => s + e.monto, 0)
    const pendientesCobrar = ingresos.filter(i => i.estado === 'PENDIENTE').reduce((s, i) => s + i.monto, 0)

    const porMetodo: Record<string, number> = {}
    ingresos.filter(i => i.estado === 'CONFIRMADO' && i.metodo).forEach((i) => {
      porMetodo[i.metodo!] = (porMetodo[i.metodo!] || 0) + i.monto
    })

    const egresosPorCategoria: Record<string, number> = {}
    egresos.filter(e => e.estado === 'CONFIRMADO').forEach((e) => {
      egresosPorCategoria[e.categoria] = (egresosPorCategoria[e.categoria] || 0) + e.monto
    })

    return NextResponse.json({
      ingresos,
      egresos,
      summary: {
        totalIngresos,
        totalEgresos,
        utilidadNeta: totalIngresos - totalEgresos,
        pendientesCobrar,
        margenUtilidad: totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0,
      },
      porMetodo: Object.entries(porMetodo).map(([m, v]) => ({ metodo: m, monto: v })),
      egresosPorCategoria: Object.entries(egresosPorCategoria).map(([c, v]) => ({ categoria: c, monto: v })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch finanzas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Detectar si es ingreso o egreso
    if (body.tipo === 'EGRESO') {
      const year = new Date().getFullYear()
      const count = await db.egreso.count({ where: { codigo: { startsWith: `EGR-${year}-` } } })
      const codigo = `EGR-${year}-${String(count + 1).padStart(3, '0')}`

      const egreso = await db.egreso.create({
        data: {
          codigo,
          categoria: body.categoria || 'OTROS',
          concepto: body.concepto,
          monto: Number(body.monto),
          fecha: body.fecha ? new Date(body.fecha) : new Date(),
          proveedor: body.proveedor || null,
          metodo: body.metodo || null,
          comprobante: body.comprobante || null,
          estado: body.estado || 'CONFIRMADO',
          observaciones: body.observaciones || null,
        },
      })

      await db.actividad.create({
        data: {
          tipo: 'FINANZA',
          titulo: `Nuevo egreso: ${codigo}`,
          descripcion: `${body.concepto} · S/. ${body.monto}`,
          severidad: 'INFO',
        },
      })

      return NextResponse.json({ egreso })
    } else {
      // INGRESO
      const year = new Date().getFullYear()
      const count = await db.ingreso.count({ where: { codigo: { startsWith: `ING-${year}-` } } })
      const codigo = `ING-${year}-${String(count + 1).padStart(3, '0')}`

      const ingreso = await db.ingreso.create({
        data: {
          codigo,
          contactoId: body.contactoId || null,
          proyectoId: body.proyectoId || null,
          concepto: body.concepto,
          monto: Number(body.monto),
          fecha: body.fecha ? new Date(body.fecha) : new Date(),
          metodo: body.metodo || null,
          comprobante: body.comprobante || null,
          estado: body.estado || 'CONFIRMADO',
          observaciones: body.observaciones || null,
        },
      })

      await db.actividad.create({
        data: {
          tipo: 'FINANZA',
          contactoId: body.contactoId || null,
          proyectoId: body.proyectoId || null,
          titulo: `Nuevo ingreso: ${codigo}`,
          descripcion: `${body.concepto} · S/. ${body.monto}`,
          severidad: 'SUCCESS',
        },
      })

      return NextResponse.json({ ingreso })
    }
  } catch (error) {
    console.error('Error creating transaccion:', error)
    return NextResponse.json({ error: 'Failed to create transaccion' }, { status: 500 })
  }
}
