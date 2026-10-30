import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/asistencia - registros de asistencia
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const fecha = searchParams.get('fecha') // YYYY-MM-DD

    const hoy = new Date()
    // Por defecto, últimos 7 días
    const fechaInicio = fecha ? new Date(fecha) : new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fechaFin = fecha ? new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000) : new Date(hoy.getTime() + 24 * 60 * 60 * 1000)

    const registros = await db.registroAsistencia.findMany({
      where: {
        fecha: { gte: fechaInicio, lt: fechaFin },
        ...(userId ? { userId } : {}),
      },
      include: { user: true },
      orderBy: { fecha: 'desc' },
    })

    // Resumen por usuario
    const users = await db.user.findMany({ where: { role: { in: ['ADMIN', 'PRODUCTOR', 'A&R'] } } })
    const resumen = await Promise.all(users.map(async (u) => {
      const userRegistros = registros.filter(r => r.userId === u.id)
      const horasTotales = userRegistros.reduce((s, r) => s + r.horasTrabajadas, 0)
      const activo = userRegistros.find(r => r.estado === 'ACTIVO')
      const completados = userRegistros.filter(r => r.estado === 'COMPLETADO').length
      const ausentes = userRegistros.filter(r => r.estado === 'AUSENTE').length

      return {
        user: { id: u.id, name: u.name, role: u.role, avatar: u.avatar },
        horasTotales: Number(horasTotales.toFixed(2)),
        diasTrabajados: completados,
        diasAusentes: ausentes,
        actualmenteActivo: !!activo,
        checkIn: activo?.checkIn,
      }
    }))

    return NextResponse.json({ registros, resumen })
  } catch (error) {
    console.error('Error fetching asistencia:', error)
    return NextResponse.json({ error: 'Failed to fetch asistencia' }, { status: 500 })
  }
}

// POST - check-in / check-out
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, action } = body // action: 'check-in' | 'check-out'

    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

    if (action === 'check-in') {
      // Buscar registro de hoy o crear nuevo
      const existente = await db.registroAsistencia.findFirst({
        where: { userId, fecha: { gte: inicioHoy } },
      })

      if (existente && existente.checkIn) {
        return NextResponse.json({ error: 'Ya tienes check-in hoy', registro: existente }, { status: 400 })
      }

      const registro = existente
        ? await db.registroAsistencia.update({ where: { id: existente.id }, data: { checkIn: hoy, estado: 'ACTIVO' } })
        : await db.registroAsistencia.create({ data: { userId, fecha: hoy, checkIn: hoy, estado: 'ACTIVO' } })

      return NextResponse.json({ registro, action: 'check-in' })
    }

    if (action === 'check-out') {
      const existente = await db.registroAsistencia.findFirst({
        where: { userId, fecha: { gte: inicioHoy }, estado: 'ACTIVO' },
      })

      if (!existente) {
        return NextResponse.json({ error: 'No hay check-in activo' }, { status: 400 })
      }

      const checkOut = hoy
      const horasTrabajadas = (checkOut.getTime() - (existente.checkIn?.getTime() || hoy.getTime())) / (1000 * 60 * 60)

      const registro = await db.registroAsistencia.update({
        where: { id: existente.id },
        data: {
          checkOut,
          horasTrabajadas: Number(horasTrabajadas.toFixed(2)),
          estado: 'COMPLETADO',
        },
      })

      return NextResponse.json({ registro, action: 'check-out' })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error('Error in asistencia:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
