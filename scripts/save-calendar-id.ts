// scripts/save-calendar-id.ts
// Guarda el Calendar ID del usuario en la base de datos

import { db } from '../src/lib/db'

async function main() {
  console.log('📅 Guardando Calendar ID del usuario...')

  const calendarId = '7795056321e9e8c5c5981f8acc4d0875cd896cb7ee9cba4956de9c5d5be37992@group.calendar.google.com'

  // Guardar como una credencial especial de tipo GOOGLE_CALENDAR_ID
  const credencial = await db.credencial.upsert({
    where: { servicio: 'GOOGLE_CALENDAR_ID' },
    update: {
      datos: JSON.stringify({
        calendarId,
        nombre: 'Calendario SEAGULL (a confirmar)',
        agregado: new Date().toISOString(),
      }),
      activo: true,
      notas: 'Calendar ID proporcionado por el usuario - pendiente de OAuth para activar',
    },
    create: {
      servicio: 'GOOGLE_CALENDAR_ID',
      datos: JSON.stringify({
        calendarId,
        nombre: 'Calendario SEAGULL (a confirmar)',
        agregado: new Date().toISOString(),
      }),
      activo: true,
      notas: 'Calendar ID proporcionado por el usuario - pendiente de OAuth para activar',
    },
  })

  console.log('✅ Calendar ID guardado en la base de datos')
  console.log(`   Servicio: ${credencial.servicio}`)
  console.log(`   Calendar ID: ${calendarId}`)
  console.log(`   Estado: Pendiente de Google OAuth para activar`)

  console.log('\n📋 Lo que falta para usar este calendario:')
  console.log('   1. Client ID de Google OAuth')
  console.log('   2. Client Secret de Google OAuth')
  console.log('   3. Refresh Token (generado con OAuth)')
  console.log('\nCuando tengas esos datos, el sistema podrá:')
  console.log('   ✓ Crear eventos automáticamente en este calendario')
  console.log('   ✓ Mostrar próximos eventos en el dashboard')
  console.log('   ✓ Sincronizar sesiones de grabación, reuniones y entregas')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
