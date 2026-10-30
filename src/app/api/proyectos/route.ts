import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/proyectos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estadoFlujo = searchParams.get('estadoFlujo')
    const estadoGeneral = searchParams.get('estadoGeneral')

    const proyectos = await db.proyecto.findMany({
      where: {
        ...(estadoFlujo && estadoFlujo !== 'ALL' ? { estadoFlujo } : {}),
        ...(estadoGeneral && estadoGeneral !== 'ALL' ? { estadoGeneral } : {}),
      },
      include: {
        contacto: true,
        cotizacion: true,
        contratos: true,
        _count: { select: { tareas: true } },
        tareas: {
          where: { estado: 'PENDIENTE' },
          take: 3,
          orderBy: { fechaLimite: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ proyectos })
  } catch (error) {
    console.error('Error fetching proyectos:', error)
    return NextResponse.json({ error: 'Failed to fetch proyectos' }, { status: 500 })
  }
}

// POST /api/proyectos - crear nuevo proyecto + generar tareas automáticamente
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generar código automático
    const year = new Date().getFullYear()
    const count = await db.proyecto.count({ where: { codigo: { startsWith: `PRY-${year}-` } } })
    const codigo = `PRY-${year}-${String(count + 1).padStart(3, '0')}`

    const fechaInicio = body.fechaInicio ? new Date(body.fechaInicio) : new Date()
    const fechaEntregaEstimada = body.fechaEntregaEstimada ? new Date(body.fechaEntregaEstimada) : null

    const proyecto = await db.proyecto.create({
      data: {
        codigo,
        contactoId: body.contactoId,
        nombreArtista: body.nombreArtista,
        nombreProyecto: body.nombreProyecto,
        tipoProyecto: body.tipoProyecto || 'PRODUCCION_MUSICAL',
        estadoFlujo: 'PREPRODUCCION',
        estadoGeneral: 'ACTIVO',
        fechaInicio,
        fechaEntregaEstimada,
        responsable: body.responsable || null,
        urlCarpetaDrive: body.urlCarpetaDrive || null,
        observaciones: body.observaciones || null,
        cotizacionId: body.cotizacionId || null,
      },
    })

    // Generar tareas automáticamente según número de canciones
    const numCanciones = Number(body.numCanciones) || 1
    const WORKFLOW = [
      { nombre: 'Reunión de Briefing y Documentación', etapa: 'Preproducción', responsable: 'Oseías', diasOffset: 0 },
      { nombre: 'Planificación de Arreglos y Cronograma', etapa: 'Preproducción', responsable: 'Oseías', diasOffset: 1 },
      { nombre: 'Preproducción Musical', etapa: 'Preproducción', responsable: 'Caleb', diasOffset: 2 },
      { nombre: 'Grabación de Voces e Instrumentos', etapa: 'Grabación', responsable: 'Aarón', diasOffset: 4 },
      { nombre: 'Edición y Afinación', etapa: 'Edición', responsable: 'Caleb', diasOffset: 6 },
      { nombre: 'Mezcla', etapa: 'Mezcla', responsable: 'Aarón', diasOffset: 9 },
      { nombre: 'Masterización', etapa: 'Masterización', responsable: 'Caleb', diasOffset: 12 },
      { nombre: 'Revisión y Gestión con el Cliente', etapa: 'Revisión', responsable: 'Martha', diasOffset: 14 },
      { nombre: 'Aprobación Final y Entrega', etapa: 'Entrega', responsable: 'Martha', diasOffset: 16 },
    ]

    const users = await db.user.findMany()
    let orden = 0
    for (let cancion = 1; cancion <= numCanciones; cancion++) {
      for (const tarea of WORKFLOW) {
        const fechaLimite = new Date(fechaInicio)
        fechaLimite.setDate(fechaLimite.getDate() + (cancion - 1) * 20 + tarea.diasOffset)
        const responsableUser = users.find(u => u.name === tarea.responsable)
        const codigoTarea = `TAR${year}${String(count + 1).padStart(3, '0')}C${String(cancion).padStart(2, '0')}T${String(orden + 1).padStart(2, '0')}`

        await db.tarea.create({
          data: {
            codigo: codigoTarea,
            proyectoId: proyecto.id,
            nombre: `Canción ${cancion}: ${tarea.nombre}`,
            etapa: tarea.etapa,
            responsable: tarea.responsable,
            responsableId: responsableUser?.id,
            fechaLimite,
            estado: 'PENDIENTE',
            prioridad: 'ALTA',
            orden,
          },
        })
        orden++
      }
    }

    // Crear actividad
    await db.actividad.create({
      data: {
        tipo: 'PROYECTO',
        contactoId: body.contactoId,
        proyectoId: proyecto.id,
        titulo: `Nuevo proyecto: ${codigo}`,
        descripcion: `${body.nombreProyecto} · ${body.nombreArtista} · ${numCanciones * 9} tareas auto-generadas`,
        severidad: 'SUCCESS',
      },
    })

    return NextResponse.json({ proyecto, tareasGeneradas: numCanciones * 9 })
  } catch (error) {
    console.error('Error creating proyecto:', error)
    return NextResponse.json({ error: 'Failed to create proyecto' }, { status: 500 })
  }
}
