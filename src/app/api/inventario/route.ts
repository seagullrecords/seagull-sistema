import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const estado = searchParams.get('estado')

    const items = await db.inventarioItem.findMany({
      where: {
        ...(categoria && categoria !== 'ALL' ? { categoria } : {}),
        ...(estado && estado !== 'ALL' ? { estado } : {}),
      },
      include: {
        prestamos: { where: { estado: 'ACTIVO' }, take: 1 },
        mantenimientos: { orderBy: { fechaInicio: 'desc' }, take: 1 },
      },
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventario' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.inventarioItem.count()
    const codigo = `INV-${String(count + 1).padStart(3, '0')}`

    const item = await db.inventarioItem.create({
      data: {
        codigo,
        nombre: body.nombre,
        categoria: body.categoria || 'OTRO',
        marca: body.marca || null,
        modelo: body.modelo || null,
        numeroSerie: body.numeroSerie || null,
        estado: body.estado || 'DISPONIBLE',
        ubicacion: body.ubicacion || null,
        fechaAdquisicion: body.fechaAdquisicion ? new Date(body.fechaAdquisicion) : null,
        valorCompra: body.valorCompra ? Number(body.valorCompra) : null,
        notas: body.notas || null,
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error creating inventario item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}
