'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, ESTADO_CONTRATO_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ScrollText, ExternalLink, AlertTriangle, FileText, Plus } from 'lucide-react'

interface Contrato {
  id: string
  codigo: string
  nombreArtista: string
  nombreProyecto: string
  tipoContrato: string
  fechaCreacion: string
  fechaFirma?: string | null
  fechaVigencia?: string | null
  montoTotal: number
  anticipo: number
  saldoPendiente: number
  estado: string
  urlDocumento?: string | null
  urlCarpeta?: string | null
  observaciones?: string | null
  contacto: { id: string; nombre: string; codigo: string }
  proyecto?: { id: string; codigo: string } | null
}

const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-muted text-muted-foreground',
  FIRMADO: 'bg-green-500/20 text-green-500',
  ARCHIVADO: 'bg-blue-500/20 text-blue-500',
  ANULADO: 'bg-red-500/20 text-red-500',
}

function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return Math.floor((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function ContratosView() {
  const { openContacto, openModal } = useAppStore()
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contratos')
      .then((r) => r.json())
      .then((d) => setContratos(d.contratos || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const firmados = contratos.filter(c => c.estado === 'FIRMADO')
  const totalSaldo = firmados.reduce((s, c) => s + c.saldoPendiente, 0)
  const totalAnticipos = contratos.reduce((s, c) => s + c.anticipo, 0)
  const totalMontos = contratos.reduce((s, c) => s + c.montoTotal, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contratos</h2>
          <p className="text-sm text-muted-foreground">
            {contratos.length} contratos · {firmados.length} firmados · {formatCurrency(totalSaldo)} por cobrar
          </p>
        </div>
        <button
          onClick={() => openModal('contrato')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Nuevo contrato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
          <div className="text-xl font-bold tabular-nums">{contratos.length}</div>
          <div className="text-[11px] text-muted-foreground">Contratos totales</div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="text-xl font-bold tabular-nums text-primary">{formatCurrency(totalMontos)}</div>
          <div className="text-[11px] text-muted-foreground">Monto total contratado</div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="text-xl font-bold tabular-nums text-green-500">{formatCurrency(totalAnticipos)}</div>
          <div className="text-[11px] text-muted-foreground">Anticipos recibidos</div>
        </div>
        <div className="rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
          <div className="text-xl font-bold tabular-nums text-chart-2">{formatCurrency(totalSaldo)}</div>
          <div className="text-[11px] text-muted-foreground">Saldos por cobrar</div>
        </div>
      </div>

      {/* Alert */}
      {totalSaldo > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
          <AlertTriangle className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-chart-2">
              {formatCurrency(totalSaldo)} pendientes de cobro en {firmados.length} contratos firmados
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Revisa los saldos pendientes con cada cliente y registra los pagos en la sección de Finanzas.
            </div>
          </div>
        </div>
      )}

      {/* Lista de contratos */}
      <div className="space-y-3">
        {contratos.map((c) => (
          <div key={c.id} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold font-mono">{c.codigo}</h4>
                  <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', estadoColors[c.estado])}>
                    {ESTADO_CONTRATO_LABELS[c.estado] || c.estado}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                    {c.tipoContrato}
                  </span>
                  {c.proyecto && (
                    <span className="rounded bg-chart-2/20 text-chart-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                      {c.proyecto.codigo}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium mt-1">{c.nombreProyecto}</div>
                <button
                  onClick={() => openContacto(c.contacto.id)}
                  className="text-[11px] text-muted-foreground hover:text-foreground mt-1 transition-colors"
                >
                  {c.contacto.codigo} · {c.nombreArtista}
                </button>

                {/* Montos */}
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/30 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monto total</div>
                    <div className="font-bold tabular-nums">{formatCurrency(c.montoTotal)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Anticipo</div>
                    <div className="font-bold tabular-nums text-green-500">{formatCurrency(c.anticipo)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Saldo</div>
                    <div className={cn('font-bold tabular-nums', c.saldoPendiente > 0 ? 'text-chart-2' : 'text-muted-foreground')}>
                      {formatCurrency(c.saldoPendiente)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:w-32 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Firmado</div>
                  <div className="font-medium">{c.fechaFirma ? formatDate(c.fechaFirma) : '—'}</div>
                </div>
                {c.urlDocumento && (
                  <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] hover:bg-muted/60 transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Ver Docs
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
