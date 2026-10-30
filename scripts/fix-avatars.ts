// scripts/fix-avatars.ts
import { db } from '../src/lib/db'

async function main() {
  console.log('🧹 Limpiando URLs rotas de avatares...')
  
  const users = await db.user.findMany()
  for (const u of users) {
    if (u.avatar && u.avatar.includes('pravatar.cc')) {
      await db.user.update({
        where: { id: u.id },
        data: { avatar: null }
      })
      console.log(`✅ ${u.name}: avatar limpiado`)
    }
  }
  
  const contactos = await db.contacto.findMany()
  for (const c of contactos) {
    if (c.avatar && c.avatar.includes('pravatar.cc')) {
      await db.contacto.update({
        where: { id: c.id },
        data: { avatar: null }
      })
      console.log(`✅ ${c.nombre}: avatar limpiado`)
    }
  }
  
  console.log('\n✅ Todos los avatares rotos han sido limpiados')
  console.log('Ahora mostrarán las iniciales del nombre en su lugar')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
