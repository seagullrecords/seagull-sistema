import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/credenciales
export async function GET() {
  try {
    const credenciales = await db.credencial.findMany({
      orderBy: { servicio: 'asc' },
    })

    // Enmascarar datos sensibles antes de devolver
    return NextResponse.json({
      credenciales: credenciales.map((c) => {
        const datos = c.datos ? JSON.parse(c.datos) : {}
        // Enmascarar secretos parcialmente
        const masked: any = {}
        Object.keys(datos).forEach((k) => {
          const v = datos[k]
          if (typeof v === 'string' && v.length > 0 && (k.toLowerCase().includes('secret') || k.toLowerCase().includes('token') || k.toLowerCase().includes('password'))) {
            masked[k] = v.substring(0, 4) + '••••••••' + (v.length > 8 ? v.substring(v.length - 4) : '')
            masked[`${k}_set`] = true
          } else if (typeof v === 'object' && v !== null) {
            masked[k] = {}
            Object.keys(v).forEach((sub) => {
              const sv = (v as any)[sub]
              masked[k][sub] = typeof sv === 'string' && sv.length > 0 ? `${sv.substring(0, 2)}••` : sv
              masked[k][`${sub}_set`] = !!sv
            })
          } else {
            masked[k] = v
            masked[`${k}_set`] = !!v
          }
        })
        return {
          id: c.id,
          servicio: c.servicio,
          activo: c.activo,
          ultimaConexion: c.ultimaConexion,
          notas: c.notas,
          datos: masked,
        }
      }),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch credenciales' }, { status: 500 })
  }
}

// POST - guardar credenciales
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { servicio, datos } = body

    const credencial = await db.credencial.upsert({
      where: { servicio },
      update: {
        datos: JSON.stringify(datos),
        activo: true,
        notas: body.notas,
      },
      create: {
        servicio,
        datos: JSON.stringify(datos),
        activo: true,
        notas: body.notas,
      },
    })

    return NextResponse.json({ credencial, ok: true })
  } catch (error) {
    console.error('Error saving credenciales:', error)
    return NextResponse.json({ error: 'Failed to save credenciales' }, { status: 500 })
  }
}

// DELETE - eliminar credencial
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const servicio = searchParams.get('servicio')

    if (!servicio) return NextResponse.json({ error: 'servicio required' }, { status: 400 })

    await db.credencial.update({
      where: { servicio },
      data: { activo: false, datos: '{}' },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
