import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cotizaciones
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const cotizaciones = await db.cotizacion.findMany({
      where: {
        ...(estado && estado !== 'ALL' ? { estado } : {}),
      },
      include: {
        contacto: true,
        items: { include: { servicio: true } },
        proyecto: true,
      },
      orderBy: { fechaEmision: 'desc' },
    })

    return NextResponse.json({ cotizaciones })
  } catch (error) {
    console.error('Error fetching cotizaciones:', error)
    return NextResponse.json({ error: 'Failed to fetch cotizaciones' }, { status: 500 })
  }
}

// POST /api/cotizaciones - crear nueva cotización
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generar código automático
    const year = new Date().getFullYear()
    const count = await db.cotizacion.count({ where: { codigo: { startsWith: `COT-${year}-` } } })
    const codigo = `COT-${year}-${String(count + 1).padStart(3, '0')}`

    // Calcular totales
    const items = body.items || []
    const subtotal = items.reduce((s: number, it: any) => s + (it.cantidad * it.precioUnitario - (it.descuento || 0)), 0)
    const igvRate = 0.18
    const igv = subtotal * igvRate
    const total = subtotal + igv

    const contacto = await db.contacto.findUnique({ where: { id: body.contactoId } })
    if (!contacto) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    const cotizacion = await db.cotizacion.create({
      data: {
        codigo,
        contactoId: body.contactoId,
        nombreCliente: body.nombreCliente || contacto.nombre,
        fechaEmision: new Date(),
        fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal,
        igv,
        total,
        estado: 'BORRADOR',
        creadoPor: body.creadoPor || 'Sistema',
        observaciones: body.observaciones || null,
        items: {
          create: items.map((it: any) => ({
            servicioId: it.servicioId || null,
            descripcion: it.descripcion,
            cantidad: Number(it.cantidad),
            unidad: it.unidad || 'Canción',
            precioUnitario: Number(it.precioUnitario),
            descuento: Number(it.descuento || 0),
            subtotal: Number(it.cantidad) * Number(it.precioUnitario) - Number(it.descuento || 0),
          })),
        },
      },
      include: { items: true },
    })

    // Crear actividad
    await db.actividad.create({
      data: {
        tipo: 'COTIZACION',
        contactoId: body.contactoId,
        titulo: `Nueva cotización: ${codigo}`,
        descripcion: `${formatCurrency(subtotal)} subtotal · ${items.length} items`,
        severidad: 'INFO',
      },
    })

    return NextResponse.json({ cotizacion })
  } catch (error) {
    console.error('Error creating cotizacion:', error)
    return NextResponse.json({ error: 'Failed to create cotizacion' }, { status: 500 })
  }
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)
}
