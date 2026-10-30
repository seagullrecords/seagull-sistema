import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/proyectos/[id] - detalle de un proyecto con tareas
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const proyecto = await db.proyecto.findUnique({
      where: { id },
      include: {
        contacto: true,
        cotizacion: { include: { items: { include: { servicio: true } } } },
        contratos: true,
        tareas: {
          orderBy: [{ orden: 'asc' }],
        },
      },
    })

    if (!proyecto) {
      return NextResponse.json({ error: 'Proyecto not found' }, { status: 404 })
    }

    return NextResponse.json({ proyecto })
  } catch (error) {
    console.error('Error fetching proyecto:', error)
    return NextResponse.json({ error: 'Failed to fetch proyecto' }, { status: 500 })
  }
}
