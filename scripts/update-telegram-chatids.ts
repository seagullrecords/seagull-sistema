// scripts/update-telegram-chatids.ts
// Actualiza los Chat IDs conocidos de Martha y Oseías en la base de datos

import { db } from '../src/lib/db'

async function main() {
  console.log('📱 Actualizando Chat IDs de Telegram...')

  // User IDs conocidos (estos son los IDs de usuario, pero necesitamos que inicien chat privado con el bot)
  // Para que el bot pueda enviar mensajes privados, cada usuario debe /start en chat privado
  // Por ahora guardamos estos IDs como referencia

  const cred = await db.credencial.findUnique({ where: { servicio: 'TELEGRAM_BOT' } })
  if (!cred) {
    console.log('❌ No hay credencial de Telegram configurada')
    return
  }

  const datos = JSON.parse(cred.datos)
  console.log('Configuración actual:')
  console.log(`  Bot: @SeagullAgendaNotificaciones_bot`)
  console.log(`  Grupo: ${datos.grupoEquipo}`)
  console.log(`  Chat IDs actuales: Martha=${datos.chatIds?.Martha || 'vacío'}, Aarón=${datos.chatIds?.Aarón || 'vacío'}, Caleb=${datos.chatIds?.Caleb || 'vacío'}, Oseías=${datos.chatIds?.Oseías || 'vacío'}`)

  // NOTA: Los User IDs detectados en el grupo son:
  // - Martha: 8718926444
  // - Oseías: 6693134213
  // PERO estos no se pueden usar para mensajes privados directamente.
  // El bot necesita que cada usuario haya iniciado chat privado con /start.

  // En Telegram, los mensajes privados entre usuarios se hacen con el User ID,
  // pero para bots, el usuario primero debe haber iniciado la conversación.
  // Vamos a probar enviando un mensaje a estos IDs a ver si funcionan.

  datos.chatIds = {
    ...datos.chatIds,
    Martha: '8718926444',   // User ID detectado - puede funcionar como chat ID
    Oseías: '6693134213',   // User ID detectado - puede funcionar como chat ID
    Aarón: '',              // pendiente
    Caleb: '',               // pendiente
  }

  await db.credencial.update({
    where: { servicio: 'TELEGRAM_BOT' },
    data: {
      datos: JSON.stringify(datos),
      ultimaConexion: new Date(),
    },
  })

  console.log('\n✅ Chat IDs actualizados:')
  console.log('   Martha: 8718926444 (probando)')
  console.log('   Oseías: 6693134213 (probando)')
  console.log('   Aarón: pendiente')
  console.log('   Caleb: pendiente')

  console.log('\n🧪 Vamos a probar enviando un mensaje privado a cada uno...')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
