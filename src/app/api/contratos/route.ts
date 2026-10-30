import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const contratos = await db.contrato.findMany({
      include: { contacto: true, proyecto: true },
      orderBy: { fechaCreacion: 'desc' },
    })
    return NextResponse.json({ contratos })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contratos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const year = new Date().getFullYear()
    const count = await db.contrato.count({ where: { codigo: { startsWith: `CTR-${year}-` } } })
    const codigo = `CTR-${year}-${String(count + 1).padStart(3, '0')}`

    const montoTotal = Number(body.montoTotal) || 0
    const anticipo = Number(body.anticipo) || 0
    const saldoPendiente = montoTotal - anticipo

    const contrato = await db.contrato.create({
      data: {
        codigo,
        proyectoId: body.proyectoId || null,
        contactoId: body.contactoId,
        nombreArtista: body.nombreArtista,
        nombreProyecto: body.nombreProyecto,
        tipoContrato: body.tipoContrato || 'Sencillo',
        fechaFirma: body.fechaFirma ? new Date(body.fechaFirma) : null,
        montoTotal,
        anticipo,
        saldoPendiente,
        estado: body.estado || 'BORRADOR',
        observaciones: body.observaciones || null,
        urlDocumento: body.urlDocumento || null,
        urlCarpeta: body.urlCarpeta || null,
      },
    })

    return NextResponse.json({ contrato })
  } catch (error) {
    console.error('Error creating contrato:', error)
    return NextResponse.json({ error: 'Failed to create contrato' }, { status: 500 })
  }
}
