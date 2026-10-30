// scripts/seed-extendido.ts
// Extiende el seed SEAGULL con datos de inventario, asistencia e informe mensual

import { db } from '../src/lib/db'

async function main() {
  console.log('📦 Creando inventario...')

  const inventarioData = [
    // Micrófonos
    { codigo: 'INV-001', nombre: 'Shure SM7B', categoria: 'MICROFONO', marca: 'Shure', modelo: 'SM7B', numeroSerie: 'SM7B-2023-001', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 1850, fechaAdquisicion: new Date('2023-06-15') },
    { codigo: 'INV-002', nombre: 'Audio-Technica AT2020', categoria: 'MICROFONO', marca: 'Audio-Technica', modelo: 'AT2020', numeroSerie: 'AT2020-2023-002', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 380, fechaAdquisicion: new Date('2023-08-10') },
    { codigo: 'INV-003', nombre: 'Rode NT1-A', categoria: 'MICROFONO', marca: 'Rode', modelo: 'NT1-A', numeroSerie: 'NT1A-2024-003', estado: 'EN_USO', ubicacion: 'Estudio B', valorCompra: 720, fechaAdquisicion: new Date('2024-02-20'), notas: 'En uso para grabación de voces - Karla EP' },
    { codigo: 'INV-004', nombre: 'Shure SM58', categoria: 'MICROFONO', marca: 'Shure', modelo: 'SM58', numeroSerie: 'SM58-2022-004', estado: 'PRESTADO', ubicacion: 'Sala Ensayo', valorCompra: 320, fechaAdquisicion: new Date('2022-11-05'), notas: 'Prestado a banda Airbag para ensayo' },
    { codigo: 'INV-005', nombre: 'AKG C414 XLII', categoria: 'MICROFONO', marca: 'AKG', modelo: 'C414 XLII', numeroSerie: 'C414-2024-005', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 2400, fechaAdquisicion: new Date('2024-05-12') },
    // Cables
    { codigo: 'INV-006', nombre: 'Cable XLR 5m', categoria: 'CABLE', marca: 'Mogami', modelo: 'Gold Studio XLR', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 95, fechaAdquisicion: new Date('2023-03-08') },
    { codigo: 'INV-007', nombre: 'Cable XLR 5m', categoria: 'CABLE', marca: 'Mogami', modelo: 'Gold Studio XLR', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 95, fechaAdquisicion: new Date('2023-03-08') },
    { codigo: 'INV-008', nombre: 'Cable XLR 10m', categoria: 'CABLE', marca: 'Mogami', modelo: 'Gold Studio XLR', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 145, fechaAdquisicion: new Date('2023-03-08') },
    { codigo: 'INV-009', nombre: 'Cable Jack 1/4 3m', categoria: 'CABLE', marca: 'Planet Waves', modelo: 'Classic Series', estado: 'DISPONIBLE', ubicacion: 'Estudio B', valorCompra: 45, fechaAdquisicion: new Date('2023-09-22') },
    { codigo: 'INV-010', nombre: 'Cable instrumento 6m', categoria: 'CABLE', marca: 'Fender', modelo: 'Professional', estado: 'EN_REPARACION', ubicacion: 'Almacén', valorCompra: 70, fechaAdquisicion: new Date('2022-04-15'), notas: 'Jack suelto, requiere cambio' },
    // Interfaces
    { codigo: 'INV-011', nombre: 'Universal Audio Apollo Twin X DUO', categoria: 'INTERFACE', marca: 'Universal Audio', modelo: 'Apollo Twin X DUO', numeroSerie: 'APOLLO-2023-011', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 3200, fechaAdquisicion: new Date('2023-01-10') },
    { codigo: 'INV-012', nombre: 'Focusrite Scarlett 18i20', categoria: 'INTERFACE', marca: 'Focusrite', modelo: 'Scarlett 18i20 Gen 3', numeroSerie: 'SCAR-2022-012', estado: 'DISPONIBLE', ubicacion: 'Estudio B', valorCompra: 1100, fechaAdquisicion: new Date('2022-06-08') },
    // Instrumentos
    { codigo: 'INV-013', nombre: 'Fender Player Stratocaster', categoria: 'INSTRUMENTO', marca: 'Fender', modelo: 'Player Stratocaster MN', numeroSerie: 'STRAT-2023-013', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 2800, fechaAdquisicion: new Date('2023-04-18') },
    { codigo: 'INV-014', nombre: 'Fender Player Precision Bass', categoria: 'INSTRUMENTO', marca: 'Fender', modelo: 'Player Precision Bass', numeroSerie: 'PBASS-2023-014', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 2400, fechaAdquisicion: new Date('2023-04-18') },
    { codigo: 'INV-015', nombre: 'Yamaha P-125 Digital Piano', categoria: 'INSTRUMENTO', marca: 'Yamaha', modelo: 'P-125', numeroSerie: 'P125-2022-015', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 1900, fechaAdquisicion: new Date('2022-09-30') },
    { codigo: 'INV-016', nombre: 'Batería Pearl Export EXX 5 pc', categoria: 'INSTRUMENTO', marca: 'Pearl', modelo: 'Export EXX 5-piece', numeroSerie: 'PEARL-2023-016', estado: 'EN_USO', ubicacion: 'Sala Ensayo', valorCompra: 3400, fechaAdquisicion: new Date('2023-07-12') },
    // Monitores
    { codigo: 'INV-017', nombre: 'Yamaha HS8', categoria: 'MONITOR', marca: 'Yamaha', modelo: 'HS8', numeroSerie: 'HS8-L-2023-017', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 850, fechaAdquisicion: new Date('2023-02-15'), notas: 'Monitor izquierdo' },
    { codigo: 'INV-018', nombre: 'Yamaha HS8', categoria: 'MONITOR', marca: 'Yamaha', modelo: 'HS8', numeroSerie: 'HS8-R-2023-018', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 850, fechaAdquisicion: new Date('2023-02-15'), notas: 'Monitor derecho' },
    { codigo: 'INV-019', nombre: 'KRK Rokit 5 G4', categoria: 'MONITOR', marca: 'KRK', modelo: 'Rokit 5 G4', numeroSerie: 'KRK5-L-2022-019', estado: 'DISPONIBLE', ubicacion: 'Estudio B', valorCompra: 480, fechaAdquisicion: new Date('2022-12-10') },
    { codigo: 'INV-020', nombre: 'KRK Rokit 5 G4', categoria: 'MONITOR', marca: 'KRK', modelo: 'Rokit 5 G4', numeroSerie: 'KRK5-R-2022-020', estado: 'DISPONIBLE', ubicacion: 'Estudio B', valorCompra: 480, fechaAdquisicion: new Date('2022-12-10') },
    // Accesorios
    { codigo: 'INV-021', nombre: 'Auriculares Beyerdynamic DT 770 Pro 80ohm', categoria: 'ACCESORIO', marca: 'Beyerdynamic', modelo: 'DT 770 Pro 80', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 380, fechaAdquisicion: new Date('2023-01-15') },
    { codigo: 'INV-022', nombre: 'Auriculares Sony MDR-7506', categoria: 'ACCESORIO', marca: 'Sony', modelo: 'MDR-7506', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 280, fechaAdquisicion: new Date('2023-01-15') },
    { codigo: 'INV-023', nombre: 'Stand de micrófono K&M 210/9', categoria: 'ACCESORIO', marca: 'K&M', modelo: '210/9', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 180, fechaAdquisicion: new Date('2023-03-20') },
    { codigo: 'INV-024', nombre: 'Stand de micrófono K&M 210/9', categoria: 'ACCESORIO', marca: 'K&M', modelo: '210/9', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 180, fechaAdquisicion: new Date('2023-03-20') },
    { codigo: 'INV-025', nombre: 'Filtro pop noise Ronchs', categoria: 'ACCESORIO', marca: 'Ronchs', modelo: 'Double Layer', estado: 'DISPONIBLE', ubicacion: 'Estudio A', valorCompra: 65, fechaAdquisicion: new Date('2023-05-08') },
  ]
  const items = await Promise.all(inventarioData.map((data) => db.inventarioItem.create({ data })))

  console.log('📝 Creando préstamos de inventario...')
  const proyectos = await db.proyecto.findMany()
  // Prestar SM58 a Airbag (banda en un proyecto)
  const proyectoAirbag = proyectos.find(p => p.codigo === 'PRY-2026-002')
  if (proyectoAirbag) {
    await db.prestamo.create({
      data: {
        itemId: items[3].id, // SM58
        proyectoId: proyectoAirbag.id,
        prestadoA: 'Banda Airbag',
        fechaPrestamo: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        fechaDevolucionEsperada: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
        estado: 'ACTIVO',
        notas: 'Para ensayo pre-producción de 6 sencillos',
      },
    })
  }

  console.log('🛠️ Creando mantenimientos...')
  await db.mantenimiento.create({
    data: {
      itemId: items[9].id, // Cable instrumento roto
      tipo: 'CORRECTIVO',
      descripcion: 'Cambio de jack 1/4 - conexión suelta',
      fechaInicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      costo: 35,
      proveedor: 'Audio Center Lima',
      estado: 'EN_PROCESO',
    },
  })
  // Mantenimiento preventivo programado para Apollo Twin
  await db.mantenimiento.create({
    data: {
      itemId: items[10].id, // Apollo Twin
      tipo: 'PREVENTIVO',
      descripcion: 'Limpieza de conectores y actualización de firmware',
      fechaInicio: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      estado: 'PROGRAMADO',
    },
  })

  console.log('⏰ Creando registros de asistencia (últimos 7 días)...')
  const users = await db.user.findMany({ where: { role: { in: ['ADMIN', 'PRODUCTOR', 'A&R'] } } })
  const hoy = new Date()
  for (let diasAtras = 6; diasAtras >= 0; diasAtras--) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() - diasAtras)
    // Saltar domingos (day = 0)
    if (fecha.getDay() === 0) continue

    for (const u of users) {
      // Check-in entre 8:30 y 9:30am
      const checkIn = new Date(fecha)
      checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)
      // Check-out entre 6pm y 7pm (si no es hoy)
      const checkOut = (diasAtras === 0 && hoy.getHours() < 18) ? null : (() => {
        const co = new Date(fecha)
        co.setHours(18 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)
        return co
      })()

      const horas = checkOut ? (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) : 0
      const estado = diasAtras === 0 && !checkOut ? 'ACTIVO' : (Math.random() < 0.1 ? 'AUSENTE' : 'COMPLETADO')

      await db.registroAsistencia.create({
        data: {
          userId: u.id,
          fecha,
          checkIn: estado === 'AUSENTE' ? null : checkIn,
          checkOut: estado === 'AUSENTE' ? null : checkOut,
          horasTrabajadas: estado === 'AUSENTE' ? 0 : Number(horas.toFixed(2)),
          estado,
          observaciones: estado === 'AUSENTE' ? 'Licencia médica' : null,
        },
      })
    }
  }

  console.log('📊 Creando informe mensual del mes actual...')
  // Generar informe del mes actual
  const mesActual = hoy.getMonth() + 1
  const anioActual = hoy.getFullYear()
  const ingresos = await db.ingreso.findMany({ where: { estado: 'CONFIRMADO' } })
  const egresos = await db.egreso.findMany({ where: { estado: 'CONFIRMADO' } })
  const todosProyectos = await db.proyecto.findMany()
  const tareas = await db.tarea.findMany()
  const contactos = await db.contacto.findMany()

  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0)
  const totalEgresos = egresos.reduce((s, e) => s + e.monto, 0)

  const datosInforme = {
    periodo: { mes: mesActual, anio: anioActual },
    empresa: { nombre: 'SEAGULL RECORDS S.A.C.', ruc: '20612281352' },
    resumen: {
      totalIngresos,
      totalEgresos,
      utilidadNeta: totalIngresos - totalEgresos,
      margenUtilidad: totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0,
    },
    proyectos: {
      activos: todosProyectos.filter(p => p.estadoGeneral === 'ACTIVO').length,
      entregados: todosProyectos.filter(p => p.estadoGeneral === 'ENTREGADO').length,
      total: todosProyectos.length,
    },
    tareas: {
      pendientes: tareas.filter(t => t.estado === 'PENDIENTE').length,
      completadas: tareas.filter(t => t.estado === 'COMPLETADA').length,
      total: tareas.length,
    },
    contactos: {
      activos: contactos.filter(c => c.estado === 'CLIENTE_ACTIVO').length,
      total: contactos.length,
    },
    topIngresos: ingresos.sort((a, b) => b.monto - a.monto).slice(0, 5).map(i => ({
      concepto: i.concepto,
      monto: i.monto,
    })),
    egresosPorCategoria: egresos.reduce((acc, e) => {
      acc[e.categoria] = (acc[e.categoria] || 0) + e.monto
      return acc
    }, {} as Record<string, number>),
  }

  await db.informeMensual.upsert({
    where: { mes_anio: { mes: mesActual, anio: anioActual } },
    update: { datosJson: JSON.stringify(datosInforme) },
    create: {
      mes: mesActual,
      anio: anioActual,
      datosJson: JSON.stringify(datosInforme),
      estado: 'GENERADO',
    },
  })

  console.log('🔌 Creando credenciales placeholder...')
  // Credenciales vacías para que el usuario las configure
  await db.credencial.upsert({
    where: { servicio: 'GOOGLE_OAUTH' },
    update: {},
    create: {
      servicio: 'GOOGLE_OAUTH',
      datos: JSON.stringify({ clientId: '', clientSecret: '', refreshToken: '', redirectUri: '' }),
      activo: false,
      notas: 'Configurar en Google Cloud Console - pendiente',
    },
  })
  await db.credencial.upsert({
    where: { servicio: 'TELEGRAM_BOT' },
    update: {},
    create: {
      servicio: 'TELEGRAM_BOT',
      datos: JSON.stringify({
        botToken: '',
        chatIds: {
          'Martha': '',
          'Aarón': '',
          'Caleb': '',
          'Oseías': '',
        },
        grupoEquipo: '',
      }),
      activo: false,
      notas: 'Crear bot con @BotFather en Telegram - pendiente',
    },
  })
  await db.credencial.upsert({
    where: { servicio: 'GMAIL' },
    update: {},
    create: {
      servicio: 'GMAIL',
      datos: JSON.stringify({ email: 'seagull.records.99@gmail.com', appPassword: '' }),
      activo: false,
      notas: 'Generar App Password en Gmail - pendiente',
    },
  })

  console.log('✅ Seed extendido completo!')
  console.log(`   - ${inventarioData.length} items de inventario`)
  console.log(`   - 1 préstamo activo`)
  console.log(`   - 2 mantenimientos`)
  console.log(`   - Registros de asistencia de últimos 7 días`)
  console.log(`   - 1 informe mensual (${mesActual}/${anioActual})`)
  console.log(`   - 3 credenciales placeholder (Google, Telegram, Gmail)`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
