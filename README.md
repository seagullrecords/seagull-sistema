# SEAGULL RECORDS · Sistema de Gestión Integral

Sistema profesional de gestión para estudio de producción musical — CRM, cotizaciones, proyectos, contratos, finanzas, inventario, asistencia, informes mensuales, integraciones Google Workspace y Telegram.

## 🚀 Despliegue en producción

Este sistema funciona 100% en desarrollo. Para activar las integraciones reales con Google Workspace y Telegram, sigue estos pasos:

### Opción 1: Vercel (recomendado, gratis)

1. **Sube el código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "SEAGULL RECORDS - initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/seagull-records.git
   git push -u origin main
   ```

2. **Importa en Vercel**:
   - Ve a https://vercel.com/new
   - Conecta tu cuenta GitHub
   - Selecciona el repositorio
   - Vercel detecta Next.js automáticamente

3. **Configura variables de entorno** en Vercel:
   ```
   DATABASE_URL=file:./db/custom.db  # o una URL de PostgreSQL
   NEXTAUTH_SECRET=tu-secreto-aqui  # genera con openssl rand -base64 32
   NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
   ```

4. **Despliega** — Vercel instala todo automáticamente.

### Opción 2: Railway / Render / Tu propio servidor

Mismos pasos pero usando su proceso de despliegue. Asegúrate de:
- Node.js 18+ instalado
- `npm install && npm run build && npm start`
- Variable `PORT` si tu hosting lo requiere

## 🔧 Configurar integraciones reales

### 1. Bot de Telegram (gratis, 5 minutos)

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot` y sigue las instrucciones
3. Copia el **Bot Token** que te devuelve (formato: `123456789:ABCdef...`)
4. En Telegram, busca tu nuevo bot y envía `/start` (cada miembro del equipo debe hacerlo)
5. Visita en tu navegador: `https://api.telegram.org/bot[TU_TOKEN]/getUpdates`
6. Copia el `chat.id` de cada miembro (numeros largos negativos o positivos)
7. En el sistema → **Configuración** → pega el token y los chat IDs

### 2. Gmail (gratis, 5 minutos)

