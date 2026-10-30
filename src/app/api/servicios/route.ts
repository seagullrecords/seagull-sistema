import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const servicios = await db.servicio.findMany({
      orderBy: { precioBase: 'asc' },
      include: { _count: { select: { cotizacionItems: true } } },
    })
    return NextResponse.json({ servicios })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch servicios' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.servicio.count()
    const codigo = `SRV-${String(count + 1).padStart(3, '0')}`

    const servicio = await db.servicio.create({
      data: {
        codigo,
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        unidad: body.unidad || 'Canción',
        precioBase: Number(body.precioBase),
        igv: body.igv || 0.18,
        tiempoEstimado: body.tiempoEstimado || null,
        activo: body.activo !== false,
      },
    })

    return NextResponse.json({ servicio })
  } catch (error) {
    console.error('Error creating servicio:', error)
    return NextResponse.json({ error: 'Failed to create servicio' }, { status: 500 })
  }
}
