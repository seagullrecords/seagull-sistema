import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/contactos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const estado = searchParams.get('estado')

    const contactos = await db.contacto.findMany({
      where: {
        ...(tipo && tipo !== 'ALL' ? { tipo } : {}),
        ...(estado && estado !== 'ALL' ? { estado } : {}),
      },
      include: {
        _count: {
          select: { proyectos: true, cotizaciones: true, contratos: true },
        },
      },
      orderBy: { fechaRegistro: 'desc' },
    })

    return NextResponse.json({ contactos })
  } catch (error) {
    console.error('Error fetching contactos:', error)
    return NextResponse.json({ error: 'Failed to fetch contactos' }, { status: 500 })
  }
}

// POST /api/contactos - crear nuevo contacto
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generar código automático
    const year = new Date().getFullYear()
    const prefix = body.tipo === 'BANDA' ? 'B' : body.tipo === 'MANAGER' ? 'C' : body.tipo === 'PRODUCTOR' ? 'C' : body.tipo === 'SELLO' ? 'C' : 'C'
    const count = await db.contacto.count({ where: { codigo: { startsWith: `${prefix}-${year}-` } } })
    const codigo = `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`

    const contacto = await db.contacto.create({
      data: {
        codigo,
        nombre: body.nombre,
        dniRuc: body.dniRuc || null,
        email: body.email || null,
        emailAlterno: body.emailAlterno || null,
        telefono: body.telefono || null,
        tipo: body.tipo || 'SOLISTA',
        origen: body.origen || 'Web',
        estado: body.estado || 'PROSPECTO',
        estadoContractual: body.estadoContractual || null,
        observaciones: body.observaciones || null,
      },
    })

    // Crear actividad
    await db.actividad.create({
      data: {
        tipo: 'NOTA',
        contactoId: contacto.id,
        titulo: `Nuevo contacto: ${contacto.nombre}`,
        descripcion: `Registrado como ${body.tipo} · ${codigo}`,
        severidad: 'INFO',
      },
    })

    return NextResponse.json({ contacto })
  } catch (error) {
    console.error('Error creating contacto:', error)
    return NextResponse.json({ error: 'Failed to create contacto' }, { status: 500 })
  }
}
