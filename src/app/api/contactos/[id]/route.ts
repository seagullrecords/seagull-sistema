import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/contactos/[id] - detalle de un contacto
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contacto = await db.contacto.findUnique({
      where: { id },
      include: {
        cotizaciones: {
          include: { items: true },
          orderBy: { fechaEmision: 'desc' },
        },
        proyectos: {
          include: { cotizacion: true, _count: { select: { tareas: true } } },
          orderBy: { createdAt: 'desc' },
        },
        contratos: {
          orderBy: { fechaCreacion: 'desc' },
        },
        ingresos: {
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    })

    if (!contacto) {
      return NextResponse.json({ error: 'Contacto not found' }, { status: 404 })
    }

    return NextResponse.json({ contacto })
  } catch (error) {
    console.error('Error fetching contacto:', error)
    return NextResponse.json({ error: 'Failed to fetch contacto' }, { status: 500 })
  }
}

// PATCH /api/contactos/[id] - actualizar contacto existente
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que el contacto existe
    const existing = await db.contacto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    // Actualizar solo los campos proporcionados (null significa "dejar vacío")
    const data: any = {}
    if (body.nombre !== undefined) data.nombre = body.nombre
    if (body.dniRuc !== undefined) data.dniRuc = body.dniRuc || null
    if (body.email !== undefined) data.email = body.email || null
    if (body.emailAlterno !== undefined) data.emailAlterno = body.emailAlterno || null
    if (body.telefono !== undefined) data.telefono = body.telefono || null
    if (body.avatar !== undefined) data.avatar = body.avatar || null
    if (body.tipo !== undefined) data.tipo = body.tipo
    if (body.origen !== undefined) data.origen = body.origen || null
    if (body.estado !== undefined) data.estado = body.estado
    if (body.estadoContractual !== undefined) data.estadoContractual = body.estadoContractual || null
    if (body.observaciones !== undefined) data.observaciones = body.observaciones || null

    const updated = await db.contacto.update({
      where: { id },
      data,
    })

    // Registrar actividad
    await db.actividad.create({
      data: {
        tipo: 'NOTA',
        contactoId: id,
        titulo: `Contacto actualizado: ${updated.nombre}`,
        descripcion: `Información de ${updated.codigo} actualizada`,
        severidad: 'INFO',
      },
    })

    return NextResponse.json({ contacto: updated })
  } catch (error) {
    console.error('Error updating contacto:', error)
    return NextResponse.json({ error: 'Failed to update contacto' }, { status: 500 })
  }
}

// DELETE /api/contactos/[id] - eliminar contacto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.contacto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    await db.contacto.delete({ where: { id } })

    return NextResponse.json({ ok: true, message: `Contacto ${existing.codigo} eliminado` })
  } catch (error) {
    console.error('Error deleting contacto:', error)
    return NextResponse.json({ error: 'Failed to delete contacto' }, { status: 500 })
  }
}
