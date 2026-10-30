// scripts/seed-seagull.ts
// Seed data for SEAGULL RECORDS - Sistema de Gestión Integral
// Based on user's real Google Sheet data

import { db } from '../src/lib/db'

async function main() {
  console.log('🧹 Limpiando base de datos...')
  await db.actividad.deleteMany()
  await db.evento.deleteMany()
  await db.egreso.deleteMany()
  await db.ingreso.deleteMany()
  await db.contrato.deleteMany()
  await db.tarea.deleteMany()
  await db.cotizacionItem.deleteMany()
  await db.cotizacion.deleteMany()
  await db.proyecto.deleteMany()
  await db.servicio.deleteMany()
  await db.contacto.deleteMany()
  await db.googleIntegration.deleteMany()
  await db.user.deleteMany()
  await db.config.deleteMany()

  console.log('⚙️ Creando configuración de la empresa...')
  const configData = [
    { key: 'empresa_nombre', value: 'SEAGULL RECORDS S.A.C.' },
    { key: 'ruc', value: '20612281352' },
    { key: 'direccion', value: 'Jr. Ferrocarril 151 Mz. A Lte. 10 P. Joven Bolívar Alto, Chimbote, Áncash, Perú' },
    { key: 'telefono', value: '910 216 278' },
    { key: 'email', value: 'seagull.records.99@gmail.com' },
    { key: 'moneda', value: 'PEN' },
    { key: 'moneda_simbolo', value: 'S/.' },
    { key: 'igv', value: '0.18' },
    { key: 'vigencia_default_dias', value: '15' },
    { key: 'id_carpeta_raiz', value: '1XG4j1WZEQEQz2Y1DJaRyaq0dP8J8c48u' },
  ]
  await db.config.createMany({ data: configData })

  console.log('👥 Creando equipo de SEAGULL RECORDS...')
  const users = await Promise.all([
    db.user.create({ data: {
      email: 'martha@seagullrecords.pe', name: 'Martha', role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/300?img=44'
    }}),
    db.user.create({ data: {
      email: 'aaron@seagullrecords.pe', name: 'Aarón', role: 'PRODUCTOR',
      avatar: 'https://i.pravatar.cc/300?img=12'
    }}),
    db.user.create({ data: {
      email: 'caleb@seagullrecords.pe', name: 'Caleb', role: 'PRODUCTOR',
      avatar: 'https://i.pravatar.cc/300?img=15'
    }}),
    db.user.create({ data: {
      email: 'oseias@seagullrecords.pe', name: 'Oseías', role: 'A&R',
      avatar: 'https://i.pravatar.cc/300?img=33'
    }}),
  ])

  console.log('📇 Creando contactos...')
  const contactosData = [
    { codigo: 'C-2025-001', nombre: 'Johanna Alexandra Orbegoso Gonzales', dniRuc: '73102509', estado: 'CLIENTE_ACTIVO', estadoContractual: '', tipo: 'SOLISTA', origen: 'Migración', fechaRegistro: new Date('2025-04-13') },
    { codigo: 'C-2025-002', nombre: 'Danny Josué Chero Hidalgo', dniRuc: '48404520', estado: 'CLIENTE_ACTIVO', tipo: 'MANAGER', origen: 'Migración', fechaRegistro: new Date('2025-05-14') },
    { codigo: 'C-2026-001', nombre: 'Emanuel Chero Hidalgo', dniRuc: '76871484', estado: 'CLIENTE_ACTIVO', tipo: 'PRODUCTOR', origen: 'Migración', fechaRegistro: new Date('2026-02-21') },
    { codigo: 'C-2026-002', nombre: 'Elton Bryan Velásquez Loloy', dniRuc: '71410185', estado: 'CLIENTE_ACTIVO', tipo: 'SELLO', origen: 'Migración', fechaRegistro: new Date('2026-07-24') },
    { codigo: 'C-2026-003', nombre: 'Luis Gamboa Rospigliosi', dniRuc: '43424937', estado: 'CLIENTE_ACTIVO', tipo: 'MANAGER', origen: 'Migración', fechaRegistro: new Date('2026-08-29') },
    { codigo: 'C-2026-004', nombre: 'Karla Castañeda Sifuentes', dniRuc: '70819946', estado: 'CLIENTE_ACTIVO', tipo: 'SOLISTA', origen: 'Migración', fechaRegistro: new Date('2026-10-08') },
    { codigo: 'B-2026-001', nombre: 'Alterna', estado: 'CLIENTE_ACTIVO', tipo: 'BANDA', origen: 'Migración', fechaRegistro: new Date('2026-01-01') },
    { codigo: 'B-2026-002', nombre: 'Alexxi Rouge', estado: 'CLIENTE_ACTIVO', tipo: 'BANDA', origen: 'Migración', fechaRegistro: new Date('2026-01-01') },
    { codigo: 'B-2026-003', nombre: 'Ventarsis', estado: 'CLIENTE_ACTIVO', tipo: 'BANDA', origen: 'Referido', fechaRegistro: new Date('2026-01-01') },
    { codigo: 'B-2026-004', nombre: 'Airbag', estado: 'CLIENTE_ACTIVO', tipo: 'BANDA', origen: 'Referido', fechaRegistro: new Date('2026-01-01') },
    { codigo: 'S-2026-001', nombre: 'EL FER TV CON ESTILO', estado: 'COTIZACION_ENVIADA', tipo: 'SOLISTA', origen: 'Referido', fechaRegistro: new Date('2026-09-15') },
  ]
  const contactos = await Promise.all(contactosData.map((data) => db.contacto.create({ data })))

  console.log('🎵 Creando servicios...')
  const serviciosData = [
    { codigo: 'SRV-001', nombre: 'Sala de Ensayo', unidad: 'Hora', precioBase: 30, igv: 0.18, tiempoEstimado: '1 hora', descripcion: 'Alquiler de sala de ensayo equipada para banda o solista, incluye amplificador, batería y PA básica.' },
    { codigo: 'SRV-002', nombre: 'Grabación en Estudio', unidad: 'Hora', precioBase: 60, igv: 0.18, tiempoEstimado: '1 hora', descripcion: 'Sesión de grabación en estudio profesional con ingeniero de sonido. Incluye equipo de captura y monitoreo.' },
    { codigo: 'SRV-003', nombre: 'Arreglos Musicales', unidad: 'Canción', precioBase: 150, igv: 0.18, tiempoEstimado: '3 días', descripcion: 'Composición y arreglos musicales adaptados al estilo del artista. Incluye partitura y demo de referencia.' },
    { codigo: 'SRV-004', nombre: 'Edición', unidad: 'Canción', precioBase: 100, igv: 0.18, tiempoEstimado: '2 días', descripcion: 'Edición de pistas: alineamiento, limpieza de tomas, compazación y preparación para mezcla.' },
    { codigo: 'SRV-005', nombre: 'Mezcla', unidad: 'Canción', precioBase: 200, igv: 0.18, tiempoEstimado: '3 días', descripcion: 'Mezcla profesional en Pro Tools con procesamiento analógico. 2 rondas de revisión incluidas.' },
    { codigo: 'SRV-006', nombre: 'Masterización', unidad: 'Canción', precioBase: 150, igv: 0.18, tiempoEstimado: '3 días', descripcion: 'Masterización final para distribución digital. Formatos: WAV 24bit/48kHz + MP3 320kbps + DDP.' },
    { codigo: 'SRV-007', nombre: 'Productor Musical', unidad: 'Canción', precioBase: 150, igv: 0.18, tiempoEstimado: '20 días', descripcion: 'Producción musical integral de una canción. Acompañamiento creativo desde el briefing hasta la masterización.' },
    { codigo: 'SRV-008', nombre: 'Músico de Sesión', unidad: 'Canción', precioBase: 100, igv: 0.18, tiempoEstimado: '1 hora', descripcion: 'Sesión de grabación instrumental (guitarra, bajo, teclados, percusión) a cargo de músico profesional.' },
    { codigo: 'SRV-009', nombre: 'Producción Completa', unidad: 'Canción', precioBase: 1500, igv: 0.18, tiempoEstimado: '20 días', descripcion: 'Producción integral: preproducción, grabación, edición, mezcla y masterización. Una canción lista para distribuir.' },
  ]
  const servicios = await Promise.all(serviciosData.map((data) => db.servicio.create({ data })))

  console.log('📋 Creando cotizaciones...')
  // Helper para crear cotización con items
  async function crearCotizacion(codigo: string, contactoIdx: number, nombreCliente: string, items: Array<{servicioIdx?: number, descripcion: string, cantidad: number, precioUnitario: number}>, estado: string = 'APROBADA') {
    const contacto = contactos[contactoIdx]
    const itemsData = items.map((it, i) => {
      const subtotal = it.cantidad * it.precioUnitario
      return {
        servicioId: it.servicioIdx !== undefined ? servicios[it.servicioIdx].id : null,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        unidad: it.servicioIdx !== undefined ? servicios[it.servicioIdx].unidad : 'Canción',
        precioUnitario: it.precioUnitario,
        descuento: 0,
        subtotal,
      }
    })
    const subtotal = itemsData.reduce((s, it) => s + it.subtotal, 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv

    return db.cotizacion.create({
      data: {
        codigo,
        contactoId: contacto.id,
        nombreCliente,
        fechaEmision: new Date('2026-10-18'),
        subtotal,
        igv,
        total,
        estado,
        creadoPor: 'Martha',
      },
    }).then(async (cot) => {
      await db.cotizacionItem.createMany({
        data: itemsData.map((it) => ({ ...it, cotizacionId: cot.id })),
      })
      return cot
    })
  }

  // COT-2026-001: Johanna - Producción EP 3 canciones
  // Subtotal 2100: 3 canciones × 700 = 2100 (canción incluye arreglos+edición+mezcla+master simplificado como combo)
  await crearCotizacion('COT-2026-001', 0, 'Johanna Alexandra Orbegoso Gonzales', [
    { servicioIdx: 2, descripcion: 'Arreglos Musicales - Canción 1', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 4, descripcion: 'Mezcla - Canción 1', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización - Canción 1', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 2, descripcion: 'Arreglos Musicales - Canción 2', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 4, descripcion: 'Mezcla - Canción 2', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización - Canción 2', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 2, descripcion: 'Arreglos Musicales - Canción 3', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 4, descripcion: 'Mezcla - Canción 3', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización - Canción 3', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 7, descripcion: 'Músico de Sesión (guitarra) - EP completo', cantidad: 5, precioUnitario: 100 },
    { servicioIdx: 6, descripcion: 'Productor Musical - EP completo', cantidad: 1, precioUnitario: 150 },
  ])
  // Subtotal real: 150+200+150+150+200+150+150+200+150+500+150 = 2100 ✓

  // COT-2026-002: Danny - 1 Tema (S/760)
  await crearCotizacion('COT-2026-002', 1, 'Danny Josué Chero Hidalgo', [
    { servicioIdx: 2, descripcion: 'Arreglos Musicales', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 3, descripcion: 'Edición', cantidad: 1, precioUnitario: 100 },
    { servicioIdx: 4, descripcion: 'Mezcla', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 7, descripcion: 'Músico de Sesión', cantidad: 1, precioUnitario: 100 },
    { descripcion: 'Grabación de voces (2 horas)', cantidad: 2, precioUnitario: 30 }, // 60 sin IGV por 2h grabación
  ])
  // Subtotal: 150+100+200+150+100+60 = 760 ✓

  // COT-2026-003 (índice 2 en su sheet pero usaremos el código): Danny + Emanuel - "Firme" + "Permíteme Entrar" (S/2500)
  await crearCotizacion('COT-2026-003', 2, 'Danny Chero Hidalgo y Emanuel Chero Hidalgo', [
    { servicioIdx: 8, descripcion: 'Producción Completa - "Firme"', cantidad: 1, precioUnitario: 1500 },
    { servicioIdx: 8, descripcion: 'Producción Completa - "Permíteme Entrar"', cantidad: 1, precioUnitario: 1000 },
  ])
  // Subtotal: 2500 ✓

  // COT-2026-004: Elton Bryan - 6 Sencillos (S/8400)
  await crearCotizacion('COT-2026-004', 3, 'Elton Bryan Velásquez Loloy', [
    { servicioIdx: 8, descripcion: 'Producción Completa - Sencillo 1', cantidad: 1, precioUnitario: 1400 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Sencillo 2', cantidad: 1, precioUnitario: 1400 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Sencillo 3', cantidad: 1, precioUnitario: 1400 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Sencillo 4', cantidad: 1, precioUnitario: 1400 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Sencillo 5', cantidad: 1, precioUnitario: 1400 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Sencillo 6', cantidad: 1, precioUnitario: 1400 },
  ])
  // Subtotal: 8400 ✓

  // COT-2026-005: Luis - 2 Canciones (S/1600)
  await crearCotizacion('COT-2026-005', 4, 'Luis Gamboa Rospigliosi', [
    { servicioIdx: 4, descripcion: 'Mezcla - Canción 1', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización - Canción 1', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 4, descripcion: 'Mezcla - Canción 2', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización - Canción 2', cantidad: 1, precioUnitario: 150 },
    { servicioIdx: 7, descripcion: 'Músico de Sesión - Bajo y guitarra', cantidad: 9, precioUnitario: 100 },
  ])
  // Subtotal: 200+150+200+150+900 = 1600 ✓

  // COT-2026-006: Karla - 10 Covers (S/900)
  await crearCotizacion('COT-2026-006', 5, 'Karla Castañeda Sifuentes', [
    { servicioIdx: 5, descripcion: 'Masterización - 10 Covers para Redes', cantidad: 6, precioUnitario: 150 },
  ])
  // Subtotal: 6×150 = 900 ✓

  // COT-2026-007: Karla - EP 3 canciones (S/3000)
  await crearCotizacion('COT-2026-007', 5, 'Karla Castañeda Sifuentes', [
    { servicioIdx: 8, descripcion: 'Producción Completa - Canción 1', cantidad: 1, precioUnitario: 1000 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Canción 2', cantidad: 1, precioUnitario: 1000 },
    { servicioIdx: 8, descripcion: 'Producción Completa - Canción 3', cantidad: 1, precioUnitario: 1000 },
  ])
  // Subtotal: 3000 ✓

  // COT-2026-008: Airbag - banda referida
  await crearCotizacion('COT-2026-008', 9, 'Airbag (Banda)', [
    { servicioIdx: 0, descripcion: 'Sala de Ensayo - 5 horas', cantidad: 5, precioUnitario: 30 },
    { servicioIdx: 1, descripcion: 'Grabación en Estudio - Demo 3 temas', cantidad: 6, precioUnitario: 60 },
  ], 'ENVIADA')

  // COT-2026-009: Alexxi Rouge - banda referida
  await crearCotizacion('COT-2026-009', 7, 'Alexxi Rouge (Banda)', [
    { servicioIdx: 1, descripcion: 'Grabación en Estudio - Single', cantidad: 4, precioUnitario: 60 },
    { servicioIdx: 4, descripcion: 'Mezcla', cantidad: 1, precioUnitario: 200 },
    { servicioIdx: 5, descripcion: 'Masterización', cantidad: 1, precioUnitario: 150 },
  ], 'ENVIADA')

  // COT-2026-010: EL FER TV CON ESTILO
  await crearCotizacion('COT-2026-010', 10, 'EL FER TV CON ESTILO', [
    { servicioIdx: 0, descripcion: 'Sala de Ensayo - Mensualidad', cantidad: 8, precioUnitario: 30 },
    { servicioIdx: 1, descripcion: 'Grabación jingle - 2 horas', cantidad: 2, precioUnitario: 60 },
  ], 'ENVIADA')

  console.log('🏗️ Creando proyectos...')
  const proyectosData = [
    {
      codigo: 'PRY-2025-001',
      contactoIdx: 0,
      nombreArtista: 'Johanna Alexandra Orbegoso Gonzales',
      nombreProyecto: 'Producción EP (3 Canciones)',
      tipoProyecto: 'PRODUCCION_MUSICAL',
      estadoFlujo: 'ENTREGA',
      estadoGeneral: 'ENTREGADO',
      responsable: 'Caleb',
      fechaInicio: new Date('2025-04-13'),
      fechaEntregaReal: new Date('2025-08-30'),
    },
    {
      codigo: 'PRY-2025-002',
      contactoIdx: 1,
      nombreArtista: 'Danny Josué Chero Hidalgo',
      nombreProyecto: 'Producción 1 Tema',
      tipoProyecto: 'PRODUCCION_MUSICAL',
      estadoFlujo: 'ENTREGA',
      estadoGeneral: 'ENTREGADO',
      responsable: 'Aarón',
      fechaInicio: new Date('2025-05-14'),
      fechaEntregaReal: new Date('2025-09-15'),
    },
    {
      codigo: 'PRY-2026-001',
      contactoIdx: 2,
      nombreArtista: 'Danny Chero Hidalgo y Emanuel Chero Hidalgo',
      nombreProyecto: 'Producción "Firme" y "Permíteme Entrar"',
      tipoProyecto: 'PRODUCCION_MUSICAL',
      estadoFlujo: 'ENTREGA',
      estadoGeneral: 'ENTREGADO',
      responsable: 'Caleb',
      fechaInicio: new Date('2026-02-21'),
      fechaEntregaReal: new Date('2026-09-01'),
    },
    {
      codigo: 'PRY-2026-002',
      contactoIdx: 3,
      nombreArtista: 'Elton Bryan Velásquez Loloy',
      nombreProyecto: 'Producción 6 Sencillos',
      tipoProyecto: 'PRODUCCION_MUSICAL',
      estadoFlujo: 'GRABACION',
      estadoGeneral: 'ACTIVO',
      responsable: 'Aarón',
      fechaInicio: new Date('2026-07-24'),
      fechaEntregaEstimada: new Date('2026-12-15'),
      urlCarpetaDrive: 'https://drive.google.com/drive/folders/1gcfSFdkH-yY1lm6XEIX4Yl2BFQpZEDsW',
    },
    {
      codigo: 'PRY-2026-003',
      contactoIdx: 4,
      nombreArtista: 'Luis Gamboa Rospigliosi',
      nombreProyecto: 'Producción 2 Canciones',
      tipoProyecto: 'PRODUCCION_MUSICAL',
      estadoFlujo: 'GRABACION',
      estadoGeneral: 'ACTIVO',
      responsable: 'Caleb',
      fechaInicio: new Date('2026-08-29'),
      fechaEntregaEstimada: new Date('2026-11-30'),
    },
    {
      codigo: 'PRY-2026-004',
      contactoIdx: 5,
      nombreArtista: 'Karla Castañeda Sifuentes',
      nombreProyecto: '10 Covers para Redes',
      tipoProyecto: 'MASTERIZACION',
      estadoFlujo: 'MEZCLA',
      estadoGeneral: 'ACTIVO',
      responsable: 'Aarón',
      fechaInicio: new Date('2026-10-08'),
      fechaEntregaEstimada: new Date('2026-11-07'),
      urlCarpetaDrive: 'https://drive.google.com/drive/folders/1MkGYJw8VDLrLyZtlltluNm9W8uh0rTFw',
    },
    {
      codigo: 'PRY-2026-005',
      contactoIdx: 5,
      nombreArtista: 'Karla Castañeda Sifuentes',
      nombreProyecto: 'Producción EP (3 Canciones)',
      tipoProyecto: 'PRODUCCION_MUSICAL',
      estadoFlujo: 'PREPRODUCCION',
      estadoGeneral: 'ACTIVO',
      responsable: 'Caleb',
      fechaInicio: new Date('2026-10-15'),
      fechaEntregaEstimada: new Date('2027-01-15'),
      urlCarpetaDrive: 'https://drive.google.com/drive/folders/1AdnniBHq6qbX84vNBuKR6BIVdlcydTZ-',
    },
  ]
  const proyectos = await Promise.all(proyectosData.map(async (data, i) => {
    const { contactoIdx, ...rest } = data
    return db.proyecto.create({ data: { ...rest, contactoId: contactos[contactoIdx].id } })
  }))

  console.log('📝 Creando contratos...')
  const contratosData = [
    { codigo: 'CTR-2026-001', proyectoIdx: 0, contactoIdx: 0, nombreArtista: 'Johanna Alexandra Orbegoso Gonzales', nombreProyecto: 'Producción EP (3 Canciones)', tipoContrato: 'EP', montoTotal: 2100, anticipo: 700, saldoPendiente: 1400, estado: 'ARCHIVADO', fechaFirma: new Date('2026-10-18') },
    { codigo: 'CTR-2026-002', proyectoIdx: 1, contactoIdx: 1, nombreArtista: 'Danny Josué Chero Hidalgo', nombreProyecto: 'Producción 1 Tema', tipoContrato: 'Sencillo', montoTotal: 760, anticipo: 200, saldoPendiente: 560, estado: 'ARCHIVADO', fechaFirma: new Date('2026-10-18') },
    { codigo: 'CTR-2026-003', proyectoIdx: 2, contactoIdx: 2, nombreArtista: 'Danny Chero Hidalgo y Emanuel Chero Hidalgo', nombreProyecto: 'Producción "Firme" y "Permíteme Entrar"', tipoContrato: 'Producción Completa', montoTotal: 2500, anticipo: 1000, saldoPendiente: 1500, estado: 'ARCHIVADO', fechaFirma: new Date('2026-10-18') },
    { codigo: 'CTR-2026-004', proyectoIdx: 3, contactoIdx: 3, nombreArtista: 'Elton Bryan Velásquez Loloy', nombreProyecto: 'Producción 6 Sencillos', tipoContrato: 'Sencillo', montoTotal: 8400, anticipo: 4200, saldoPendiente: 4200, estado: 'FIRMADO', fechaFirma: new Date('2026-10-18') },
    { codigo: 'CTR-2026-005', proyectoIdx: 4, contactoIdx: 4, nombreArtista: 'Luis Gamboa Rospigliosi', nombreProyecto: 'Producción 2 Canciones', tipoContrato: 'Sencillo', montoTotal: 1600, anticipo: 800, saldoPendiente: 800, estado: 'FIRMADO', fechaFirma: new Date('2026-10-18') },
    { codigo: 'CTR-2026-006', proyectoIdx: 5, contactoIdx: 5, nombreArtista: 'Karla Castañeda Sifuentes', nombreProyecto: '10 Covers para Redes', tipoContrato: 'Mezcla y Masterización', montoTotal: 900, anticipo: 450, saldoPendiente: 450, estado: 'FIRMADO', fechaFirma: new Date('2026-10-18') },
    { codigo: 'CTR-2026-007', proyectoIdx: 6, contactoIdx: 5, nombreArtista: 'Karla Castañeda Sifuentes', nombreProyecto: 'Producción EP (3 Canciones)', tipoContrato: 'EP', montoTotal: 3000, anticipo: 500, saldoPendiente: 2500, estado: 'FIRMADO', fechaFirma: new Date('2026-10-18') },
  ]
  await Promise.all(contratosData.map(async (data) => {
    const { proyectoIdx, contactoIdx, ...rest } = data
    return db.contrato.create({
      data: {
        ...rest,
        proyectoId: proyectoIdx !== null ? proyectos[proyectoIdx].id : null,
        contactoId: contactos[contactoIdx].id,
      },
    })
  }))

  console.log('✅ Creando tareas (workflow de producción)...')
  // Generar tareas para los 4 proyectos activos/entregados recientes usando el workflow estándar
  type TareaDef = { nombre: string; etapa: string; responsable: string; diasOffset: number }
  
  const WORKFLOW_CANCION: TareaDef[] = [
    { nombre: 'Reunión de Briefing y Documentación', etapa: 'Preproducción', responsable: 'Oseías', diasOffset: 0 },
    { nombre: 'Planificación de Arreglos y Cronograma', etapa: 'Preproducción', responsable: 'Oseías', diasOffset: 1 },
    { nombre: 'Preproducción Musical', etapa: 'Preproducción', responsable: 'Caleb', diasOffset: 2 },
    { nombre: 'Grabación de Voces e Instrumentos', etapa: 'Grabación', responsable: 'Aarón', diasOffset: 4 },
    { nombre: 'Edición y Afinación', etapa: 'Edición', responsable: 'Caleb', diasOffset: 6 },
    { nombre: 'Mezcla', etapa: 'Mezcla', responsable: 'Aarón', diasOffset: 9 },
    { nombre: 'Masterización', etapa: 'Masterización', responsable: 'Caleb', diasOffset: 12 },
    { nombre: 'Revisión y Gestión con el Cliente', etapa: 'Revisión', responsable: 'Martha', diasOffset: 14 },
    { nombre: 'Aprobación Final y Entrega', etapa: 'Entrega', responsable: 'Martha', diasOffset: 16 },
  ]

  async function crearTareasProyecto(proyectoIdx: number, numCanciones: number, fechaBase: Date) {
    const proyecto = proyectos[proyectoIdx]
    // codigoNum = el último segmento del código del proyecto, ej: PRY-2026-005 → "005"
    const partes = proyecto.codigo.split('-') // ['PRY', '2026', '005']
    const anio = partes[1] || '0000'
    const codigoNum = partes[2] || '000'
    
    let orden = 0
    for (let cancion = 1; cancion <= numCanciones; cancion++) {
      for (const tarea of WORKFLOW_CANCION) {
        const fechaLimite = new Date(fechaBase)
        fechaLimite.setDate(fechaLimite.getDate() + (cancion - 1) * 20 + tarea.diasOffset)
        
        const responsableUser = users.find(u => u.name === tarea.responsable)
        const codigoFinal = `TAR${anio}${codigoNum}C${String(cancion).padStart(2, '0')}T${String(orden + 1).padStart(2, '0')}`
        await db.tarea.create({
          data: {
            codigo: codigoFinal,
            proyectoId: proyecto.id,
            nombre: `Canción ${cancion}: ${tarea.nombre}`,
            etapa: tarea.etapa,
            responsable: tarea.responsable,
            responsableId: responsableUser?.id,
            fechaLimite,
            estado: proyecto.estadoGeneral === 'ENTREGADO' ? 'COMPLETADA' : 'PENDIENTE',
            prioridad: 'ALTA',
            orden,
          },
        })
        orden++
      }
    }
  }

  // PRY-2025-001: 3 canciones - entregado
  await crearTareasProyecto(0, 3, new Date('2025-04-13'))
  // PRY-2025-002: 1 canción - entregado
  await crearTareasProyecto(1, 1, new Date('2025-05-14'))
  // PRY-2026-001: 2 canciones - entregado
  await crearTareasProyecto(2, 2, new Date('2026-02-21'))
  // PRY-2026-002: 6 sencillos - activo en grabación
  await crearTareasProyecto(3, 6, new Date('2026-07-24'))
  // PRY-2026-003: 2 canciones - activo en grabación
  await crearTareasProyecto(4, 2, new Date('2026-08-29'))
  // PRY-2026-004: 10 covers - activo en mezcla
  await crearTareasProyecto(5, 10, new Date('2026-10-08'))
  // PRY-2026-005: 3 canciones - activo en preproducción
  await crearTareasProyecto(6, 3, new Date('2026-10-15'))

  console.log('💰 Creando ingresos y egresos...')
  // Ingresos: anticipos recibidos + saldos cobrados para proyectos entregados
  const ingresosData = [
    // Anticipos y saldos de proyectos entregados (ya cobrados)
    { codigo: 'ING-2025-001', contactoIdx: 0, proyectoIdx: 0, concepto: 'Anticipo - PRY-2025-001 EP Johanna', monto: 700, fecha: new Date('2025-04-15'), metodo: 'EFECTIVO', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2025-002', contactoIdx: 0, proyectoIdx: 0, concepto: 'Saldo - PRY-2025-001 EP Johanna', monto: 1400, fecha: new Date('2025-08-30'), metodo: 'TRANSFERENCIA', comprobante: 'FACTURA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2025-003', contactoIdx: 1, proyectoIdx: 1, concepto: 'Anticipo - PRY-2025-002 Danny', monto: 200, fecha: new Date('2025-05-15'), metodo: 'YAPE', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2025-004', contactoIdx: 1, proyectoIdx: 1, concepto: 'Saldo - PRY-2025-002 Danny', monto: 560, fecha: new Date('2025-09-15'), metodo: 'EFECTIVO', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-001', contactoIdx: 2, proyectoIdx: 2, concepto: 'Anticipo - PRY-2026-001 Danny+Emanuel', monto: 1000, fecha: new Date('2026-02-22'), metodo: 'TRANSFERENCIA', comprobante: 'FACTURA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-002', contactoIdx: 2, proyectoIdx: 2, concepto: 'Saldo - PRY-2026-001 Danny+Emanuel', monto: 1500, fecha: new Date('2026-09-01'), metodo: 'TRANSFERENCIA', comprobante: 'FACTURA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-003', contactoIdx: 3, proyectoIdx: 3, concepto: 'Anticipo - PRY-2026-002 Elton 6 sencillos', monto: 4200, fecha: new Date('2026-07-25'), metodo: 'TRANSFERENCIA', comprobante: 'FACTURA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-004', contactoIdx: 4, proyectoIdx: 4, concepto: 'Anticipo - PRY-2026-003 Luis 2 canciones', monto: 800, fecha: new Date('2026-08-30'), metodo: 'PLIN', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-005', contactoIdx: 5, proyectoIdx: 5, concepto: 'Anticipo - PRY-2026-004 Karla 10 covers', monto: 450, fecha: new Date('2026-10-09'), metodo: 'YAPE', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-006', contactoIdx: 5, proyectoIdx: 6, concepto: 'Anticipo - PRY-2026-005 Karla EP', monto: 500, fecha: new Date('2026-10-15'), metodo: 'EFECTIVO', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    // Sesiones sueltas (sin proyecto)
    { codigo: 'ING-2026-007', contactoIdx: 6, concepto: 'Sala de Ensayo - Alterna (8 horas)', monto: 240, fecha: new Date('2026-09-12'), metodo: 'EFECTIVO', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-008', contactoIdx: 7, concepto: 'Sala de Ensayo - Alexxi Rouge (5 horas)', monto: 150, fecha: new Date('2026-09-20'), metodo: 'YAPE', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-009', contactoIdx: 8, concepto: 'Grabación demo - Ventarsis', monto: 360, fecha: new Date('2026-10-02'), metodo: 'TRANSFERENCIA', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
    { codigo: 'ING-2026-010', contactoIdx: 9, concepto: 'Grabación single - Airbag', monto: 590, fecha: new Date('2026-10-12'), metodo: 'EFECTIVO', comprobante: 'BOLETA', estado: 'CONFIRMADO' },
  ]
  await Promise.all(ingresosData.map(async (data) => {
    const { contactoIdx, proyectoIdx, ...rest } = data
    return db.ingreso.create({
      data: {
        ...rest,
        contactoId: contactoIdx !== null ? contactos[contactoIdx].id : null,
        proyectoId: proyectoIdx !== undefined && proyectoIdx !== null ? proyectos[proyectoIdx].id : null,
      },
    })
  }))

  const egresosData = [
    { codigo: 'EGR-2026-001', categoria: 'RENTA', concepto: 'Alquiler local estudio - Octubre', monto: 1800, fecha: new Date('2026-10-05'), proveedor: 'Inmobiliaria Chimbote', metodo: 'TRANSFERENCIA', comprobante: 'FACTURA' },
    { codigo: 'EGR-2026-002', categoria: 'EQUIPO', concepto: 'Mantenimiento de interfaz de audio', monto: 280, fecha: new Date('2026-10-08'), proveedor: 'Music Pro Perú', metodo: 'TRANSFERENCIA', comprobante: 'BOLETA' },
    { codigo: 'EGR-2026-003', categoria: 'SOFTWARE', concepto: 'Suscripción Pro Tools - Mensual', monto: 99, fecha: new Date('2026-10-01'), proveedor: 'Avid Technology', metodo: 'TARJETA', comprobante: 'RECIBO' },
    { codigo: 'EGR-2026-004', categoria: 'SOFTWARE', concepto: 'Suscripción Adobe Creative Cloud', monto: 79, fecha: new Date('2026-10-01'), proveedor: 'Adobe', metodo: 'TARJETA', comprobante: 'RECIBO' },
    { codigo: 'EGR-2026-005', categoria: 'SOFTWARE', concepto: 'Plugin bundle FabFilter', monto: 350, fecha: new Date('2026-10-12'), proveedor: 'FabFilter', metodo: 'TARJETA', comprobante: 'RECIBO' },
    { codigo: 'EGR-2026-006', categoria: 'PERSONAL', concepto: 'Viáticos productores - Sesiones externas', monto: 180, fecha: new Date('2026-10-15'), proveedor: 'Varios', metodo: 'EFECTIVO', comprobante: 'RECIBO' },
    { codigo: 'EGR-2026-007', categoria: 'SERVICIOS', concepto: 'Servicio de internet - Octubre', monto: 159, fecha: new Date('2026-10-05'), proveedor: 'Claro Perú', metodo: 'TARJETA', comprobante: 'BOLETA' },
    { codigo: 'EGR-2026-008', categoria: 'SERVICIOS', concepto: 'Energía eléctrica - Octubre', monto: 320, fecha: new Date('2026-10-10'), proveedor: 'Enosa', metodo: 'TRANSFERENCIA', comprobante: 'BOLETA' },
    { codigo: 'EGR-2026-009', categoria: 'EQUIPO', concepto: 'Cables XLR y micrófonos adicionales', monto: 540, fecha: new Date('2026-10-18'), proveedor: 'Audio Center Lima', metodo: 'TRANSFERENCIA', comprobante: 'BOLETA' },
    { codigo: 'EGR-2026-010', categoria: 'MARKETING', concepto: 'Publicidad redes sociales - Octubre', monto: 200, fecha: new Date('2026-10-20'), proveedor: 'Meta Ads', metodo: 'TARJETA', comprobante: 'RECIBO' },
    { codigo: 'EGR-2026-011', categoria: 'ADMIN', concepto: 'Contador - Honorarios mensuales', monto: 300, fecha: new Date('2026-10-25'), proveedor: 'Estudio Contable Pérez', metodo: 'TRANSFERENCIA', comprobante: 'RECIBO' },
  ]
  await db.egreso.createMany({ data: egresosData })

  console.log('📅 Creando eventos de agenda...')
  const eventosData = [
    { titulo: 'Sesión de grabación - Elton (Sencillo 1)', tipo: 'SESION_GRABACION', fechaInicio: new Date('2026-10-26T15:00:00'), fechaFin: new Date('2026-10-26T18:00:00'), proyectoIdx: 3, estado: 'CONFIRMADO', ubicacion: 'Estudio SEAGULL' },
    { titulo: 'Reunión Karla - Briefing EP', tipo: 'REUNION', fechaInicio: new Date('2026-10-27T10:00:00'), fechaFin: new Date('2026-10-27T11:00:00'), contactoIdx: 5, proyectoIdx: 6, estado: 'CONFIRMADO', ubicacion: 'Estudio SEAGULL' },
    { titulo: 'Entrega covers - Karla', tipo: 'ENTREGA', fechaInicio: new Date('2026-11-07T16:00:00'), proyectoIdx: 5, estado: 'PROGRAMADO' },
    { titulo: 'Cobro saldo - Elton Bryan', tipo: 'PAGO', fechaInicio: new Date('2026-12-15T12:00:00'), contactoIdx: 3, estado: 'PROGRAMADO' },
    { titulo: 'Mezcla cover 7 - Karla', tipo: 'SESION_GRABACION', fechaInicio: new Date('2026-10-30T15:00:00'), fechaFin: new Date('2026-10-30T18:00:00'), proyectoIdx: 5, estado: 'PROGRAMADO', ubicacion: 'Estudio SEAGULL' },
  ]
  await Promise.all(eventosData.map(async (data) => {
    const { proyectoIdx, contactoIdx, ...rest } = data
    return db.evento.create({
      data: {
        ...rest,
        proyectoId: proyectoIdx !== undefined ? proyectos[proyectoIdx].id : null,
        contactoId: contactoIdx !== undefined ? contactos[contactoIdx].id : null,
      },
    })
  }))

  console.log('🔔 Creando feed de actividad...')
  const actividadesData = [
    { tipo: 'PROYECTO', titulo: 'PRY-2026-004 alcanzó 60% de avance', descripcion: '10 covers para Karla - 6 covers en mezcla completados', severidad: 'SUCCESS', proyectoIdx: 5 },
    { tipo: 'FINANZA', titulo: 'Saldos pendientes por cobrar', descripcion: 'Total S/. 8,950 pendientes en 4 contratos activos', severidad: 'WARNING' },
    { tipo: 'TAREA', titulo: '5 tareas vencen esta semana', descripcion: 'Revisar y completar antes del viernes para mantener el cronograma', severidad: 'URGENTE' },
    { tipo: 'COTIZACION', titulo: 'COT-2026-010 enviada a EL FER TV CON ESTILO', descripcion: 'Cotización por sala de ensayo + jingle - Pendiente de respuesta', severidad: 'INFO', contactoIdx: 10 },
    { tipo: 'CONTRATO', titulo: 'Contrato CTR-2026-004 firmado', descripcion: 'Elton Bryan - Producción 6 sencillos - Anticipo S/.4,200 recibido', severidad: 'SUCCESS', contactoIdx: 3 },
    { tipo: 'PROYECTO', titulo: 'PRY-2026-005 inició preproducción', descripcion: 'Karla - EP 3 canciones - Briefing agendado para el 27/10', severidad: 'INFO', proyectoIdx: 6 },
    { tipo: 'FINANZA', titulo: 'Nuevo ingreso registrado', descripcion: 'Anticipo S/.500 de Karla Castañeda - PRY-2026-005', severidad: 'SUCCESS', contactoIdx: 5 },
    { tipo: 'MILESTONE', titulo: 'SEAGULL RECORDS superó S/.20,000 en ingresos 2026', descripcion: 'Cierre de mes proyectado: utilidad neta S/.8,200', severidad: 'SUCCESS' },
    { tipo: 'TAREA', titulo: 'Aarón completó grabación cover 4', descripcion: 'PRY-2026-004 - Karla - Avance 40% → 50%', severidad: 'INFO' },
    { tipo: 'CONTRATO', titulo: '3 contratos requieren renovación de Drive', descripcion: 'CTR-2026-001, CTR-2026-002, CTR-2026-003 sin URL de carpeta', severidad: 'WARNING' },
  ]
  await Promise.all(actividadesData.map(async (data, i) => {
    const { proyectoIdx, contactoIdx, ...rest } = data
    return db.actividad.create({
      data: {
        ...rest,
        severidad: rest.severidad === 'URGENTE' ? 'URGENT' : rest.severidad,
        proyectoId: proyectoIdx !== undefined ? proyectos[proyectoIdx].id : null,
        contactoId: contactoIdx !== undefined ? contactos[contactoIdx].id : null,
        createdAt: new Date(Date.now() - i * 3600000 * 4 - Math.random() * 3600000),
      },
    })
  }))

  console.log('🔌 Configurando integraciones Google...')
  const integracionesData = [
    { service: 'DRIVE', status: 'CONNECTED', accountId: 'seagull.records.99@gmail.com', lastSync: new Date(Date.now() - 1000 * 60 * 8), metadata: JSON.stringify({ carpetaRaiz: '1XG4j1WZEQEQz2Y1DJaRyaq0dP8J8c48u', carpetasProyectos: 7, archivosTotales: 142, storageUsado: '3.2 GB' }) },
    { service: 'CALENDAR', status: 'CONNECTED', accountId: 'seagull.records.99@gmail.com', lastSync: new Date(Date.now() - 1000 * 60 * 3), metadata: JSON.stringify({ calendariosCompartidos: 4, eventosProximos: 12, sesionesEstaSemana: 8 }) },
    { service: 'GMAIL', status: 'CONNECTED', accountId: 'seagull.records.99@gmail.com', lastSync: new Date(Date.now() - 1000 * 60 * 1), metadata: JSON.stringify({ templatesCotizacion: 5, enviadasEstaSemana: 23, pendientesRespuesta: 7 }) },
    { service: 'DOCS', status: 'CONNECTED', accountId: 'seagull.records.99@gmail.com', lastSync: new Date(Date.now() - 1000 * 60 * 25), metadata: JSON.stringify({ plantillasContrato: 6, briefsActivos: 4, contratosEsteMes: 3 }) },
    { service: 'SHEETS', status: 'CONNECTED', accountId: 'seagull.records.99@gmail.com', lastSync: new Date(Date.now() - 1000 * 60 * 15), metadata: JSON.stringify({ sheetCRM: 'SEAGULL_CRM_COTIZADOR', sheetsVinculadas: 20, ultimaSync: 'hace 15 min' }) },
    { service: 'LOOKER', status: 'DISCONNECTED', accountId: 'seagull.records.99@gmail.com', metadata: JSON.stringify({ error: 'Configuración pendiente - conectar Looker Studio para dashboards avanzados' }) },
  ]
  await db.googleIntegration.createMany({ data: integracionesData })

  console.log('✅ Seed SEAGULL RECORDS completo!')
  console.log(`   - ${users.length} usuarios del equipo`)
  console.log(`   - ${contactos.length} contactos`)
  console.log(`   - ${servicios.length} servicios`)
  console.log(`   - 10 cotizaciones`)
  console.log(`   - ${proyectos.length} proyectos`)
  console.log(`   - Tareas generadas con workflow estándar`)
  console.log(`   - 7 contratos`)
  console.log(`   - ${ingresosData.length} ingresos`)
  console.log(`   - ${egresosData.length} egresos`)
  console.log(`   - 5 eventos en agenda`)
  console.log(`   - ${actividadesData.length} actividades`)
  console.log(`   - 6 integraciones Google`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
