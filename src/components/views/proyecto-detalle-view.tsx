'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, ESTADO_PROYECTO_LABELS, ETAPA_FLUJO_LABELS, ESTADO_TAREA_LABELS, daysUntil, RESPONSABLES } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowLeft, FolderKanban, ExternalLink, User, Calendar, CheckCircle2, Clock, FileText, Wallet } from 'lucide-react'

interface ProyectoDetalle {
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
  urlAppSheet?: string | null
  observaciones?: string | null
  contacto: any
  cotizacion?: any
  contratos: any[]
  tareas: any[]
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

const tareaEstadoColors: Record<string, string> = {
  PENDIENTE: 'bg-chart-5/20 text-chart-5',
  EN_PROGRESO: 'bg-chart-3/20 text-chart-3',
  COMPLETADA: 'bg-green-500/20 text-green-500',
  CANCELADA: 'bg-red-500/20 text-red-500',
}

export function ProyectoDetalleView() {
  const { selectedProyectoId, setView, openContacto } = useAppStore()
  const [proyecto, setProyecto] = useState<ProyectoDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedProyectoId) return
    fetch(`/api/proyectos/${selectedProyectoId}`)
      .then((r) => r.json())
      .then((d) => setProyecto(d.proyecto))
      .finally(() => setLoading(false))
  }, [selectedProyectoId])

  if (loading) return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!proyecto) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Proyecto no encontrado</p>
      <button onClick={() => setView('proyectos')} className="text-primary hover:underline text-sm">Volver a proyectos</button>
    </div>
  )

  const tareasCompletadas = proyecto.tareas.filter(t => t.estado === 'COMPLETADA').length
  const tareasTotales = proyecto.tareas.length
  const pctAvance = tareasTotales > 0 ? (tareasCompletadas / tareasTotales) * 100 : 0
  const diasParaEntrega = proyecto.fechaEntregaEstimada ? daysUntil(proyecto.fechaEntregaEstimada) : null

  // Agrupar tareas por etapa
  const etapas = ['Preproducción', 'Grabación', 'Edición', 'Mezcla', 'Masterización', 'Revisión', 'Entrega']
  const tareasPorEtapa = etapas.map(etapa => ({
    etapa,
    tareas: proyecto.tareas.filter(t => t.etapa === etapa),
  })).filter(g => g.tareas.length > 0)

  return (
    <div className="space-y-6">
      <button onClick={() => setView('proyectos')} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a proyectos
      </button>

      {/* Header */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono font-semibold text-primary">{proyecto.codigo}</span>
                <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', etapaColors[proyecto.estadoFlujo])}>
                  {ETAPA_FLUJO_LABELS[proyecto.estadoFlujo]}
                </span>
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  proyecto.estadoGeneral === 'ENTREGADO' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500')}>
                  {ESTADO_PROYECTO_LABELS[proyecto.estadoGeneral] || proyecto.estadoGeneral}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{proyecto.nombreProyecto}</h1>
              <button onClick={() => openContacto(proyecto.contacto.id)} className="text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors flex items-center gap-1">
                <User className="h-3 w-3" />
                {proyecto.nombreArtista} · {proyecto.contacto.codigo}
              </button>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                {proyecto.responsable && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Resp: <strong className="text-foreground">{proyecto.responsable}</strong>
                  </span>
                )}
                {proyecto.fechaInicio && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Inicio: {formatDate(proyecto.fechaInicio, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {proyecto.fechaEntregaEstimada && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Entrega: {formatDate(proyecto.fechaEntregaEstimada, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {diasParaEntrega !== null && diasParaEntrega > 0 && (
                      <span className="text-primary font-semibold ml-1">({diasParaEntrega}d)</span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Avance</div>
              <div className="text-3xl font-bold tabular-nums text-primary">{pctAvance.toFixed(0)}%</div>
              <div className="text-[10px] text-muted-foreground">{tareasCompletadas}/{tareasTotales} tareas completadas</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-chart-1 to-chart-2 transition-all" style={{ width: `${pctAvance}%` }} />
            </div>
          </div>

          {/* Drive link */}
          {proyecto.urlCarpetaDrive && (
            <a href={proyecto.urlCarpetaDrive} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-card/40 px-3 py-1.5 text-xs hover:bg-card/80 transition-colors">
              <ExternalLink className="h-3 w-3" />
              Abrir carpeta en Drive
            </a>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
          <CheckCircle2 className="h-4 w-4 text-green-500 mb-2" />
          <div className="text-lg font-bold tabular-nums">{tareasCompletadas}</div>
          <div className="text-[11px] text-muted-foreground">Tareas completadas</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
          <Clock className="h-4 w-4 text-chart-5 mb-2" />
          <div className="text-lg font-bold tabular-nums">{proyecto.tareas.filter(t => t.estado === 'PENDIENTE').length}</div>
          <div className="text-[11px] text-muted-foreground">Tareas pendientes</div>
        </div>
        {proyecto.cotizacion && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <Wallet className="h-4 w-4 text-primary mb-2" />
            <div className="text-lg font-bold tabular-nums text-primary">{formatCurrency(proyecto.cotizacion.total)}</div>
            <div className="text-[11px] text-muted-foreground">Cotización</div>
          </div>
        )}
        {proyecto.contratos[0] && (
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
            <FileText className="h-4 w-4 text-chart-3 mb-2" />
            <div className="text-lg font-bold tabular-nums">{proyecto.contratos.length}</div>
            <div className="text-[11px] text-muted-foreground">Contrato(s)</div>
          </div>
        )}
      </div>

      {/* Tareas por etapa */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold mb-4">Tareas del proyecto</h3>
        <div className="space-y-4">
          {tareasPorEtapa.map(({ etapa, tareas }) => (
            <div key={etapa}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', etapaColors[tareas[0]?.etapa] || 'bg-muted text-muted-foreground border-border')}>
                  {etapa}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {tareas.filter(t => t.estado === 'COMPLETADA').length}/{tareas.length} completadas
                </span>
              </div>
              <div className="space-y-1.5 pl-2">
                {tareas.map((t) => {
                  const dias = t.fechaLimite ? daysUntil(t.fechaLimite) : null
                  const vencida = t.estado === 'PENDIENTE' && dias !== null && dias < 0
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-md border border-border/30 bg-card/30 p-2.5">
                      <span className={cn('h-2 w-2 rounded-full shrink-0',
                        t.estado === 'COMPLETADA' ? 'bg-green-500' :
                        t.estado === 'EN_PROGRESO' ? 'bg-chart-3' :
                        vencida ? 'bg-red-500' : 'bg-chart-5'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{t.nombre}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {t.codigo} · Resp: {t.responsable || '—'}
                          {t.fechaLimite && (
                            <span className={cn('ml-2', vencida ? 'text-red-500 font-bold' : dias !== null && dias <= 3 ? 'text-chart-5' : '')}>
                              · {vencida ? 'Vencida' : dias === 0 ? 'Hoy' : dias! > 0 ? `En ${dias}d` : formatDate(t.fechaLimite, { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide', tareaEstadoColors[t.estado])}>
                        {ESTADO_TAREA_LABELS[t.estado]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
