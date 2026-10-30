'use client'

export function formatCurrency(amount: number, currency = 'PEN'): string {
  // Formato peruano: S/. 1,234.50
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

export function formatFullNumber(num: number): string {
  return new Intl.NumberFormat('es-PE').format(num)
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-PE', opts || { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hours = Math.floor(min / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return formatDate(d)
  if (days > 0) return `hace ${days}d`
  if (hours > 0) return `hace ${hours}h`
  if (min > 0) return `hace ${min}m`
  return 'ahora'
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return Math.floor((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function daysOverdue(date: Date | string): number {
  return -daysUntil(date)
}

export const TIPO_CONTACTO_LABELS: Record<string, string> = {
  SOLISTA: 'Solista',
  BANDA: 'Banda',
  MANAGER: 'Manager',
  PRODUCTOR: 'Productor',
  SELLO: 'Sello',
}

export const ESTADO_CONTACTO_LABELS: Record<string, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  COTIZACION_ENVIADA: 'Cotización enviada',
  CLIENTE_ACTIVO: 'Cliente activo',
  PROSPECTO: 'Prospecto',
}

export const ESTADO_COTIZACION_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
  CONVERTIDA_PROYECTO: 'Convertida',
}

export const ESTADO_PROYECTO_LABELS: Record<string, string> = {
  ACTIVO: 'Activo',
  PAUSADO: 'Pausado',
  CANCELADO: 'Cancelado',
  ENTREGADO: 'Entregado',
}

export const ETAPA_FLUJO_LABELS: Record<string, string> = {
  PREPRODUCCION: 'Preproducción',
  GRABACION: 'Grabación',
  EDICION: 'Edición',
  MEZCLA: 'Mezcla',
  MASTERIZACION: 'Masterización',
  REVISION: 'Revisión',
  ENTREGA: 'Entrega',
  FINALIZADO: 'Finalizado',
}

export const ETAPA_ORDEN: string[] = [
  'PREPRODUCCION',
  'GRABACION',
  'EDICION',
  'MEZCLA',
  'MASTERIZACION',
  'REVISION',
  'ENTREGA',
  'FINALIZADO',
]

export const ESTADO_TAREA_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

export const ESTADO_CONTRATO_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  FIRMADO: 'Firmado',
  ARCHIVADO: 'Archivado',
  ANULADO: 'Anulado',
}

export const TIPO_CONTRATO_LABELS: Record<string, string> = {
  EP: 'EP',
  Sencillo: 'Sencillo',
  'Producción Completa': 'Producción completa',
  'Mezcla y Masterización': 'Mezcla y master',
}

export const ESTADO_INGRESO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  ANULADO: 'Anulado',
}

export const METODO_PAGO_LABELS: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TARJETA: 'Tarjeta',
}

export const CATEGORIA_EGRESO_LABELS: Record<string, string> = {
  SERVICIOS: 'Servicios',
  EQUIPO: 'Equipo',
  SOFTWARE: 'Software / Suscripciones',
  PERSONAL: 'Personal',
  MARKETING: 'Marketing',
  ADMIN: 'Administración',
  RENTA: 'Renta',
  OTROS: 'Otros',
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PRODUCTOR: 'Productor',
  'A&R': 'A&R / Pre-producción',
  CONTABILIDAD: 'Contabilidad',
  CLIENTE: 'Cliente',
}

export const RESPONSABLES = ['Martha', 'Aarón', 'Caleb', 'Oseías']

export const INVENTARIO_CATEGORIA_LABELS: Record<string, string> = {
  MICROFONO: 'Micrófono',
  CABLE: 'Cable',
  INTERFACE: 'Interface / Tarjeta',
  INSTRUMENTO: 'Instrumento',
  MONITOR: 'Monitor',
  ACCESORIO: 'Accesorio',
  OTRO: 'Otro',
}

export const INVENTARIO_ESTADO_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_USO: 'En uso',
  PRESTADO: 'Prestado',
  EN_REPARACION: 'En reparación',
  BAJA: 'De baja',
}

export const INVENTARIO_ESTADO_COLORS: Record<string, string> = {
  DISPONIBLE: 'bg-green-500/20 text-green-500',
  EN_USO: 'bg-chart-3/20 text-chart-3',
  PRESTADO: 'bg-chart-5/20 text-chart-5',
  EN_REPARACION: 'bg-chart-2/20 text-chart-2',
  BAJA: 'bg-muted text-muted-foreground',
}

export const ASISTENCIA_ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  ACTIVO: 'Activo',
  COMPLETADO: 'Completado',
  AUSENTE: 'Ausente',
}

export const ASISTENCIA_ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-muted text-muted-foreground',
  ACTIVO: 'bg-green-500/20 text-green-500',
  COMPLETADO: 'bg-chart-1/20 text-chart-1',
  AUSENTE: 'bg-red-500/20 text-red-500',
}
