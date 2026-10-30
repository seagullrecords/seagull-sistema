import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enviarEmail, enviarCotizacionEmail, enviarInformeEmail } from '@/lib/email-service'

// GET /api/google - estado de las integraciones Google y Resend
export async function GET() {
  try {
    const credGoogle = await db.credencial.findUnique({ where: { servicio: 'GOOGLE_OAUTH' } })
    const credGmail = await db.credencial.findUnique({ where: { servicio: 'GMAIL' } })
    const credResend = await db.credencial.findUnique({ where: { servicio: 'RESEND' } })

    const google = credGoogle ? JSON.parse(credGoogle.datos) : {}
    const gmail = credGmail ? JSON.parse(credGmail.datos) : {}
    const resend = credResend ? JSON.parse(credResend.datos) : {}

    return NextResponse.json({
      google: {
        configured: credGoogle?.activo && !!google.clientId && !!google.clientSecret,
        clientIdSet: !!google.clientId,
        clientSecretSet: !!google.clientSecret,
        refreshTokenSet: !!google.refreshToken,
        redirectUri: google.redirectUri || 'https://tu-app.vercel.app/api/google/callback',
        ultimaConexion: credGoogle?.ultimaConexion,
      },
      gmail: {
        configured: credGmail?.activo && !!gmail.appPassword,
        email: gmail.email || 'seagull.records.99@gmail.com',
        appPasswordSet: !!gmail.appPassword,
        ultimaConexion: credGmail?.ultimaConexion,
      },
      resend: {
        configured: credResend?.activo && !!resend.apiKey,
        apiKeySet: !!resend.apiKey,
        fromEmail: resend.fromEmail || 'onboarding@resend.dev',
        fromName: resend.fromName || 'SEAGULL RECORDS Studio OS',
        replyTo: resend.replyTo || 'seagull.records.99@gmail.com',
        ultimaConexion: credResend?.ultimaConexion,
      },
      // El servicio principal de email (cuál se usará primero)
      emailService: credResend?.activo && !!resend.apiKey ? 'resend' : (credGmail?.activo && !!gmail.appPassword ? 'gmail' : 'none'),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - acciones: probar_email, enviar_cotizacion, enviar_informe, listar_drive, crear_evento
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    // ===== GMAIL - Envío de emails reales =====

    if (action === 'probar_email') {
      const credResend = await db.credencial.findUnique({ where: { servicio: 'RESEND' } })
      const credGmail = await db.credencial.findUnique({ where: { servicio: 'GMAIL' } })

      if (!credResend?.activo && !credGmail?.activo) {
        return NextResponse.json({ error: 'Ni Resend ni Gmail están configurados. Ve a Configuración para activar uno.' }, { status: 400 })
      }

      const destinatario = body.to || (credGmail ? JSON.parse(credGmail.datos).email : 'seagull.records.99@gmail.com')

      const result = await enviarEmail({
        to: destinatario,
        subject: '✅ SEAGULL RECORDS - Email configurado correctamente',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">SEAGULL RECORDS</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Studio OS</p>
            </div>
            <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #16a34a;">✅ Email configurado correctamente</h2>
              <p>Este es un email de prueba enviado desde el sistema SEAGULL RECORDS Studio OS.</p>
              <p>A partir de ahora, el sistema puede:</p>
              <ul>
                <li>📧 Enviar cotizaciones por email a clientes</li>
                <li>📊 Enviar informes mensuales a tu correo</li>
                <li>🔔 Enviar notificaciones automáticas al equipo</li>
              </ul>
              <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">
                <strong>Fecha:</strong> ${new Date().toLocaleString('es-PE')}<br>
                <strong>Destinatario:</strong> ${destinatario}<br>
                <strong>Responder a:</strong> seagull.records.99@gmail.com
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 11px; color: #999; text-align: center;">
                SEAGULL RECORDS S.A.C. · RUC 20612281352<br>
                Jr. Ferrocarril 151, Chimbote, Áncash, Perú
              </p>
            </div>
          </div>
        `,
        text: `SEAGULL RECORDS Studio OS - Email configurado correctamente\n\nFecha: ${new Date().toLocaleString('es-PE')}\nDestinatario: ${destinatario}\n\nEl sistema puede enviar:\n- Cotizaciones por email\n- Informes mensuales\n- Notificaciones automáticas`,
        replyTo: 'seagull.records.99@gmail.com',
      })

      if (result.ok) {
        return NextResponse.json({
          ok: true,
          message: `✅ Email enviado correctamente a ${destinatario} (usando ${result.servicio}). Revisa tu bandeja de entrada.`,
          messageId: result.messageId,
          servicio: result.servicio,
        })
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    if (action === 'enviar_cotizacion') {
      const { cotizacionId, to } = body

      if (!cotizacionId || !to) {
        return NextResponse.json({ error: 'Falta cotizacionId o destinatario' }, { status: 400 })
      }

      const cotizacion = await db.cotizacion.findUnique({
        where: { id: cotizacionId },
        include: { items: true },
      })

      if (!cotizacion) {
        return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
      }

      const result = await enviarCotizacionEmail(to, {
        codigo: cotizacion.codigo,
        nombreCliente: cotizacion.nombreCliente,
        total: cotizacion.total,
        items: cotizacion.items.map((it: any) => ({
          descripcion: it.descripcion,
          cantidad: it.cantidad,
          precioUnitario: it.precioUnitario,
          subtotal: it.subtotal,
        })),
      })

      if (result.ok) {
        return NextResponse.json({
          ok: true,
          message: `✅ Cotización ${cotizacion.codigo} enviada a ${to}`,
        })
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    if (action === 'enviar_informe_email') {
      const { informeId, to } = body

      if (!to) {
        return NextResponse.json({ error: 'Falta destinatario' }, { status: 400 })
      }

      const informe = await db.informeMensual.findFirst({
        orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      })

      if (!informe) {
        return NextResponse.json({ error: 'No hay informes generados' }, { status: 404 })
      }

      const informeDatos = {
        anio: informe.anio,
        datos: JSON.parse(informe.datosJson),
      }

      const result = await enviarInformeEmail(to, informeDatos)

      if (result.ok) {
        return NextResponse.json({
          ok: true,
          message: `✅ Informe enviado a ${to}`,
        })
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }

    // ===== GOOGLE DRIVE / CALENDAR (pendientes de configurar OAuth) =====

    if (action === 'probar') {
      const credGoogle = await db.credencial.findUnique({ where: { servicio: 'GOOGLE_OAUTH' } })
      if (!credGoogle || !credGoogle.activo) {
        return NextResponse.json({ error: 'Google OAuth no está configurado' }, { status: 400 })
      }
      await db.credencial.update({
        where: { servicio: 'GOOGLE_OAUTH' },
        data: { ultimaConexion: new Date() },
      })
      return NextResponse.json({
        ok: true,
        message: 'Conexión a Google Workspace verificada (modo simulación en sandbox). En producción se hará una llamada real a la API.',
      })
    }

    if (action === 'listar_drive') {
      // En sandbox, devolvemos datos simulados basados en proyectos reales
      const proyectos = await db.proyecto.findMany({ where: { urlCarpetaDrive: { not: null } } })
      return NextResponse.json({
        ok: true,
        modoSimulacion: true,
        message: 'En sandbox no se puede acceder a Drive real. Datos simulados basados en proyectos.',
        folders: proyectos.map(p => ({
          id: p.urlCarpetaDrive?.split('/').pop(),
          name: `${p.codigo} - ${p.nombreProyecto}`,
          webViewLink: p.urlCarpetaDrive,
          modifiedTime: p.updatedAt,
        })),
      })
    }

    if (action === 'crear_evento') {
      const { titulo, descripcion, fechaInicio, fechaFin, invitados } = body

      await db.evento.create({
        data: {
          titulo,
          descripcion: descripcion || null,
          fechaInicio: new Date(fechaInicio),
          fechaFin: fechaFin ? new Date(fechaFin) : null,
          tipo: 'REUNION',
          estado: 'PROGRAMADO',
          ubicacion: 'SEAGULL RECORDS - Estudio',
        },
      })

      return NextResponse.json({
        ok: true,
        modoSimulacion: true,
        message: `Evento "${titulo}" creado en base de datos. Para sincronizar con Google Calendar real, configura Google OAuth.`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error Google/Gmail:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
