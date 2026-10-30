'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, ESTADO_TAREA_LABELS, ETAPA_FLUJO_LABELS, daysUntil, RESPONSABLES } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Filter, Plus } from 'lucide-react'

interface Tarea {
  id: string
  codigo: string
  nombre: string
  etapa: string
  responsable?: string | null
  fechaLimite?: string | null
  fechaCompletada?: string | null
  estado: string
  prioridad: string
  proyecto: { id: string; codigo: string; nombreProyecto: string; contacto: { nombre: string } }
}

const etapaColors: Record<string, string> = {
  PREPRODUCCION: 'bg-chart-1/20 text-chart-1',
  GRABACION: 'bg-chart-2/20 text-chart-2',
  EDICION: 'bg-chart-3/20 text-chart-3',
  MEZCLA: 'bg-chart-5/20 text-chart-5',
  MASTERIZACION: 'bg-purple-500/20 text-purple-500',
  REVISION: 'bg-blue-500/20 text-blue-500',
  ENTREGA: 'bg-green-500/20 text-green-500',
}

const estadoColors: Record<string, string> = {
  PENDIENTE: 'bg-chart-5/20 text-chart-5',
  EN_PROGRESO: 'bg-chart-3/20 text-chart-3',
  COMPLETADA: 'bg-green-500/20 text-green-500',
  CANCELADA: 'bg-red-500/20 text-red-500',
}

const prioridadColors: Record<string, string> = {
  ALTA: 'border-l-chart-2',
  MEDIA: 'border-l-chart-5',
  BAJA: 'border-l-chart-3',
  URGENTE: 'border-l-red-500',
}

export function TareasView() {
  const { openModal } = useAppStore()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState('PENDIENTE')
  const [etapaFilter, setEtapaFilter] = useState('ALL')
  const [responsableFilter, setResponsableFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/tareas')
      .then((r) => r.json())
      .then((d) => setTareas(d.tareas || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const filtered = tareas.filter(t => {
    if (estadoFilter !== 'ALL' && t.estado !== estadoFilter) return false
    if (etapaFilter !== 'ALL' && t.etapa !== etapaFilter) return false
    if (responsableFilter !== 'ALL' && t.responsable !== responsableFilter) return false
    return true
  })

  const hoy = new Date()
  const vencidas = tareas.filter(t => t.estado === 'PENDIENTE' && t.fechaLimite && new Date(t.fechaLimite) < hoy).length
  const estaSemana = tareas.filter(t => {
    if (t.estado !== 'PENDIENTE' || !t.fechaLimite) return false
    const dias = daysUntil(t.fechaLimite)
    return dias >= 0 && dias <= 7
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tareas</h2>
          <p className="text-sm text-muted-foreground">
            {tareas.length} tareas totales · {filtered.length} mostradas · {vencidas} vencidas · {estaSemana} esta semana
          </p>
        </div>
        <button
          onClick={() => openModal('tarea')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Nueva tarea
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums">{tareas.filter(t => t.estado === 'PENDIENTE').length}</div>
          <div className="text-[11px] text-muted-foreground">Pendientes</div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums">{vencidas}</div>
          <div className="text-[11px] text-muted-foreground">Vencidas</div>
        </div>
        <div className="rounded-xl border border-chart-3/30 bg-chart-3/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums">{estaSemana}</div>
          <div className="text-[11px] text-muted-foreground">Esta semana</div>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums">{tareas.filter(t => t.estado === 'COMPLETADA').length}</div>
          <div className="text-[11px] text-muted-foreground">Completadas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-3">
        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PROGRESO">En progreso</option>
          <option value="COMPLETADA">Completadas</option>
        </select>
        <select value={etapaFilter} onChange={(e) => setEtapaFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todas las etapas</option>
          <option value="PREPRODUCCION">Preproducción</option>
          <option value="GRABACION">Grabación</option>
          <option value="EDICION">Edición</option>
          <option value="MEZCLA">Mezcla</option>
          <option value="MASTERIZACION">Masterización</option>
          <option value="REVISION">Revisión</option>
          <option value="ENTREGA">Entrega</option>
        </select>
        <select value={responsableFilter} onChange={(e) => setResponsableFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todos los responsables</option>
          {RESPONSABLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((t) => {
          const dias = t.fechaLimite ? daysUntil(t.fechaLimite) : null
          const vencida = t.estado === 'PENDIENTE' && dias !== null && dias < 0
          return (
            <div
              key={t.id}
              className={cn(
                'rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm p-3 border-l-4',
                prioridadColors[t.prioridad] || 'border-l-border'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{t.codigo}</span>
                    <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', etapaColors[t.etapa])}>
                      {ETAPA_FLUJO_LABELS[t.etapa]}
                    </span>
                    <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide', estadoColors[t.estado])}>
                      {ESTADO_TAREA_LABELS[t.estado]}
                    </span>
                  </div>
                  <div className="text-sm font-medium leading-snug">{t.nombre}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 truncate">
                    {t.proyecto.codigo} · {t.proyecto.nombreProyecto} · {t.proyecto.contacto.nombre}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] sm:w-48 sm:text-right">
                  <div>
                    <div className="text-muted-foreground">{t.responsable || '—'}</div>
                    {t.fechaLimite && (
                      <div className={cn('tabular-nums', vencida ? 'text-red-500 font-bold' : dias !== null && dias <= 3 ? 'text-chart-5' : 'text-muted-foreground')}>
                        {vencida ? 'Vencida' : dias === 0 ? 'Hoy' : dias! > 0 ? `En ${dias}d` : formatDate(t.fechaLimite, { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No hay tareas con esos filtros.</div>
      )}
    </div>
  )
}
