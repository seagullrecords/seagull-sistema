'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, ESTADO_PROYECTO_LABELS, ETAPA_FLUJO_LABELS, ETAPA_ORDEN } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FolderKanban, ExternalLink, Calendar, User, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react'

interface Proyecto {
  id: string
  codigo: string
  nombreArtista: string
  nombreProyecto: string
  tipoProyecto: string
  estadoFlujo: string
  estadoGeneral: string
  fechaInicio?: string | null
  fechaEntregaEstimada?: string | null
  fechaEntregaReal?: string | null
  responsable?: string | null
  urlCarpetaDrive?: string | null
  contacto: { id: string; nombre: string; codigo: string; tipo: string }
  cotizacion?: { codigo: string; total: number } | null
  _count: { tareas: number }
  tareas: Array<{ id: string; nombre: string; etapa: string; responsable?: string | null; fechaLimite?: string | null; estado: string }>
}

const etapaColors: Record<string, string> = {
  PREPRODUCCION: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  GRABACION: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  EDICION: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  MEZCLA: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  MASTERIZACION: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  REVISION: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  ENTREGA: 'bg-green-500/20 text-green-500 border-green-500/30',
  FINALIZADO: 'bg-muted text-muted-foreground border-border',
}

const estadoColors: Record<string, string> = {
  ACTIVO: 'bg-green-500/20 text-green-500',
  PAUSADO: 'bg-chart-5/20 text-chart-5',
  CANCELADO: 'bg-red-500/20 text-red-500',
  ENTREGADO: 'bg-blue-500/20 text-blue-500',
}

export function ProyectosView() {
  const { openProyecto, openModal } = useAppStore()
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  useEffect(() => {
    fetch('/api/proyectos')
      .then((r) => r.json())
      .then((d) => setProyectos(d.proyectos || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const activos = proyectos.filter(p => p.estadoGeneral === 'ACTIVO')
  const entregados = proyectos.filter(p => p.estadoGeneral === 'ENTREGADO')

  // Agrupar por etapa
  const porEtapa = ETAPA_ORDEN.map(etapa => ({
    etapa,
    proyectos: activos.filter(p => p.estadoFlujo === etapa),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-sm text-muted-foreground">
            {activos.length} activos · {entregados.length} entregados · Total {proyectos.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('proyecto')}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Nuevo proyecto
          </button>
          <div className="flex items-center gap-1 rounded-md border border-border/40 bg-muted/30 p-1">
            <button onClick={() => setViewMode('kanban')} className={cn('px-3 py-1 rounded text-xs font-medium', viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
              Kanban
            </button>
            <button onClick={() => setViewMode('list')} className={cn('px-3 py-1 rounded text-xs font-medium', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto scrollbar-thin">
          <div className="flex gap-3 min-w-max pb-2">
            {porEtapa.map(({ etapa, proyectos }) => (
              <div key={etapa} className="w-72 shrink-0">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', `bg-chart-1`)} />
                    <span className="text-xs font-semibold uppercase tracking-wide">{ETAPA_FLUJO_LABELS[etapa]}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{proyectos.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px] rounded-xl border border-border/40 bg-card/20 p-2">
                  {proyectos.length === 0 ? (
                    <div className="text-center py-8 text-[10px] text-muted-foreground/50">Sin proyectos</div>
                  ) : (
                    proyectos.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openProyecto(p.id)}
                        className="block w-full rounded-lg border border-border/50 bg-card/60 backdrop-blur-sm p-3 text-left hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-semibold text-primary">{p.codigo}</span>
                          {p.cotizacion && (
                            <span className="text-[10px] tabular-nums font-bold text-foreground/80">
                              {formatCurrency(p.cotizacion.total)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold leading-tight mb-1 line-clamp-2">{p.nombreProyecto}</div>
                        <div className="text-[10px] text-muted-foreground mb-2 truncate">{p.nombreArtista}</div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {p.responsable || '—'}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            {p._count.tareas} tareas
                          </span>
                        </div>
                        {p.fechaEntregaEstimada && (
                          <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Entrega: {formatDate(p.fechaEntregaEstimada, { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                        {p.urlCarpetaDrive && (
                          <a href={p.urlCarpetaDrive} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                            <ExternalLink className="h-2.5 w-2.5" />
                            Drive
                          </a>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left font-semibold">Código</th>
                <th className="px-4 py-3 text-left font-semibold">Proyecto</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Etapa</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Estado</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Responsable</th>
                <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Monto</th>
                <th className="px-4 py-3 text-left font-semibold hidden xl:table-cell">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id} onClick={() => openProyecto(p.id)} className="border-b border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">{p.codigo}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold truncate max-w-[200px]">{p.nombreProyecto}</div>
                    <div className="text-[10px] text-muted-foreground">{p.nombreArtista}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs">{p.contacto.nombre}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', etapaColors[p.estadoFlujo])}>
                      {ETAPA_FLUJO_LABELS[p.estadoFlujo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', estadoColors[p.estadoGeneral])}>
                      {ESTADO_PROYECTO_LABELS[p.estadoGeneral]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs">{p.responsable || '—'}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell tabular-nums text-xs font-medium">
                    {p.cotizacion ? formatCurrency(p.cotizacion.total) : '—'}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                    {p.fechaEntregaEstimada ? formatDate(p.fechaEntregaEstimada, { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
