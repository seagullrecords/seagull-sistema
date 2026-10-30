// src/lib/email-service.ts
// Servicio de envío de emails - soporta Resend (recomendado) y Gmail (fallback)

import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { db } from './db'

// =====================================================
// FUNCIÓN PRINCIPAL: enviarEmail
// Detecta automáticamente qué servicio usar según las credenciales configuradas
// =====================================================

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  replyTo?: string
}

export async function enviarEmail(options: EmailOptions): Promise<{ ok: boolean; messageId?: string; error?: string; servicio?: string }> {
  // 1. Intentar primero con RESEND (recomendado, más confiable)
  const resendResult = await enviarConResend(options)
  if (resendResult.ok) {
    return { ...resendResult, servicio: 'resend' }
  }

  // 2. Si Resend falla o no está configurado, intentar con GMAIL
  const gmailResult = await enviarConGmail(options)
  if (gmailResult.ok) {
    return { ...gmailResult, servicio: 'gmail' }
  }

  // 3. Si ambos fallan, devolver error
  return {
    ok: false,
    error: `Resend: ${resendResult.error} | Gmail: ${gmailResult.error}`,
  }
}

// =====================================================
// RESEND - Función de envío con Resend
// =====================================================

async function enviarConResend(options: EmailOptions): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    const cred = await db.credencial.findUnique({ where: { servicio: 'RESEND' } })
    if (!cred || !cred.activo) {
      return { ok: false, error: 'Resend no está configurado' }
    }

    const datos = JSON.parse(cred.datos)
    if (!datos.apiKey) {
      return { ok: false, error: 'API key de Resend no configurada' }
    }

    const resend = new Resend(datos.apiKey)

    // Determinar el email remitente
    const fromEmail = datos.fromEmail || 'onboarding@resend.dev'
    const fromName = datos.fromName || 'SEAGULL RECORDS Studio OS'
    const replyTo = options.replyTo || datos.replyTo || 'seagull.records.99@gmail.com'

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: replyTo,
      attachments: options.attachments?.map(a => ({
        filename: a.filename,
        content: typeof a.content === 'string' ? a.content : Buffer.from(a.content).toString('base64'),
      })),
    })

    if (error) {
      console.error('[Resend] Error:', error)
      return { ok: false, error: error.message }
    }

    // Actualizar última conexión
    await db.credencial.update({
      where: { servicio: 'RESEND' },
      data: { ultimaConexion: new Date() },
    })

    return { ok: true, messageId: data?.id }
  } catch (error: any) {
    console.error('[Resend] Excepción:', error)
    return { ok: false, error: error.message }
  }
}

// =====================================================
// GMAIL - Función de envío con Gmail (fallback)
// =====================================================

let cachedTransporter: nodemailer.Transporter | null = null
let cachedEmail: string | null = null

