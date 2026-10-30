// scripts/configure-telegram.ts
// Configura las credenciales reales de Telegram en la base de datos
// IMPORTANTE: El token se carga desde variables de entorno (.env) por seguridad
// Nunca subas tu token real a GitHub

import { db } from '../src/lib/db'

async function main() {
  console.log('🔧 Configurando credenciales de Telegram...')

  const botToken = process.env.TELEGRAM_BOT_TOKEN || ''
  if (!botToken) {
    console.log('❌ Error: Configura TELEGRAM_BOT_TOKEN en tu archivo .env')
    console.log('   Ejemplo: TELEGRAM_BOT_TOKEN=123456789:ABCdef...')
    return
  }

  const datos = {
    botToken: botToken,
    chatIds: {
      Martha: '', // pendiente - Martha debe enviar /start al bot
      Aarón: '',  // pendiente
      Caleb: '',  // pendiente
      Oseías: '', // pendiente
    },
    grupoEquipo: '-1004426538288', // Seagull - Agenda del Estudio
  }

  const credencial = await db.credencial.upsert({
    where: { servicio: 'TELEGRAM_BOT' },
    update: {
      datos: JSON.stringify(datos),
      activo: true,
      ultimaConexion: new Date(),
      notas: 'Bot @SeagullAgendaNotificaciones_bot - configurado y activo',
    },
    create: {
      servicio: 'TELEGRAM_BOT',
      datos: JSON.stringify(datos),
      activo: true,
      ultimaConexion: new Date(),
      notas: 'Bot @SeagullAgendaNotificaciones_bot - configurado y activo',
    },
  })

  console.log('✅ Credenciales guardadas:')
  console.log(`   Servicio: ${credencial.servicio}`)
  console.log(`   Activo: ${credencial.activo}`)
  console.log(`   Bot: @SeagullAgendaNotificaciones_bot`)
  console.log(`   Grupo: ${datos.grupoEquipo}`)
  console.log(`   Chat IDs individuales: pendientes (Martha, Aarón, Caleb, Oseías)`)

  // Verificar conexión con Telegram
  console.log('\n🔍 Verificando conexión con Telegram...')
  const res = await fetch(`https://api.telegram.org/bot${datos.botToken}/getMe`)
  const data = await res.json()

  if (data.ok) {
    console.log('✅ Bot verificado en Telegram:')
    console.log(`   Nombre: ${data.result.first_name}`)
    console.log(`   Username: @${data.result.username}`)
  } else {
    console.log('❌ Error verificando bot:', data)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
