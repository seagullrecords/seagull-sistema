import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/equipo - lista de usuarios
export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        contacto: { select: { id: true, nombre: true, codigo: true } },
        _count: { select: { tareasAsignadas: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Para cada usuario, obtener count de tareas pendientes
    const usersWithTareas = await Promise.all(
      users.map(async (u) => {
        const tareasPendientes = await db.tarea.count({
          where: { responsableId: u.id, estado: 'PENDIENTE' },
        })
        const tareasCompletadas = await db.tarea.count({
          where: { responsableId: u.id, estado: 'COMPLETADA' },
        })
        return { ...u, tareasPendientes, tareasCompletadas }
      })
    )

    return NextResponse.json({ users: usersWithTareas })
  } catch (error) {
    console.error('Error fetching equipo:', error)
    return NextResponse.json({ error: 'Failed to fetch equipo' }, { status: 500 })
  }
}
