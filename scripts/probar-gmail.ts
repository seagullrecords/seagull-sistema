// scripts/probar-gmail.ts
// Prueba la conexión real con Gmail y envía un email de prueba
// IMPORTANTE: Las credenciales se cargan desde variables de entorno (.env) por seguridad

import { db } from '../src/lib/db'
import nodemailer from 'nodemailer'

async function main() {
  console.log('📧 Probando conexión con Gmail...')

  const appPassword = process.env.GMAIL_APP_PASSWORD || ''
  const email = process.env.GMAIL_EMAIL || 'seagull.records.99@gmail.com'

  if (!appPassword) {
    console.log('❌ Error: Configura GMAIL_APP_PASSWORD en tu archivo .env')
    return
  }

  console.log(`Email: ${email}`)

  // Crear transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: appPassword,
    },
  })

  // Verificar conexión
  console.log('\n🔍 Verificando conexión SMTP...')
  try {
    await transporter.verify()
    console.log('✅ Conexión SMTP verificada - Gmail aceptó las credenciales')
  } catch (error: any) {
    console.log('❌ Error en verify():', error.message)
    console.log('\n💡 Probando envío real de todas formas...')
  }

  // Enviar email de prueba real
  console.log('\n📤 Enviando email de prueba real...')
  try {
    const info = await transporter.sendMail({
      from: `"SEAGULL RECORDS Studio OS" <${email}>`,
      to: email, // enviar a ti mismo
      subject: '✅ SEAGULL RECORDS - Gmail configurado correctamente',
      text: `Hola!

Este es un email de prueba automático enviado desde el sistema SEAGULL RECORDS Studio OS.

✅ Gmail está conectado y funcionando correctamente.

A partir de ahora, el sistema puede:
- Enviar cotizaciones por email a clientes
- Enviar informes mensuales a tu correo
- Enviar notificaciones automáticas al equipo

Detalles técnicos:
- Enviado desde: ${email}
- Fecha: ${new Date().toLocaleString('es-PE')}
- Sistema: SEAGULL RECORDS Studio OS

Saludos,
El equipo de SEAGULL RECORDS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">SEAGULL RECORDS</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 12px;">Studio OS · Sistema de Gestión Integral</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #16a34a; margin-top: 0;">✅ Gmail configurado correctamente</h2>
            <p>Hola!</p>
            <p>Este es un email de prueba automático enviado desde el sistema <strong>SEAGULL RECORDS Studio OS</strong>.</p>
            <p>A partir de ahora, el sistema puede:</p>
            <ul>
              <li>📧 Enviar cotizaciones por email a clientes</li>
              <li>📊 Enviar informes mensuales a tu correo</li>
              <li>🔔 Enviar notificaciones automáticas al equipo</li>
            </ul>
            <div style="background: #fff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
              <strong>Detalles técnicos:</strong><br>
              <small>
                Enviado desde: ${email}<br>
                Fecha: ${new Date().toLocaleString('es-PE')}<br>
                Sistema: SEAGULL RECORDS Studio OS
              </small>
            </div>
            <p style="text-align: center; margin-top: 30px;">
              <span style="background: #6366f1; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">Sistema activo</span>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 11px; color: #999; text-align: center;">
              SEAGULL RECORDS S.A.C. · RUC 20612281352<br>
              Jr. Ferrocarril 151, Chimbote, Áncash, Perú
            </p>
          </div>
        </div>
      `,
    })

    console.log('✅ Email enviado correctamente!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Response: ${info.response}`)
    console.log(`   Enviado a: ${email}`)

    // Guardar credenciales en base de datos
    await db.credencial.upsert({
      where: { servicio: 'GMAIL' },
      update: {
        datos: JSON.stringify({ email, appPassword }),
        activo: true,
        ultimaConexion: new Date(),
        notas: 'Gmail App Password configurado y verificado - envío real funcionando',
      },
      create: {
        servicio: 'GMAIL',
        datos: JSON.stringify({ email, appPassword }),
        activo: true,
        ultimaConexion: new Date(),
        notas: 'Gmail App Password configurado y verificado - envío real funcionando',
      },
    })
    console.log('\n✅ Credenciales guardadas en la base de datos del sistema')
  } catch (error: any) {
    console.log('❌ Error enviando email:', error.message)
    console.log('Code:', error.code)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