async function enviarConGmail(options: EmailOptions): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    const cred = await db.credencial.findUnique({ where: { servicio: 'GMAIL' } })
    if (!cred || !cred.activo) {
      return { ok: false, error: 'Gmail no está configurado' }
    }

    const datos = JSON.parse(cred.datos)
    if (!datos.email || !datos.appPassword) {
      return { ok: false, error: 'Gmail no tiene credenciales completas' }
    }

    // Crear o reusar transporter
    let transporter: nodemailer.Transporter
    if (cachedTransporter && cachedEmail === datos.email) {
      transporter = cachedTransporter
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: datos.email,
          pass: datos.appPassword,
        },
      })
      // No verificamos aquí para no duplicar errores
      cachedTransporter = transporter
      cachedEmail = datos.email
    }

    const info = await transporter.sendMail({
      from: `"SEAGULL RECORDS Studio OS" <${datos.email}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
      replyTo: options.replyTo,
    })

    await db.credencial.update({
      where: { servicio: 'GMAIL' },
      data: { ultimaConexion: new Date() },
    })

    return { ok: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('[Gmail] Error:', error)
    return { ok: false, error: error.message }
  }
}

// =====================================================
// FUNCIONES ESPECÍFICAS PARA CASOS DE USO
// =====================================================

// Enviar cotización por email
export async function enviarCotizacionEmail(
  to: string,
  cotizacion: { codigo: string; nombreCliente: string; total: number; items: any[] }
): Promise<{ ok: boolean; error?: string; servicio?: string }> {
  const itemsHtml = cotizacion.items.map((it: any, i: number) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${it.descripcion}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.cantidad}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">S/. ${it.precioUnitario.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">S/. ${it.subtotal.toFixed(2)}</td>
    </tr>
  `).join('')

  const subtotal = cotizacion.items.reduce((s: number, it: any) => s + it.subtotal, 0)
  const igv = subtotal * 0.18
  const total = subtotal + igv

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">SEAGULL RECORDS S.A.C.</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 12px;">Estudio de Producción Musical · Chimbote, Perú</p>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #6366f1; margin-top: 0;">Cotización ${cotizacion.codigo}</h2>
        <p><strong>Cliente:</strong> ${cotizacion.nombreCliente}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PE')}</p>
        <p><strong>Vigencia:</strong> 15 días</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #6366f1;">#</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #6366f1;">Descripción</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #6366f1;">Cant.</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6366f1;">P. Unit.</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6366f1;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <p>Subtotal: <strong>S/. ${subtotal.toFixed(2)}</strong></p>
          <p>IGV (18%): <strong>S/. ${igv.toFixed(2)}</strong></p>
          <p style="font-size: 18px; color: #6366f1;">Total: <strong>S/. ${total.toFixed(2)}</strong></p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <strong>Condiciones:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Vigencia: 15 días desde la emisión</li>
            <li>Anticipo del 50% para iniciar el proyecto</li>
            <li>Saldo contra entrega</li>
            <li>Formas de pago: Efectivo, Yape, Plin, Transferencia</li>
          </ul>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">
          SEAGULL RECORDS S.A.C. · RUC 20612281352<br>
          Jr. Ferrocarril 151, Chimbote, Áncash, Perú<br>
          📞 910 216 278 · ✉ seagull.records.99@gmail.com
        </p>
      </div>
    </div>
  `

  const text = `SEAGULL RECORDS S.A.C.
Cotización ${cotizacion.codigo}

Cliente: ${cotizacion.nombreCliente}
Fecha: ${new Date().toLocaleDateString('es-PE')}
Vigencia: 15 días

Subtotal: S/. ${subtotal.toFixed(2)}
IGV (18%): S/. ${igv.toFixed(2)}
Total: S/. ${total.toFixed(2)}

---
SEAGULL RECORDS S.A.C. · RUC 20612281352
Jr. Ferrocarril 151, Chimbote, Áncash, Perú
Tel: 910 216 278 · Email: seagull.records.99@gmail.com`

  return enviarEmail({
    to,
    subject: `Cotización ${cotizacion.codigo} - SEAGULL RECORDS`,
    text,
    html,
    replyTo: 'seagull.records.99@gmail.com',
  })
}

// Enviar informe mensual por email
export async function enviarInformeEmail(to: string, informe: any): Promise<{ ok: boolean; error?: string; servicio?: string }> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">SEAGULL RECORDS</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Informe Mensual · ${informe.datos.periodo.mesNombre || ''} ${informe.anio}</p>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
        <h2>📊 Resumen Financiero</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 10px; background: #f0fdf4; border-radius: 5px;">Ingresos: <strong>S/. ${informe.datos.resumen.totalIngresos.toFixed(2)}</strong></td>
            <td style="padding: 10px; background: #fdf2f8; border-radius: 5px;">Egresos: <strong>S/. ${informe.datos.resumen.totalEgresos.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #eef2ff; border-radius: 5px;">Utilidad: <strong>S/. ${informe.datos.resumen.utilidadNeta.toFixed(2)}</strong></td>
            <td style="padding: 10px; background: #fffbeb; border-radius: 5px;">Margen: <strong>${informe.datos.resumen.margenUtilidad.toFixed(1)}%</strong></td>
          </tr>
        </table>

        <h2>📈 Operaciones</h2>
        <ul>
          <li>Proyectos activos: <strong>${informe.datos.proyectos.activos}</strong></li>
          <li>Proyectos entregados: <strong>${informe.datos.proyectos.entregados}</strong></li>
          <li>Tareas completadas: <strong>${informe.datos.tareas.completadas}</strong></li>
          <li>Tareas pendientes: <strong>${informe.datos.tareas.pendientes}</strong></li>
          <li>Contactos activos: <strong>${informe.datos.contactos.activos}</strong></li>
        </ul>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">
          SEAGULL RECORDS S.A.C. · RUC 20612281352<br>
          Informe generado automáticamente por SEAGULL Studio OS · ${new Date().toLocaleString('es-PE')}
        </p>
      </div>
    </div>
  `

  return enviarEmail({
    to,
    subject: `📊 Informe mensual SEAGULL RECORDS - ${informe.datos.periodo.mesNombre || ''} ${informe.anio}`,
    html,
    replyTo: 'seagull.records.99@gmail.com',
  })
}
