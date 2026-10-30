'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, ESTADO_COTIZACION_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowLeft, FileText, ExternalLink, Sparkles, Plus, Calendar, User, Music } from 'lucide-react'

interface Cotizacion {
  id: string
  codigo: string
  nombreCliente: string
  fechaEmision: string
  fechaVencimiento?: string | null
  subtotal: number
  igv: number
  total: number
  estado: string
  creadoPor?: string | null
  observaciones?: string | null
  contacto: { id: string; nombre: string; codigo: string; tipo: string }
  items: Array<{ id: string; descripcion: string; cantidad: number; unidad?: string | null; precioUnitario: number; subtotal: number; servicio?: { codigo: string; nombre: string } | null }>
  proyecto?: { id: string; codigo: string; nombreProyecto: string } | null
}

const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-muted text-muted-foreground',
  ENVIADA: 'bg-chart-3/20 text-chart-3',
  APROBADA: 'bg-green-500/20 text-green-500',
  RECHAZADA: 'bg-red-500/20 text-red-500',
  VENCIDA: 'bg-chart-5/20 text-chart-5',
  CONVERTIDA_PROYECTO: 'bg-chart-2/20 text-chart-2',
}

export function CotizacionesView() {
  const { setView, openModal } = useAppStore()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState('ALL')
  const [selectedCot, setSelectedCot] = useState<Cotizacion | null>(null)

  useEffect(() => {
    fetch('/api/cotizaciones')
      .then((r) => r.json())
      .then((d) => setCotizaciones(d.cotizaciones || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const filtered = cotizaciones.filter(c => estadoFilter === 'ALL' || c.estado === estadoFilter)
  const totalAprobado = cotizaciones.filter(c => c.estado === 'APROBADA').reduce((s, c) => s + c.total, 0)
  const totalEnviado = cotizaciones.filter(c => c.estado === 'ENVIADA').reduce((s, c) => s + c.total, 0)

  // Vista detalle de cotización
  if (selectedCot) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCot(null)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a cotizaciones
        </button>

        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
          {/* Header estilo factura */}
          <div className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 p-6 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src="/logo-seagull.png"
                  alt="SEAGULL RECORDS"
                  className="h-16 w-16 object-contain shrink-0"
                />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">SEAGULL RECORDS S.A.C.</div>
                  <h2 className="text-2xl font-bold tracking-tight">Cotización {selectedCot.codigo}</h2>
                  <div className="text-xs text-muted-foreground mt-1">
                    Emitida el {formatDate(selectedCot.fechaEmision, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={cn('inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide', estadoColors[selectedCot.estado])}>
                  {ESTADO_COTIZACION_LABELS[selectedCot.estado] || selectedCot.estado}
                </span>
                <div className="text-2xl font-bold tabular-nums mt-2 text-primary">
                  {formatCurrency(selectedCot.total)}
                </div>
                <div className="text-[10px] text-muted-foreground">Total con IGV</div>
              </div>
            </div>
          </div>

          {/* Cliente info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-border/40">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Cliente</div>
              <div className="text-sm font-semibold">{selectedCot.nombreCliente}</div>
              <div className="text-[11px] text-muted-foreground">{selectedCot.contacto.codigo}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tipo de contacto</div>
              <div className="text-sm">{selectedCot.contacto.tipo}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Vigencia</div>
              <div className="text-sm">
                {selectedCot.fechaVencimiento ? formatDate(selectedCot.fechaVencimiento) : '15 días'}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-6">
            <h3 className="text-sm font-semibold mb-3">Detalle de servicios</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2 text-left font-semibold">#</th>
                    <th className="px-2 py-2 text-left font-semibold">Descripción</th>
                    <th className="px-2 py-2 text-right font-semibold">Cant.</th>
                    <th className="px-2 py-2 text-left font-semibold hidden sm:table-cell">Unidad</th>
                    <th className="px-2 py-2 text-right font-semibold">P. Unit.</th>
                    <th className="px-2 py-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCot.items.map((it, i) => (
                    <tr key={it.id} className="border-b border-border/30">
                      <td className="px-2 py-3 text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                      <td className="px-2 py-3">
                        <div className="text-sm">{it.descripcion}</div>
                        {it.servicio && (
                          <div className="text-[10px] text-muted-foreground">{it.servicio.codigo} · {it.servicio.nombre}</div>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right tabular-nums text-sm">{it.cantidad}</td>
                      <td className="px-2 py-3 text-xs text-muted-foreground hidden sm:table-cell">{it.unidad || '—'}</td>
                      <td className="px-2 py-3 text-right tabular-nums text-sm">{formatCurrency(it.precioUnitario)}</td>
                      <td className="px-2 py-3 text-right tabular-nums font-semibold">{formatCurrency(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="mt-6 flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums font-medium">{formatCurrency(selectedCot.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGV (18%)</span>
                  <span className="tabular-nums font-medium">{formatCurrency(selectedCot.igv)}</span>
                </div>
                <div className="flex justify-between text-base border-t border-border/50 pt-2">
                  <span className="font-bold">Total</span>
                  <span className="tabular-nums font-bold text-primary">{formatCurrency(selectedCot.total)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground text-right mt-2">
                  Vigencia: 15 días · Anticipo 50% para iniciar
                </div>
              </div>
            </div>

            {selectedCot.proyecto && (
              <div className="mt-6 pt-4 border-t border-border/40">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Proyecto vinculado</div>
                <div className="text-sm font-medium">{selectedCot.proyecto.codigo} · {selectedCot.proyecto.nombreProyecto}</div>
              </div>
            )}

            {selectedCot.observaciones && (
              <div className="mt-6 pt-4 border-t border-border/40">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observaciones</div>
                <p className="text-sm">{selectedCot.observaciones}</p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="border-t border-border/40 p-4 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <ExternalLink className="h-3 w-3" />
              Exportar PDF
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors">
              <ExternalLink className="h-3 w-3" />
              Enviar por Gmail
            </button>
            <button
              onClick={() => setView('ai')}
              className="inline-flex items-center gap-1.5 rounded-md border border-chart-2/40 bg-chart-2/10 px-3 py-1.5 text-xs text-chart-2 hover:bg-chart-2/20 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Generar copy IA
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cotizaciones</h2>
          <p className="text-sm text-muted-foreground">
            {cotizaciones.length} cotizaciones · {formatCurrency(totalAprobado)} aprobadas · {formatCurrency(totalEnviado)} enviadas
          </p>
        </div>
        <button
          onClick={() => openModal('cotizacion')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Nueva cotización
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-3">
        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todos los estados</option>
          <option value="BORRADOR">Borradores</option>
          <option value="ENVIADA">Enviadas</option>
          <option value="APROBADA">Aprobadas</option>
          <option value="RECHAZADA">Rechazadas</option>
          <option value="VENCIDA">Vencidas</option>
        </select>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCot(c)}
            className="w-full rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 text-left transition-colors hover:bg-muted/40 hover:border-primary/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold font-mono">{c.codigo}</h4>
                  <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', estadoColors[c.estado])}>
                    {ESTADO_COTIZACION_LABELS[c.estado] || c.estado}
                  </span>
                  {c.proyecto && (
                    <span className="rounded bg-chart-2/20 text-chart-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                      Proyecto {c.proyecto.codigo}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium mt-1 truncate">{c.nombreCliente}</div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(c.fechaEmision)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {c.creadoPor || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    {c.items.length} items
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold tabular-nums text-primary">{formatCurrency(c.total)}</div>
                <div className="text-[10px] text-muted-foreground">con IGV</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No hay cotizaciones con ese filtro.</div>
      )}
    </div>
  )
}
