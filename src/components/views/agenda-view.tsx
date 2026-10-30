'use client'

import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react'

interface Evento {
  id: string
  titulo: string
  descripcion?: string | null
  fechaInicio: string
  fechaFin?: string | null
  tipo: string
  estado: string
  ubicacion?: string | null
  contacto?: { nombre: string } | null
  proyecto?: { nombreProyecto: string } | null
}

const tipoColors: Record<string, string> = {
  SESION_GRABACION: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  REUNION: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  ENTREGA: 'bg-green-500/20 text-green-500 border-green-500/30',
  PAGO: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  OTRO: 'bg-muted text-muted-foreground border-border',
}

export function AgendaView() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setEventos(d.proximosEventos || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
          <p className="text-sm text-muted-foreground">{eventos.length} eventos próximos</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3 w-3" />
          Nuevo evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              {currentMonth.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-md hover:bg-muted/60 transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted/60 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Simple calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2 // offset
              const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth()
              const hasEvent = eventos.some(e => new Date(e.fechaInicio).getDate() === day)
              return (
                <div
                  key={i}
                  className={cn(
                    'aspect-square rounded-md flex flex-col items-center justify-center text-xs',
                    day < 1 || day > 31 ? 'text-muted-foreground/30' : 'hover:bg-muted/40 cursor-pointer transition-colors',
                    isToday && 'bg-primary text-primary-foreground font-bold'
                  )}
                >
                  {day >= 1 && day <= 31 && day}
                  {hasEvent && day !== new Date().getDate() && (
                    <span className="h-1 w-1 rounded-full bg-chart-2 mt-0.5" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tipos de evento</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tipoColors).map(([tipo, color]) => (
                <span key={tipo} className={cn('rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide', color)}>
                  {tipo.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <h3 className="text-sm font-semibold mb-4">Próximos eventos</h3>
          <div className="space-y-3">
            {eventos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No hay eventos próximos</p>
            ) : (
              eventos.map((ev) => (
                <div key={ev.id} className="rounded-lg border border-border/40 p-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center w-12 shrink-0 rounded-md bg-primary/10 p-1.5 text-center">
                      <div className="text-[9px] uppercase tracking-wider text-primary/70">
                        {new Date(ev.fechaInicio).toLocaleDateString('es-PE', { month: 'short' })}
                      </div>
                      <div className="text-sm font-bold text-primary tabular-nums">{new Date(ev.fechaInicio).getDate()}</div>
                      <div className="text-[9px] text-muted-foreground">
                        {new Date(ev.fechaInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold leading-tight">{ev.titulo}</div>
                      <span className={cn('inline-block mt-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', tipoColors[ev.tipo])}>
                        {ev.tipo.replace(/_/g, ' ')}
                      </span>
                      {ev.contacto && (
                        <div className="text-[10px] text-muted-foreground mt-1">{ev.contacto.nombre}</div>
                      )}
                      {ev.ubicacion && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {ev.ubicacion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