1. Ve a https://myaccount.google.com → Security
2. Activa **2-Step Verification** (obligatorio)
3. Busca **App passwords** (https://myaccount.google.com/apppasswords)
4. Genera una nueva app password para "SEAGULL Studio"
5. Copia los 16 caracteres (sin espacios)
6. En el sistema → **Configuración** → pega email + app password

### 3. Google Workspace (Drive + Calendar) - 15 minutos

1. Ve a https://console.cloud.google.com
2. Crea un proyecto nuevo (ej: "SEAGULL Records CRM")
3. Habilita las APIs:
   - Google Drive API
   - Google Calendar API
   - Gmail API (opcional, para emails)
4. Ve a **APIs & Services → Credentials**
5. Crea credenciales **OAuth client ID** (tipo: Web application)
6. En **Authorized redirect URIs**, agrega:
   ```
   https://TU_DOMINIO/api/google/callback
   ```
7. Copia el **Client ID** y **Client Secret**
8. Genera un **Refresh Token** (usando OAuth playground o el flujo OAuth del sistema)
9. En el sistema → **Configuración** → pega Client ID, Client Secret y Refresh Token

### 4. Activar código real

En producción, edita estos archivos para activar las llamadas reales:

**`src/app/api/telegram/route.ts`** — Descomenta las llamadas a `fetch` (marcadas con `// EN PRODUCCIÓN:`)

**`src/app/api/google/route.ts`** — Instala `googleapis`:
```bash
npm install googleapis
```
Y descomenta las llamadas a la API de Google (marcadas con `// EN PRODUCCIÓN:`)

**Para Gmail**, instala `nodemailer`:
```bash
npm install nodemailer @types/nodemailer
```
Y agrega la lógica de envío en `src/app/api/google/route.ts`

## 📋 Estructura del proyecto

```
src/
├── app/
│   ├── api/                    # APIs REST (14 endpoints)
│   │   ├── dashboard/
│   │   ├── contactos/         # GET, POST
│   │   ├── cotizaciones/      # GET, POST
│   │   ├── proyectos/         # GET, POST
│   │   ├── tareas/            # GET, POST, PATCH
│   │   ├── servicios/         # GET, POST
│   │   ├── contratos/         # GET, POST
│   │   ├── finanzas/          # GET, POST (ingresos y egresos)
│   │   ├── inventario/        # GET, POST
│   │   ├── asistencia/        # GET, POST (check-in/out)
│   │   ├── informes/          # GET, POST (generar PDF)
│   │   ├── credenciales/      # GET, POST, DELETE
│   │   ├── telegram/          # Bot + envío de mensajes
│   │   └── google/            # Drive, Calendar, Gmail
│   ├── layout.tsx
│   ├── page.tsx               # SPA con 18 vistas
│   └── globals.css            # Dark premium theme
├── components/
│   ├── layout/                # Sidebar + Topbar
│   ├── views/                 # 18 vistas
│   └── modals/                # 9 formularios de creación
├── lib/
│   ├── db.ts                  # Prisma client
│   ├── store.ts               # Zustand
│   ├── format.ts              # Utilidades peruano (S/., es-PE)
│   └── utils.ts
└── prisma/
    └── schema.prisma          # 15 modelos

scripts/
├── seed-seagull.ts            # Datos principales
└── seed-extendido.ts          # Inventario, asistencia, informes, credenciales
```

## 🗄️ Modelos de base de datos

15 modelos Prisma:
- **User** - equipo (Martha, Aarón, Caleb, Oseías)
- **Contacto** - CRM (clientes, bandas, managers)
- **Servicio** - catálogo de precios
- **Cotizacion** + **CotizacionItem** - cotizaciones con items
- **Proyecto** - workflow de producción
- **Tarea** - por proyecto y etapa
- **Contrato** - legales con anticipos y saldos
- **Ingreso** + **Egreso** - finanzas
- **Evento** - agenda
- **InventarioItem** + **Prestamo** + **Mantenimiento** - inventario
- **RegistroAsistencia** - check-in/out
- **InformeMensual** - reportes PDF
- **Credencial** - tokens Google + Telegram (encriptados)
- **GoogleIntegration** + **Actividad** - integraciones y feed

## 🤖 Roles y permisos

- **ADMIN** (Martha) - acceso total
- **PRODUCTOR** (Aarón, Caleb) - contactos, proyectos, tareas, cotizaciones, servicios, agenda, inventario, asistencia
- **A&R** (Oseías) - contactos, proyectos, tareas, agenda, asistencia
- **CONTABILIDAD** - finanzas, contratos, cotizaciones, informes
- **CLIENTE** - vista limitada (sin finanzas ni configuración)

## 💰 Moneda y configuración

- Moneda: **Soles (PEN)** — formato `S/. 1,234.50`
- IGV: **18%**
- Vigencia default de cotizaciones: **15 días**
- Anticipo default: **50%**

## 📊 Funcionalidades

### Dashboard
- KPIs en tiempo real: ingresos, saldos por cobrar, proyectos activos, tareas vencidas
- Charts: Ingresos vs Egresos, Egresos por categoría
- Top 5 clientes por ingresos
- Feed de actividad en vivo
- Próximos eventos
- Estado de integraciones Google
- Insight del asistente IA

### CRM
- Contactos con filtros (tipo, estado, búsqueda)
- Detalle con proyectos/contratos/ingresos vinculados
- Cotizaciones con items dinámicos + IGV automático
- Vista detalle estilo factura profesional

### Proyectos
- Kanban con 8 etapas (Preprod → Final)
- Detalle con % avance y tareas agrupadas por etapa
- Generación automática de tareas (9 por canción)

### Tareas
- Filtros por estado, etapa, responsable
- KPIs: pendientes, vencidas, esta semana, completadas
- Marcar como completada

### Finanzas
- Ingresos y egresos en Soles
- Categorías de egresos
- Métodos de pago (Efectivo, Yape, Plin, Transferencia, Tarjeta)
- Margen de utilidad automático

### Inventario
- 25 equipos pre-cargados (micrófonos, cables, interfaces, instrumentos, monitores)
- Estados: disponible, en uso, prestado, en reparación
- Préstamos activos con fecha de devolución
- Mantenimientos programados

### Asistencia
- Check-in / check-out con un click
- Resumen por miembro: horas totales, días trabajados, ausencias
- Estado activo en tiempo real
- Registros de últimos 7 días

### Informes mensuales
- Generación automática con todas las métricas del mes
- PDF descargable con diseño profesional
- Envío por email o Telegram
- Top 5 ingresos, egresos por categoría, margen

### Configuración
- Formularios para Google OAuth, Gmail App Password, Bot de Telegram
- Botones para probar conexión
- Botones para enviar: mensaje de prueba, recordatorio de tareas vencidas, informe diario
- Instrucciones detalladas en pantalla

## 🔒 Seguridad

- Credenciales se guardan en base de datos (en producción: encriptar con AES)
- Sistema de roles controla acceso a vistas sensibles
- Validación en servidor con Zod en todos los endpoints POST

## 📞 Soporte

- **Empresa**: SEAGULL RECORDS S.A.C.
- **RUC**: 20612281352
- **Email**: seagull.records.99@gmail.com
- **Teléfono**: 910 216 278
- **Dirección**: Jr. Ferrocarril 151, Chimbote, Áncash, Perú

---

**Generado por**: SEAGULL Studio OS · Sistema de Gestión Integral
