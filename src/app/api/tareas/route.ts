import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const etapa = searchParams.get('etapa')
    const responsable = searchParams.get('responsable')

    const tareas = await db.tarea.findMany({
      where: {
        ...(estado && estado !== 'ALL' ? { estado } : {}),
        ...(etapa && etapa !== 'ALL' ? { etapa } : {}),
        ...(responsable && responsable !== 'ALL' ? { responsable } : {}),
      },
      include: {
        proyecto: { include: { contacto: true } },
        responsable_user: true,
      },
      orderBy: [{ fechaLimite: 'asc' }],
    })

    return NextResponse.json({ tareas })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tareas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.tarea.count({ where: { proyectoId: body.proyectoId } })
    const codigo = `TAR-${String(count + 1).padStart(2, '0')}`

    const tarea = await db.tarea.create({
      data: {
        codigo,
        proyectoId: body.proyectoId,
        nombre: body.nombre,
        etapa: body.etapa || 'Preproducción',
        responsable: body.responsable || null,
        responsableId: body.responsableId || null,
        fechaLimite: body.fechaLimite ? new Date(body.fechaLimite) : null,
        estado: 'PENDIENTE',
        prioridad: body.prioridad || 'MEDIA',
      },
    })

    return NextResponse.json({ tarea })
  } catch (error) {
    console.error('Error creating tarea:', error)
    return NextResponse.json({ error: 'Failed to create tarea' }, { status: 500 })
  }
}

// PATCH para actualizar estado de tarea (check-in/out completado)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, estado, fechaCompletada } = body

    const tarea = await db.tarea.update({
      where: { id },
      data: {
        estado,
        fechaCompletada: fechaCompletada ? new Date(fechaCompletada) : (estado === 'COMPLETADA' ? new Date() : null),
      },
    })

    return NextResponse.json({ tarea })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tarea' }, { status: 500 })
  }
}
