// scripts/configure-gmail.ts
// Configura las credenciales reales de Gmail en la base de datos
// IMPORTANTE: Las credenciales se cargan desde variables de entorno (.env) por seguridad

import { db } from '../src/lib/db'
import nodemailer from 'nodemailer'

async function main() {
  console.log('📧 Configurando credenciales de Gmail...')

  const appPassword = process.env.GMAIL_APP_PASSWORD || ''
  const email = 'seagull.records.99@gmail.com'

  if (!appPassword) {
    console.log('❌ Error: Configura GMAIL_APP_PASSWORD en tu archivo .env')
    return
  }

  const datos = {
    email: email,
    appPassword: appPassword,
  }

  const credencial = await db.credencial.upsert({
    where: { servicio: 'GMAIL' },
    update: {
      datos: JSON.stringify(datos),
      activo: true,
      ultimaConexion: new Date(),
      notas: 'Gmail App Password configurado - listo para envío real',
    },
    create: {
      servicio: 'GMAIL',
      datos: JSON.stringify(datos),
      activo: true,
      ultimaConexion: new Date(),
      notas: 'Gmail App Password configurado - listo para envío real',
    },
  })

  console.log('✅ Credenciales de Gmail guardadas:')
  console.log(`   Email: ${datos.email}`)
  console.log(`   Servicio: ${credencial.servicio}`)
  console.log(`   Activo: ${credencial.activo}`)

  // Probar conexión SMTP
  console.log('\n🔍 Verificando conexión SMTP con Gmail...')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: datos.email,
      pass: datos.appPassword,
    },
  })

  try {
    const verify = await transporter.verify()
    console.log('✅ Conexión SMTP verificada - Gmail listo para enviar emails')
  } catch (error: any) {
    console.log('❌ Error verificando Gmail:', error.message)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
