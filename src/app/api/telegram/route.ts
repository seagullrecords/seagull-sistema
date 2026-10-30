import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/telegram - estado de la integración
export async function GET() {
  try {
    const cred = await db.credencial.findUnique({ where: { servicio: 'TELEGRAM_BOT' } })
    if (!cred) {
      return NextResponse.json({ configured: false, message: 'Bot de Telegram no configurado' })
    }

    const datos = cred.datos ? JSON.parse(cred.datos) : {}
    const chatIds = datos.chatIds || {}
    const configuredUsers = Object.keys(chatIds).filter(k => chatIds[k])

    return NextResponse.json({
      configured: cred.activo && !!datos.botToken,
      botTokenSet: !!datos.botToken,
      chatIds: chatIds,
      configuredUsers,
      grupoEquipo: datos.grupoEquipo || null,
      ultimaConexion: cred.ultimaConexion,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Función helper para enviar mensaje real a Telegram
async function enviarMensajeTelegram(botToken: string, chatId: string, texto: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        parse_mode: 'Markdown',
      }),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error(`[Telegram] Error enviando a ${chatId}:`, data.description)
      return false
    }
    return true
  } catch (error) {
    console.error(`[Telegram] Error de conexión a ${chatId}:`, error)
    return false
  }
}

// POST - enviar mensaje de prueba o recordatorio
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    const cred = await db.credencial.findUnique({ where: { servicio: 'TELEGRAM_BOT' } })
    if (!cred || !cred.activo) {
      return NextResponse.json({ error: 'Telegram no está configurado. Ve a Configuración para activarlo.' }, { status: 400 })
    }

    const datos = JSON.parse(cred.datos)
    const botToken = datos.botToken
    const chatIds = datos.chatIds || {}

    if (!botToken) {
      return NextResponse.json({ error: 'Bot token no configurado' }, { status: 400 })
    }

    let enviados = 0
    let errores = 0
    const resultados: Array<{ destinatario: string; chatId: string; ok: boolean; error?: string }> = []

    if (action === 'probar') {
      const destinatario = body.destinatario || 'grupo'
      let chatId: string

      if (destinatario === 'grupo') {
        chatId = datos.grupoEquipo
      } else {
        chatId = chatIds[destinatario]
      }

      if (!chatId) {
        return NextResponse.json({ error: `No hay chat ID configurado para ${destinatario}` }, { status: 400 })
      }

      const mensaje = `🤖 *SEAGULL RECORDS - Mensaje de prueba*\n\nHola${destinatario !== 'grupo' ? ' ' + destinatario : ' equipo'}!\n\nEste es un mensaje de prueba del sistema de gestión.\n\n✅ Conexión exitosa\n✅ Bot funcionando correctamente\n\n_Hora: ${new Date().toLocaleString('es-PE')}_\n\n_El sistema enviará recordatorios automáticos de tareas vencidas e informes diarios._`

      const ok = await enviarMensajeTelegram(botToken, chatId, mensaje)
      if (ok) {
        enviados = 1
        resultados.push({ destinatario, chatId, ok: true })
      } else {
        errores = 1
        resultados.push({ destinatario, chatId, ok: false, error: 'Error enviando' })
      }
    }

    if (action === 'recordatorio_tareas') {
      // Enviar a cada miembro del equipo sus tareas vencidas
      const hoy = new Date()
      const tareas = await db.tarea.findMany({
        where: { estado: 'PENDIENTE', fechaLimite: { lt: hoy } },
        include: { proyecto: true },
      })

      const porResponsable: Record<string, any[]> = {}
      tareas.forEach((t) => {
        const r = t.responsable || 'Sin asignar'
        if (!porResponsable[r]) porResponsable[r] = []
        porResponsable[r].push(t)
      })

      for (const [responsable, tareasResp] of Object.entries(porResponsable)) {
        const chatId = chatIds[responsable]
        if (!chatId) {
          errores++
          resultados.push({ destinatario: responsable, chatId: '-', ok: false, error: 'Sin chat ID' })
          continue
        }

        const mensaje = `⚠️ *Tareas vencidas - ${responsable}*\n\nTienes ${tareasResp.length} tarea(s) vencida(s):\n\n${tareasResp.slice(0, 5).map((t, i) => `${i + 1}. ${t.nombre}\n   _Proyecto: ${t.proyecto.codigo} - ${t.proyecto.nombreProyecto}_\n   _Vencía: ${new Date(t.fechaLimite!).toLocaleDateString('es-PE')}_`).join('\n\n')}${tareasResp.length > 5 ? `\n\n_...y ${tareasResp.length - 5} más_` : ''}`

        const ok = await enviarMensajeTelegram(botToken, chatId, mensaje)
        if (ok) {
          enviados++
          resultados.push({ destinatario: responsable, chatId, ok: true })
        } else {
          errores++
          resultados.push({ destinatario: responsable, chatId, ok: false, error: 'Error enviando' })
        }
      }

      // También enviar resumen al grupo
      if (datos.grupoEquipo && enviados > 0) {
        const totalVencidas = tareas.length
        const mensajeGrupo = `📊 *Resumen de tareas vencidas*\n\n_${totalVencidas} tareas vencidas en total_\n_Detalles enviados a cada responsable_\n\n_Recuerden actualizar el estado en el sistema_`
        const okGrupo = await enviarMensajeTelegram(botToken, datos.grupoEquipo, mensajeGrupo)
        if (okGrupo) enviados++
      }
    }

    if (action === 'informe_diario') {
      const hoy = new Date()
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
      const [ingresosHoy, tareasHoy, proyectosActivos] = await Promise.all([
        db.ingreso.findMany({ where: { fecha: { gte: inicioHoy }, estado: 'CONFIRMADO' } }),
        db.tarea.findMany({ where: { estado: 'PENDIENTE' } }),
        db.proyecto.findMany({ where: { estadoGeneral: 'ACTIVO' } }),
      ])

      const totalHoy = ingresosHoy.reduce((s, i) => s + i.monto, 0)
      const tareasVencidas = tareasHoy.filter(t => t.fechaLimite && t.fechaLimite < hoy).length

      const mensaje = `📊 *Resumen diario - SEAGULL RECORDS*\n\n_Fecha: ${hoy.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}_\n\n💰 Ingresos hoy: *S/. ${totalHoy.toFixed(2)}*\n📂 Proyectos activos: *${proyectosActivos.length}*\n✅ Tareas pendientes: *${tareasHoy.length}*\n⚠️ Tareas vencidas: *${tareasVencidas}*\n\n_Que tengan un excelente día de trabajo!_ 🎵`

      // Enviar al grupo
      if (datos.grupoEquipo) {
        const okGrupo = await enviarMensajeTelegram(botToken, datos.grupoEquipo, mensaje)
        if (okGrupo) {
          enviados++
          resultados.push({ destinatario: 'grupo', chatId: datos.grupoEquipo, ok: true })
        } else {
          errores++
        }
      }

      // También enviar a cada miembro individual
      for (const [nombre, chatId] of Object.entries(chatIds)) {
        if (!chatId) continue
        const ok = await enviarMensajeTelegram(botToken, chatId as string, mensaje)
        if (ok) {
          enviados++
          resultados.push({ destinatario: nombre, chatId: chatId as string, ok: true })
        } else {
          errores++
        }
      }
    }

    if (action === 'mensaje_personalizado') {
      const { destinatario, mensaje: texto } = body
      const chatId = destinatario === 'grupo' ? datos.grupoEquipo : chatIds[destinatario]

      if (!chatId) {
        return NextResponse.json({ error: `No hay chat ID para ${destinatario}` }, { status: 400 })
      }

      const ok = await enviarMensajeTelegram(botToken, chatId, texto)
      if (ok) {
        enviados = 1
        resultados.push({ destinatario, chatId, ok: true })
      } else {
        errores = 1
        resultados.push({ destinatario, chatId, ok: false })
      }
    }

    // Actualizar última conexión
    await db.credencial.update({
      where: { servicio: 'TELEGRAM_BOT' },
      data: { ultimaConexion: new Date() },
    })

    return NextResponse.json({
      ok: true,
      enviados,
      errores,
      resultados,
      message: enviados > 0
        ? `✅ ${enviados} mensaje(s) enviado(s) correctamente a Telegram real.`
        : 'No se envió ningún mensaje.',
    })
  } catch (error) {
    console.error('Error Telegram:', error)
    return NextResponse.json({ error: 'Failed to send Telegram message' }, { status: 500 })
  }
}
