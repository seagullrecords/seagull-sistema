// scripts/seed.ts
// Seed data for music label management system
// Run with: bun run scripts/seed.ts

import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Limpiando base de datos...')
  await db.activity.deleteMany()
  await db.financeTransaction.deleteMany()
  await db.marketingCampaign.deleteMany()
  await db.contract.deleteMany()
  await db.release.deleteMany()
  await db.googleIntegration.deleteMany()
  await db.user.deleteMany()
  await db.artist.deleteMany()

  console.log('👤 Creando usuarios...')
  // Crear usuarios por rol
  const adminUser = await db.user.create({
    data: {
      email: 'admin@sonidolatino.com',
      name: 'Carlos Mendoza',
      role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
  })

  const arUser = await db.user.create({
    data: {
      email: 'ana@sonidolatino.com',
      name: 'Ana Torres',
      role: 'A&R',
      avatar: 'https://i.pravatar.cc/150?img=45',
    },
  })

  const mktUser = await db.user.create({
    data: {
      email: 'diego@sonidolatino.com',
      name: 'Diego Ramírez',
      role: 'MARKETING',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
  })

  const accUser = await db.user.create({
    data: {
      email: 'lucia@sonidolatino.com',
      name: 'Lucía Fernández',
      role: 'ACCOUNTING',
      avatar: 'https://i.pravatar.cc/150?img=23',
    },
  })

  console.log('🎵 Creando artistas...')
  const artistsData = [
    {
      name: 'Luna Solar',
      realName: 'María José Vega',
      bio: 'Cantautora de electrónica experimental con raíces folklóricas latinoamericanas. Su primer álbum "Constelación" alcanzó 2M de streams en Spotify en su primer mes.',
      email: 'luna@artistas.com',
      phone: '+57 310 555 0101',
      avatar: 'https://i.pravatar.cc/300?img=47',
      coverImage: 'https://picsum.photos/seed/luna/1200/400',
      country: 'Colombia',
      city: 'Bogotá',
      genre: 'Electrónica',
      subgenres: JSON.stringify(['Folktronica', 'Downtempo', 'Ambient']),
      status: 'ACTIVE',
      tier: 'HEADLINER',
      contractType: 'EXCLUSIVE',
      signedDate: new Date('2022-03-15'),
      contractEnd: new Date('2027-03-15'),
      royaltySplit: 65,
      socialLinks: JSON.stringify({ instagram: '@lunasolar', spotify: 'lunasolar', youtube: '@lunasolarofficial' }),
      monthlyListeners: 485000,
      followersTotal: 312000,
      totalStreams: 8420000,
      driveFolderId: '1A2B3C4D5E6F7G8H9I0J',
      calendarId: 'luna@sonidolatino.com',
    },
    {
      name: 'Mateo Rítmico',
      realName: 'Mateo Cárdenas',
      bio: 'Productor de reggaetón y trap latino. Colaboraciones con artistas emergentes de la escena urbana latina. conocido por sus beats oscuros y melódicos.',
      email: 'mateo@artistas.com',
      phone: '+52 55 1234 5678',
      avatar: 'https://i.pravatar.cc/300?img=15',
      coverImage: 'https://picsum.photos/seed/mateo/1200/400',
      country: 'México',
      city: 'CDMX',
      genre: 'Reggaetón',
      subgenres: JSON.stringify(['Trap Latino', 'Drill', 'R&B']),
      status: 'ACTIVE',
      tier: 'MID',
      contractType: 'EXCLUSIVE',
      signedDate: new Date('2023-08-01'),
      contractEnd: new Date('2028-08-01'),
      royaltySplit: 55,
      socialLinks: JSON.stringify({ instagram: '@mateoritmico', spotify: 'mateo-ritmico', tiktok: '@mateoritmico' }),
      monthlyListeners: 320000,
      followersTotal: 540000,
      totalStreams: 5230000,
      driveFolderId: '2B3C4D5E6F7G8H9I0J1K',
      calendarId: 'mateo@sonidolatino.com',
    },
    {
      name: 'Las Amazonas',
      realName: 'Trío femenino de cumbia',
      bio: 'Trío femenino que rescata la cumbia tradicional con producción moderna. Su propuesta ha sido catalogada como "cumbia futurista". Gira constante por toda Latinoamérica.',
      email: 'amazonas@artistas.com',
      phone: '+54 11 4567 8901',
      avatar: 'https://i.pravatar.cc/300?img=27',
      coverImage: 'https://picsum.photos/seed/amazonas/1200/400',
      country: 'Argentina',
      city: 'Buenos Aires',
      genre: 'Cumbia',
      subgenres: JSON.stringify(['Cumbia Santafesina', 'Tropical', 'Folklore']),
      status: 'ACTIVE',
      tier: 'MID',
      contractType: 'EXCLUSIVE',
      signedDate: new Date('2021-11-20'),
      contractEnd: new Date('2026-11-20'),
      royaltySplit: 60,
      socialLinks: JSON.stringify({ instagram: '@lasamazonasoficial', spotify: 'las-amazonas', youtube: '@lasamazonas' }),
      monthlyListeners: 198000,
      followersTotal: 165000,
      totalStreams: 3870000,
      driveFolderId: '3C4D5E6F7G8H9I0J1K2L',
      calendarId: 'amazonas@sonidolatino.com',
    },
    {
      name: 'DJ Pulsar',
      realName: 'Joaquín Ríos',
      bio: 'DJ y productor de techno y house. Residencias en clubs de Berlín y Barcelona. Sets largos de 4 horas que mezclan lo analógico con lo digital.',
      email: 'pulsar@artistas.com',
      phone: '+34 612 345 678',
      avatar: 'https://i.pravatar.cc/300?img=51',
      coverImage: 'https://picsum.photos/seed/pulsar/1200/400',
      country: 'España',
      city: 'Barcelona',
      genre: 'Techno',
      subgenres: JSON.stringify(['House', 'Melodic Techno', 'Progressive']),
      status: 'ACTIVE',
      tier: 'MID',
      contractType: 'NON_EXCLUSIVE',
      signedDate: new Date('2023-04-10'),
      contractEnd: new Date('2026-04-10'),
      royaltySplit: 70,
      socialLinks: JSON.stringify({ instagram: '@djpulsar', soundcloud: 'djpulsar', spotify: 'dj-pulsar' }),
      monthlyListeners: 156000,
      followersTotal: 98000,
      totalStreams: 2150000,
      driveFolderId: '4D5E6F7G8H9I0J1K2L3M',
      calendarId: 'pulsar@sonidolatino.com',
    },
    {
      name: 'Coral Reyes',
      realName: 'Coral Reyes Sandoval',
      bio: 'Cantautora de indie folk. Sus letras exploran la identidad y la migración. Catalogada por Rolling Stone como "una de las voces más honestas de la nueva generación".',
      email: 'coral@artistas.com',
      phone: '+56 2 2345 6789',
      avatar: 'https://i.pravatar.cc/300?img=20',
      coverImage: 'https://picsum.photos/seed/coral/1200/400',
      country: 'Chile',
      city: 'Santiago',
      genre: 'Indie Folk',
      subgenres: JSON.stringify(['Indie Pop', 'Singer-Songwriter', 'Chanson']),
      status: 'ACTIVE',
      tier: 'EMERGING',
      contractType: 'EXCLUSIVE',
      signedDate: new Date('2024-01-15'),
      contractEnd: new Date('2029-01-15'),
      royaltySplit: 50,
      socialLinks: JSON.stringify({ instagram: '@coralreyes_', spotify: 'coral-reyes', bandcamp: 'coralreyes' }),
      monthlyListeners: 89000,
      followersTotal: 42000,
      totalStreams: 1240000,
      driveFolderId: '5E6F7G8H9I0J1K2L3M4N',
      calendarId: 'coral@sonidolatino.com',
    },
    {
      name: 'Bajo Mundo',
      realName: 'Colectivo musical',
      bio: 'Colectivo de jazz contemporáneo con influencias afro-latino. Cinco músicos que improvisan y graban en vivo. Residencia mensual en café-concert de Lima.',
      email: 'bajo@artistas.com',
      phone: '+51 1 234 5678',
      avatar: 'https://i.pravatar.cc/300?img=60',
      coverImage: 'https://picsum.photos/seed/bajomundo/1200/400',
      country: 'Perú',
      city: 'Lima',
      genre: 'Jazz',
      subgenres: JSON.stringify(['Latin Jazz', 'Afrobeat', 'Soul']),
      status: 'ON_HOLD',
      tier: 'DEVELOPMENT',
      contractType: 'NON_EXCLUSIVE',
      signedDate: new Date('2024-06-01'),
      contractEnd: new Date('2026-06-01'),
      royaltySplit: 75,
      socialLinks: JSON.stringify({ instagram: '@bajomundo_colectivo', spotify: 'bajo-mundo' }),
      monthlyListeners: 23000,
      followersTotal: 15000,
      totalStreams: 410000,
      driveFolderId: '6F7G8H9I0J1K2L3M4N5O',
      calendarId: 'bajomundo@sonidolatino.com',
    },
  ]

  const artists = await Promise.all(artistsData.map((data) => db.artist.create({ data })))

  // Crear usuario artista para Luna Solar
  await db.user.create({
    data: {
      email: 'luna@artistas.com',
      name: 'Luna Solar',
      avatar: 'https://i.pravatar.cc/150?img=47',
      role: 'ARTIST',
      artistId: artists[0].id,
    },
  })

  console.log('💿 Creando releases...')
  const releasesData = [
    // Luna Solar
    {
      title: 'Constelación',
      type: 'ALBUM',
      status: 'RELEASED',
      releaseDate: new Date('2024-02-14'),
      upc: '7894561230123',
      catalogNumber: 'SL-001',
      coverImage: 'https://picsum.photos/seed/constelacion/500/500',
      genre: 'Electrónica',
      tracksCount: 10,
      durationSec: 3120,
      artistId: artists[0].id,
      distributor: 'Believe',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'YouTube Music', 'Tidal', 'Amazon Music', 'Deezer']),
      driveFolderId: 'album-constelacion-folder-id',
    },
    {
      title: 'Eclipse',
      type: 'SINGLE',
      status: 'SCHEDULED',
      releaseDate: new Date('2026-11-21'),
      upc: '7894561230130',
      catalogNumber: 'SL-014',
      coverImage: 'https://picsum.photos/seed/eclipse/500/500',
      genre: 'Electrónica',
      tracksCount: 1,
      durationSec: 218,
      artistId: artists[0].id,
      distributor: 'Believe',
      distributionStatus: 'PENDING',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'YouTube Music', 'TikTok']),
    },
    {
      title: 'Luna Llena',
      type: 'SINGLE',
      status: 'RELEASED',
      releaseDate: new Date('2025-09-08'),
      upc: '7894561230116',
      catalogNumber: 'SL-012',
      coverImage: 'https://picsum.photos/seed/lunallena/500/500',
      genre: 'Electrónica',
      tracksCount: 1,
      durationSec: 195,
      artistId: artists[0].id,
      distributor: 'Believe',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'YouTube Music', 'Tidal']),
    },
    // Mateo Rítmico
    {
      title: 'Perreo Nocturno',
      type: 'EP',
      status: 'RELEASED',
      releaseDate: new Date('2025-05-30'),
      upc: '7894561240123',
      catalogNumber: 'MR-003',
      coverImage: 'https://picsum.photos/seed/perreo/500/500',
      genre: 'Reggaetón',
      tracksCount: 5,
      durationSec: 1080,
      artistId: artists[1].id,
      distributor: 'DistroKid',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'YouTube Music', 'Tidal']),
    },
    {
      title: 'Madrid Flow',
      type: 'SINGLE',
      status: 'IN_PRODUCTION',
      coverImage: 'https://picsum.photos/seed/madridflow/500/500',
      genre: 'Trap Latino',
      tracksCount: 1,
      artistId: artists[1].id,
    },
    // Las Amazonas
    {
      title: 'Cumbia del Futuro',
      type: 'ALBUM',
      status: 'RELEASED',
      releaseDate: new Date('2024-10-12'),
      upc: '7894561250123',
      catalogNumber: 'LA-002',
      coverImage: 'https://picsum.photos/seed/cumbiafuturo/500/500',
      genre: 'Cumbia',
      tracksCount: 12,
      durationSec: 2840,
      artistId: artists[2].id,
      distributor: 'AWAL',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music']),
    },
    {
      title: 'Noche Tropical',
      type: 'SINGLE',
      status: 'SCHEDULED',
      releaseDate: new Date('2026-12-05'),
      catalogNumber: 'LA-018',
      coverImage: 'https://picsum.photos/seed/nochetropical/500/500',
      genre: 'Cumbia',
      tracksCount: 1,
      artistId: artists[2].id,
      distributor: 'AWAL',
      distributionStatus: 'PENDING',
      platforms: JSON.stringify(['Spotify', 'Apple Music']),
    },
    // DJ Pulsar
    {
      title: 'Berlin Sessions Vol. 3',
      type: 'ALBUM',
      status: 'RELEASED',
      releaseDate: new Date('2025-06-20'),
      upc: '7894561260123',
      catalogNumber: 'DP-005',
      coverImage: 'https://picsum.photos/seed/berlin3/500/500',
      genre: 'Techno',
      tracksCount: 8,
      durationSec: 3720,
      artistId: artists[3].id,
      distributor: 'TuneCore',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'Beatport', 'SoundCloud Go']),
    },
    {
      title: 'Strobe Dreams',
      type: 'SINGLE',
      status: 'RELEASED',
      releaseDate: new Date('2025-11-01'),
      catalogNumber: 'DP-009',
      coverImage: 'https://picsum.photos/seed/strobe/500/500',
      genre: 'Melodic Techno',
      tracksCount: 1,
      artistId: artists[3].id,
      distributor: 'TuneCore',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'Beatport']),
    },
    // Coral Reyes
    {
      title: 'Diáspora',
      type: 'EP',
      status: 'RELEASED',
      releaseDate: new Date('2025-03-21'),
      upc: '7894561270123',
      catalogNumber: 'CR-001',
      coverImage: 'https://picsum.photos/seed/diaspora/500/500',
      genre: 'Indie Folk',
      tracksCount: 6,
      durationSec: 1480,
      artistId: artists[4].id,
      distributor: 'CD Baby',
      distributionStatus: 'LIVE',
      platforms: JSON.stringify(['Spotify', 'Apple Music', 'Bandcamp', 'YouTube Music']),
    },
    {
      title: 'Carta al Sur',
      type: 'SINGLE',
      status: 'PLANNED',
      coverImage: 'https://picsum.photos/seed/carta/500/500',
      genre: 'Indie Folk',
      tracksCount: 1,
      artistId: artists[4].id,
    },
  ]

  const releases = await Promise.all(releasesData.map((data) => db.release.create({ data })))

  console.log('📜 Creando contratos...')
  const contractsData = [
    {
      type: 'RECORDING',
      status: 'SIGNED',
      artistId: artists[0].id,
      startDate: new Date('2022-03-15'),
      endDate: new Date('2027-03-15'),
      advance: 45000,
      royaltyRate: 65,
      territory: 'WORLDWIDE',
      exclusivity: true,
      albumCommitment: 4,
      options: 2,
      signedDate: new Date('2022-03-10'),
      docId: 'contract-luna-recording-doc-id',
      pdfDriveId: 'contract-luna-pdf-id',
    },
    {
      type: 'MANAGEMENT',
      status: 'ACTIVE',
      artistId: artists[0].id,
      startDate: new Date('2022-03-15'),
      endDate: new Date('2027-03-15'),
      advance: 0,
      royaltyRate: 15,
      territory: 'WORLDWIDE',
      exclusivity: false,
      albumCommitment: 0,
      options: 0,
      signedDate: new Date('2022-03-12'),
    },
    {
      type: 'RECORDING',
      status: 'SIGNED',
      artistId: artists[1].id,
      startDate: new Date('2023-08-01'),
      endDate: new Date('2028-08-01'),
      advance: 25000,
      royaltyRate: 55,
      territory: 'WORLDWIDE',
      exclusivity: true,
      albumCommitment: 3,
      options: 2,
      signedDate: new Date('2023-07-25'),
      docId: 'contract-mateo-pdf-id',
    },
    {
      type: 'RECORDING',
      status: 'SIGNED',
      artistId: artists[2].id,
      startDate: new Date('2021-11-20'),
      endDate: new Date('2026-11-20'),
      advance: 30000,
      royaltyRate: 60,
      territory: 'LATAM',
      exclusivity: true,
      albumCommitment: 3,
      options: 1,
      signedDate: new Date('2021-11-15'),
    },
    {
      type: 'RECORDING',
      status: 'SIGNED',
      artistId: artists[3].id,
      startDate: new Date('2023-04-10'),
      endDate: new Date('2026-04-10'),
      advance: 15000,
      royaltyRate: 70,
      territory: 'WORLDWIDE',
      exclusivity: false,
      albumCommitment: 2,
      options: 0,
      signedDate: new Date('2023-04-05'),
    },
    {
      type: 'RECORDING',
      status: 'ACTIVE',
      artistId: artists[4].id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2029-01-15'),
      advance: 8000,
      royaltyRate: 50,
      territory: 'WORLDWIDE',
      exclusivity: true,
      albumCommitment: 2,
      options: 3,
      signedDate: new Date('2024-01-12'),
    },
    {
      type: 'DISTRIBUTION',
      status: 'DRAFT',
      artistId: artists[5].id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2026-06-01'),
      advance: 0,
      royaltyRate: 75,
      territory: 'WORLDWIDE',
      exclusivity: false,
      albumCommitment: 0,
      options: 0,
    },
  ]
  const contracts = await Promise.all(contractsData.map((data) => db.contract.create({ data })))

  console.log('📣 Creando campañas de marketing...')
  const campaignsData = [
    {
      name: 'Luna Solar - Constelación Tour',
      type: 'SOCIAL',
      status: 'ACTIVE',
      artistId: artists[0].id,
      releaseId: releases[0].id,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
      budget: 18000,
      spent: 8200,
      impressions: 2400000,
      clicks: 84000,
      conversions: 12400,
      playlistPitches: 47,
      playlistPlacements: 12,
      briefDocId: 'brief-constelacion-tour-doc',
      sheetId: 'tracking-constelacion-sheet',
    },
    {
      name: 'Eclipse Pre-Save Campaign',
      type: 'EMAIL',
      status: 'ACTIVE',
      artistId: artists[0].id,
      releaseId: releases[1].id,
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-11-21'),
      budget: 3500,
      spent: 1850,
      impressions: 180000,
      clicks: 22000,
      conversions: 5400,
      playlistPitches: 28,
      playlistPlacements: 4,
    },
    {
      name: 'Perreo Nocturno TikTok Ads',
      type: 'ADS',
      status: 'COMPLETED',
      artistId: artists[1].id,
      releaseId: releases[3].id,
      startDate: new Date('2025-05-15'),
      endDate: new Date('2025-07-30'),
      budget: 12000,
      spent: 11400,
      impressions: 5800000,
      clicks: 230000,
      conversions: 28900,
      playlistPitches: 35,
      playlistPlacements: 18,
    },
    {
      name: 'Cumbia del Futuro PR Tour',
      type: 'PR',
      status: 'COMPLETED',
      artistId: artists[2].id,
      releaseId: releases[5].id,
      startDate: new Date('2024-09-15'),
      endDate: new Date('2024-12-15'),
      budget: 22000,
      spent: 21000,
      impressions: 980000,
      clicks: 41000,
      conversions: 8200,
      playlistPitches: 60,
      playlistPlacements: 22,
    },
    {
      name: 'Berlin Sessions Vol.3 Beatport Promo',
      type: 'SOCIAL',
      status: 'ACTIVE',
      artistId: artists[3].id,
      releaseId: releases[7].id,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
      budget: 8000,
      spent: 7800,
      impressions: 320000,
      clicks: 18000,
      conversions: 3200,
      playlistPitches: 22,
      playlistPlacements: 9,
    },
    {
      name: 'Diáspora Spotify Canvas',
      type: 'PLAYLIST_PITCH',
      status: 'ACTIVE',
      artistId: artists[4].id,
      releaseId: releases[9].id,
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-06-30'),
      budget: 4500,
      spent: 3200,
      impressions: 145000,
      clicks: 8400,
      conversions: 1900,
      playlistPitches: 38,
      playlistPlacements: 6,
    },
  ]
  const campaigns = await Promise.all(campaignsData.map((data) => db.marketingCampaign.create({ data })))

  console.log('💰 Creando transacciones financieras...')
  const transactionsData = [
    // Ingresos por streaming
    { type: 'INCOME', category: 'STREAMING', amount: 18234.50, currency: 'USD', date: new Date('2026-10-01'), status: 'COMPLETED', artistId: artists[0].id, releaseId: releases[0].id, source: 'Spotify', description: 'Streams Septiembre 2026 - Constelación', sheetRowId: 'row-1' },
    { type: 'INCOME', category: 'STREAMING', amount: 8923.20, currency: 'USD', date: new Date('2026-10-01'), status: 'COMPLETED', artistId: artists[0].id, releaseId: releases[0].id, source: 'Apple Music', description: 'Streams Septiembre 2026' },
    { type: 'INCOME', category: 'STREAMING', amount: 12400.00, currency: 'USD', date: new Date('2026-10-03'), status: 'COMPLETED', artistId: artists[1].id, releaseId: releases[3].id, source: 'Spotify', description: 'Streams Septiembre - Perreo Nocturno' },
    { type: 'INCOME', category: 'STREAMING', amount: 6800.00, currency: 'USD', date: new Date('2026-10-05'), status: 'COMPLETED', artistId: artists[2].id, releaseId: releases[5].id, source: 'Spotify', description: 'Streams Septiembre - Cumbia del Futuro' },
    { type: 'INCOME', category: 'STREAMING', amount: 4230.50, currency: 'USD', date: new Date('2026-10-07'), status: 'COMPLETED', artistId: artists[3].id, releaseId: releases[7].id, source: 'Beatport', description: 'Ventas Berlin Sessions Vol.3' },
    { type: 'INCOME', category: 'STREAMING', amount: 1820.75, currency: 'USD', date: new Date('2026-10-08'), status: 'COMPLETED', artistId: artists[4].id, releaseId: releases[9].id, source: 'Spotify', description: 'Streams Septiembre - Diáspora' },

    // Sync / Licencias
    { type: 'INCOME', category: 'SYNC', amount: 12000.00, currency: 'USD', date: new Date('2026-09-22'), status: 'COMPLETED', artistId: artists[0].id, source: 'Netflix', description: 'Sync - Constelación en serie "Sueños Urbanos"', invoicePdfId: 'sync-netflix-pdf' },
    { type: 'INCOME', category: 'SYNC', amount: 4500.00, currency: 'USD', date: new Date('2026-09-28'), status: 'PENDING', artistId: artists[3].id, source: 'HBO', description: 'Sync - Strobe Dreams en trailer', invoicePdfId: 'sync-hbo-pdf' },

    // Live shows
    { type: 'INCOME', category: 'LIVE', amount: 28500.00, currency: 'USD', date: new Date('2026-09-15'), status: 'COMPLETED', artistId: artists[0].id, source: 'Live Nation', description: 'Show en Teatro Coliseo - Bogotá' },
    { type: 'INCOME', category: 'LIVE', amount: 12000.00, currency: 'USD', date: new Date('2026-09-20'), status: 'COMPLETED', artistId: artists[1].id, source: 'OCESA', description: 'Festival Ceremonia - CDMX' },

    // Royalty payments a artistas
    { type: 'ROYALTY_PAYMENT', category: 'STREAMING', amount: -11852.42, currency: 'USD', date: new Date('2026-10-15'), status: 'PENDING', artistId: artists[0].id, releaseId: releases[0].id, description: 'Royalty Q3 2026 - Constelación (65% split)', sheetRowId: 'royalty-row-1' },
    { type: 'ROYALTY_PAYMENT', category: 'STREAMING', amount: -6820.00, currency: 'USD', date: new Date('2026-10-15'), status: 'PENDING', artistId: artists[1].id, releaseId: releases[3].id, description: 'Royalty Q3 2026 - Perreo Nocturno (55% split)', sheetRowId: 'royalty-row-2' },
    { type: 'ROYALTY_PAYMENT', category: 'STREAMING', amount: -4080.00, currency: 'USD', date: new Date('2026-10-15'), status: 'COMPLETED', artistId: artists[2].id, releaseId: releases[5].id, description: 'Royalty Q3 2026 - Cumbia del Futuro (60% split)' },
    { type: 'ROYALTY_PAYMENT', category: 'STREAMING', amount: -2961.35, currency: 'USD', date: new Date('2026-10-15'), status: 'COMPLETED', artistId: artists[3].id, releaseId: releases[7].id, description: 'Royalty Q3 2026 - Berlin Sessions Vol.3 (70% split)' },

    // Advances (pagos iniciales)
    { type: 'ADVANCE', category: 'STREAMING', amount: -45000.00, currency: 'USD', date: new Date('2022-03-20'), status: 'COMPLETED', artistId: artists[0].id, description: 'Advance contrato recording 2022', invoicePdfId: 'advance-luna-pdf' },
    { type: 'ADVANCE', category: 'STREAMING', amount: -25000.00, currency: 'USD', date: new Date('2023-08-05'), status: 'COMPLETED', artistId: artists[1].id, description: 'Advance contrato recording 2023' },

    // Production costs
    { type: 'PRODUCTION_COST', category: 'PRODUCTION', amount: -8500.00, currency: 'USD', date: new Date('2026-09-10'), status: 'COMPLETED', artistId: artists[0].id, releaseId: releases[1].id, description: 'Mezcla y master - Eclipse single' },
    { type: 'PRODUCTION_COST', category: 'PRODUCTION', amount: -3200.00, currency: 'USD', date: new Date('2026-09-15'), status: 'COMPLETED', artistId: artists[1].id, releaseId: releases[4].id, description: 'Beat making - Madrid Flow' },

    // Marketing costs
    { type: 'EXPENSE', category: 'MARKETING', amount: -4200.00, currency: 'USD', date: new Date('2026-10-05'), status: 'COMPLETED', artistId: artists[0].id, description: 'Ads Meta - Eclipse Pre-Save', source: 'Meta Ads' },
    { type: 'EXPENSE', category: 'MARKETING', amount: -2800.00, currency: 'USD', date: new Date('2026-10-08'), status: 'COMPLETED', artistId: artists[0].id, description: 'Influencers - Constelación Tour' },

    // Admin
    { type: 'EXPENSE', category: 'ADMIN', amount: -1200.00, currency: 'USD', date: new Date('2026-10-10'), status: 'COMPLETED', artistId: artists[2].id, description: 'Legal - Renovación contrato editorial' },
  ]

  await Promise.all(transactionsData.map((data) => db.financeTransaction.create({ data })))

  console.log('🔔 Creando feed de actividad...')
  const activitiesData = [
    { type: 'MILESTONE', artistId: artists[0].id, releaseId: releases[0].id, title: 'Constelación alcanzó 8M de streams', description: 'El álbum debut supera los 8 millones de streams totales en Spotify', severity: 'SUCCESS' },
    { type: 'RELEASE', artistId: artists[0].id, releaseId: releases[1].id, title: 'Eclipse - Pre-save abierto', description: 'La campaña de pre-save supera las 5,400 conversiones', severity: 'INFO' },
    { type: 'FINANCE', artistId: artists[0].id, title: 'Royalty Q3 pendiente de pago', description: '$11,852.42 a pagar a Luna Solar antes del 31 de octubre', severity: 'WARNING' },
    { type: 'CONTRACT', artistId: artists[3].id, title: 'Contrato DJ Pulsar vence en 5 meses', description: 'Renovar o negociar salida antes del 10 de abril 2026', severity: 'URGENT' },
    { type: 'MARKETING', artistId: artists[0].id, title: 'Pitch a editor de playlist "Mujeres Latinas"', description: 'Pitch enviado para Constelación - respuesta esperada esta semana', severity: 'INFO' },
    { type: 'MILESTONE', artistId: artists[2].id, title: 'Las Amazonas - 5to aniversario', description: 'El trío cumple 5 años con el sello en noviembre', severity: 'INFO' },
    { type: 'FINANCE', artistId: artists[3].id, title: 'Sync confirmado con HBO', description: 'Strobe Dreams aparecerá en trailer de serie - $4,500 USD', severity: 'SUCCESS' },
    { type: 'NOTE', artistId: artists[4].id, title: 'Coral Reyes - Sesión de fotos programada', description: 'Sesión para nuevo arte de "Carta al Sur" - 15 nov', severity: 'INFO' },
    { type: 'RELEASE', artistId: artists[1].id, releaseId: releases[3].id, title: 'Perreo Nocturno supera 5M de streams', description: 'EP de Mateo Rítmico alcanza milestone en Spotify', severity: 'SUCCESS' },
    { type: 'CONTRACT', artistId: artists[5].id, title: 'Bajo Mundo - Renegociación pendiente', description: 'Reunión agendada para revisar distribución y exclusividad', severity: 'WARNING' },
  ]
  await Promise.all(activitiesData.map((data) => db.activity.create({ data: { ...data, createdAt: new Date(Date.now() - Math.random() * 86400000 * 14) } })))

  console.log('🔌 Creando integraciones de Google...')
  const integrationsData = [
    { service: 'DRIVE', status: 'CONNECTED', accountId: 'admin@sonidolatino.com', lastSync: new Date(Date.now() - 1000 * 60 * 12), metadata: JSON.stringify({ folderCount: 142, filesCount: 3280, storageUsed: '4.2 GB' }) },
    { service: 'CALENDAR', status: 'CONNECTED', accountId: 'admin@sonidolatino.com', lastSync: new Date(Date.now() - 1000 * 60 * 5), metadata: JSON.stringify({ sharedCalendars: 6, upcomingEvents: 23 }) },
    { service: 'GMAIL', status: 'CONNECTED', accountId: 'admin@sonidolatino.com', lastSync: new Date(Date.now() - 1000 * 60 * 2), metadata: JSON.stringify({ templatesCount: 14, sentThisWeek: 89 }) },
    { service: 'DOCS', status: 'CONNECTED', accountId: 'admin@sonidolatino.com', lastSync: new Date(Date.now() - 1000 * 60 * 30), metadata: JSON.stringify({ contractsTemplates: 8, briefingTemplates: 5 }) },
    { service: 'SHEETS', status: 'CONNECTED', accountId: 'admin@sonidolatino.com', lastSync: new Date(Date.now() - 1000 * 60 * 18), metadata: JSON.stringify({ royaltySheets: 6, marketingSheets: 12 }) },
    { service: 'LOOKER', status: 'ERROR', accountId: 'admin@sonidolatino.com', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), metadata: JSON.stringify({ error: 'Token expired, re-authentication required', dashboardsCount: 4 }) },
  ]
  await Promise.all(integrationsData.map((data) => db.googleIntegration.create({ data })))

  console.log('✅ Seed completo!')
  console.log(`   - ${artists.length} artistas`)
  console.log(`   - ${releases.length} releases`)
  console.log(`   - ${contracts.length} contratos`)
  console.log(`   - ${campaigns.length} campañas`)
  console.log(`   - ${transactionsData.length} transacciones`)
  console.log(`   - ${activitiesData.length} actividades`)
  console.log(`   - ${integrationsData.length} integraciones Google`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
