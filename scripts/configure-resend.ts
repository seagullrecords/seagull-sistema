// scripts/configure-resend.ts
// Configura Resend en la base de datos y envía un email de prueba real
// IMPORTANTE: La API key se carga desde variables de entorno (.env) por seguridad
// Nunca subas tu API key real a GitHub

import { db } from '../src/lib/db'
import { Resend } from 'resend'

async function main() {
  console.log('📧 Configurando Resend...')

  const apiKey = process.env.RESEND_API_KEY || ''
  if (!apiKey) {
    console.log('❌ Error: Configura RESEND_API_KEY en tu archivo .env')
    console.log('   Ejemplo: RESEND_API_KEY=re_tu_api_key_aqui')
    return
  }

  const datos = {
    apiKey: apiKey,
    fromEmail: 'onboarding@resend.dev',
    fromName: 'SEAGULL RECORDS Studio OS',
    replyTo: 'seagull.records.99@gmail.com',
  }

  // Guardar credenciales en la base de datos
  const credencial = await db.credencial.upsert({
    where: { servicio: 'RESEND' },
    update: {
      datos: JSON.stringify(datos),
      activo: true,
      ultimaConexion: new Date(),
      notas: 'Resend configurado con onboarding@resend.dev - listo para envío real',
    },
    create: {
      servicio: 'RESEND',
      datos: JSON.stringify(datos),
      activo: true,
      ultimaConexion: new Date(),
      notas: 'Resend configurado con onboarding@resend.dev - listo para envío real',
    },
  })

  console.log('✅ Credenciales de Resend guardadas:')
  console.log(`   Servicio: ${credencial.servicio}`)
  console.log(`   Activo: ${credencial.activo}`)
  console.log(`   From: ${datos.fromName} <${datos.fromEmail}>`)
  console.log(`   Reply-to: ${datos.replyTo}`)

  // Enviar email de prueba real
  console.log('\n📤 Enviando email de prueba real a seagull.records.99@gmail.com...')

  const resend = new Resend(datos.apiKey)
  const messageIdPlaceholder = 'se-generara-al-enviar'

  const { data, error } = await resend.emails.send({
    from: `${datos.fromName} <${datos.fromEmail}>`,
    to: datos.replyTo,
    subject: '✅ SEAGULL RECORDS - Email configurado correctamente',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SEAGULL RECORDS</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 12px;">Studio OS · Sistema de Gestión Integral</p>
        </div>
        <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #16a34a; margin-top: 0;">✅ Email configurado correctamente</h2>
          <p>Hola!</p>
          <p>Este es un email de prueba enviado desde el sistema <strong>SEAGULL RECORDS Studio OS</strong> usando <strong>Resend</strong>.</p>
          <p>A partir de ahora, el sistema puede:</p>
          <ul>
            <li>📧 Enviar cotizaciones por email a clientes</li>
            <li>📊 Enviar informes mensuales a tu correo</li>
            <li>🔔 Enviar notificaciones automáticas al equipo</li>
          </ul>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>📋 Detalles técnicos:</strong><br>
            <small>
              Servicio: Resend<br>
              Remitente: ${datos.fromEmail}<br>
              Reply-to: ${datos.replyTo}<br>
              Fecha: ${new Date().toLocaleString('es-PE')}<br>
              Plan: Onboarding (100 emails/día gratis)
            </small>
          </div>

          <div style="background: #eef2ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
            <strong>📌 Importante:</strong><br>
            <small>
              Los emails llegarán desde <code>onboarding@resend.dev</code> (dominio gratuito de Resend).<br>
              Cuando alguien responda, el mensaje llegará a tu Gmail: <code>${datos.replyTo}</code><br>
              Para enviar hasta 100 emails/día con este plan gratuito.
            </small>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <span style="background: #16a34a; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">✅ Sistema activo</span>
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 11px; color: #999; text-align: center;">
            SEAGULL RECORDS S.A.C. · RUC 20612281352<br>
            Jr. Ferrocarril 151, Chimbote, Áncash, Perú<br>
            📞 910 216 278 · ✉ seagull.records.99@gmail.com
          </p>
        </div>
      </div>
    `,
    text: `SEAGULL RECORDS Studio OS - Email configurado correctamente

Hola!

Este es un email de prueba enviado desde el sistema SEAGULL RECORDS Studio OS usando Resend.

El sistema puede:
- Enviar cotizaciones por email a clientes
- Enviar informes mensuales a tu correo
- Enviar notificaciones automáticas al equipo

Detalles técnicos:
- Servicio: Resend
- Remitente: ${datos.fromEmail}
- Reply-to: ${datos.replyTo}
- Fecha: ${new Date().toLocaleString('es-PE')}
- Plan: Onboarding (100 emails/día gratis)

---
SEAGULL RECORDS S.A.C. · RUC 20612281352
Jr. Ferrocarril 151, Chimbote, Áncash, Perú
Tel: 910 216 278 · Email: seagull.records.99@gmail.com`,
    reply_to: datos.replyTo,
  })

  if (error) {
    console.log('❌ Error enviando email:', error)
    return
  }

  console.log('✅ Email enviado correctamente!')
  console.log(`   Message ID: ${data?.id}`)
  console.log(`   Enviado a: ${datos.replyTo}`)
  console.log('\n📬 Revisa tu bandeja de entrada (y carpeta de spam) en seagull.records.99@gmail.com')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
