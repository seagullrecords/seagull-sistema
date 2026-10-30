// scripts/set-team-photos.ts
import { db } from '../src/lib/db'

async function main() {
  console.log('📸 Agregando fotos del equipo...')

  const fotos = {
    'Martha': '/uploads/martha.png',
    'Aarón': '/uploads/aaron.jpg',
    'Caleb': '/uploads/caleb.jpg',
  }

  const users = await db.user.findMany()

  for (const user of users) {
    const fotoUrl = fotos[user.name as keyof typeof fotos]
    if (fotoUrl) {
      await db.user.update({
        where: { id: user.id },
        data: { avatar: fotoUrl },
      })
      console.log(`✅ ${user.name}: foto actualizada → ${fotoUrl}`)
    } else {
      console.log(`⏭️ ${user.name}: sin foto (manteniendo inicial)`)
    }
  }

  console.log('\n✅ ¡Fotos del equipo configuradas!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
