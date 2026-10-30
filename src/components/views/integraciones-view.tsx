'use client'

import { useEffect, useState } from 'react'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  HardDrive, Calendar, Mail, FileText, Table, BarChart3,
  CheckCircle2, XCircle, RefreshCw, ExternalLink, Settings, Sparkles,
} from 'lucide-react'

interface Integration {
  id: string
  service: string
  status: string
  accountId?: string | null
  lastSync?: string | null
  metadata: any
}

const serviceConfig: Record<string, { label: string; icon: any; color: string; bgColor: string; description: string; features: string[] }> = {
  DRIVE: {
    label: 'Google Drive',
    icon: HardDrive,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    description: 'Almacenamiento de masters,contratos PDF y assets por proyecto',
    features: ['Carpetas por proyecto', 'Versionado de masters', 'Compartir con clientes', 'Backup automático'],
  },
  CALENDAR: {
    label: 'Google Calendar',
    icon: Calendar,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    description: 'Sesiones de grabación, reuniones, entregas y cobros',
    features: ['Calendario por productor', 'Recordatorios de entrega', 'Sync con clientes', 'Coordinación de sala'],
  },
  GMAIL: {
    label: 'Gmail',
    icon: Mail,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Comunicación con clientes, envío de cotizaciones y cobros',
    features: ['Templates de cotización', 'Seguimiento post-sesión', 'Notificaciones automáticas', 'Tracking de respuestas'],
  },
  DOCS: {
    label: 'Google Docs',
    icon: FileText,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    description: 'Plantillas de contratos, briefs y actas de reuniones',
    features: ['Plantillas legales', 'Briefs colaborativos', 'Actas en tiempo real', 'Versiones automáticas'],
  },
  SHEETS: {
    label: 'Google Sheets',
    icon: Table,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Sheet CRM principal vinculado con el sistema',
    features: ['CRM cotizador', 'Tracking de proyectos', 'Royalty sheets', 'Reportes automáticos'],
  },
  LOOKER: {
    label: 'Looker Studio',
    icon: BarChart3,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    description: 'Dashboards analíticos avanzados del estudio',
    features: ['Dashboard financiero', 'Métricas de productores', 'Análisis de proyectos', 'Reportes mensuales'],
  },
}

export function IntegracionesView() {
  const [integraciones, setIntegraciones] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/integraciones')
      .then((r) => r.json())
      .then((d) => setIntegraciones(d.integraciones || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Google Workspace</h2>
        <p className="text-sm text-muted-foreground">
          {integraciones.filter(i => i.status === 'CONNECTED').length}/{integraciones.length} servicios conectados · Cuenta: seagull.records.99@gmail.com
        </p>
      </div>

      {/* Sync banner */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Sync automático activado</div>
            <div className="text-xs text-muted-foreground">
              Los datos se sincronizan con tu Sheet CRM cada 5 minutos
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Sync ahora
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integraciones.map((i) => {
          const config = serviceConfig[i.service]
          if (!config) return null
          const Icon = config.icon
          const isConnected = i.status === 'CONNECTED'

          return (
            <div
              key={i.id}
              className={cn(
                'rounded-xl border bg-card/40 backdrop-blur-sm p-5 transition-all hover-lift',
                isConnected ? 'border-border/50' : 'border-red-500/30'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', config.bgColor, config.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{config.label}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="text-[10px] text-green-500 font-medium uppercase tracking-wide">Conectado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span className="text-[10px] text-red-500 font-medium uppercase tracking-wide">Sin conectar</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{config.description}</p>

              {i.metadata && (
                <div className="space-y-1.5 mb-3">
                  {Object.entries(i.metadata).slice(0, 3).map(([k, v]) => {
                    const labels: Record<string, string> = {
                      carpetaRaiz: 'Carpeta raíz',
                      carpetasProyectos: 'Carpetas proyectos',
                      archivosTotales: 'Archivos totales',
                      storageUsado: 'Storage usado',
                      calendariosCompartidos: 'Calendarios compartidos',
                      eventosProximos: 'Eventos próximos',
                      sesionesEstaSemana: 'Sesiones esta semana',
                      templatesCotizacion: 'Templates cotización',
                      enviadasEstaSemana: 'Enviadas esta semana',
                      pendientesRespuesta: 'Pendientes de respuesta',
                      plantillasContrato: 'Plantillas contrato',
                      briefsActivos: 'Briefs activos',
                      contratosEsteMes: 'Contratos este mes',
                      sheetCRM: 'Sheet CRM',
                      sheetsVinculadas: 'Sheets vinculadas',
                      ultimaSync: 'Última sync',
                      error: 'Error',
                    }
                    return (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{labels[k] || k}</span>
                        <span className="font-medium tabular-nums truncate max-w-[150px]">{String(v)}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="space-y-1 mb-3">
                {config.features.slice(0, 2).map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                {i.lastSync && (
                  <div className="text-[10px] text-muted-foreground">
                    Última sync: {formatRelativeTime(i.lastSync)}
                  </div>
                )}
                {isConnected ? (
                  <button className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline ml-auto">
                    Abrir
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ) : (
                  <button className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline ml-auto">
                    Reconectar
                    <RefreshCw className="h-3 w-3" />
                  </button>
                )}
              </div>

              {!isConnected && i.metadata?.error && (
                <div className="mt-3 rounded-md bg-red-500/5 border border-red-500/20 p-2">
                  <div className="text-[10px] text-red-500/80">{i.metadata.error}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Cuenta info */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold mb-3">Cuenta conectada</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 to-chart-2 text-white">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">seagull.records.99@gmail.com</div>
            <div className="text-[11px] text-muted-foreground">Workspace: SEAGULL RECORDS S.A.C. · RUC 20612281352</div>
          </div>
        </div>
      </div>
    </div>
  )
}
