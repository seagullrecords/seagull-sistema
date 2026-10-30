'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency } from '@/lib/format'
import { Music, Clock, Plus } from 'lucide-react'

interface Servicio {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  unidad: string
  precioBase: number
  igv: number
  tiempoEstimado?: string | null
  activo: boolean
  _count: { cotizacionItems: number }
}

export function ServiciosView() {
  const { openModal } = useAppStore()
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/servicios')
      .then((r) => r.json())
      .then((d) => setServicios(d.servicios || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const totalCatalogo = servicios.reduce((s, sv) => s + sv.precioBase, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Servicios</h2>
          <p className="text-sm text-muted-foreground">
            {servicios.length} servicios activos · Catálogo total {formatCurrency(totalCatalogo)}
          </p>
        </div>
        <button
          onClick={() => openModal('servicio')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Nuevo servicio
        </button>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map((s) => {
          const precioConIgv = s.precioBase * (1 + s.igv)
          return (
            <div key={s.id} className="group rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 transition-all hover-lift hover:border-primary/40">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Music className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{s.codigo}</span>
              </div>
              <h3 className="text-base font-semibold mb-1">{s.nombre}</h3>
              {s.descripcion && (
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{s.descripcion}</p>
              )}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/30">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Precio base</div>
                  <div className="text-base font-bold tabular-nums text-primary">{formatCurrency(s.precioBase)}</div>
                  <div className="text-[10px] text-muted-foreground">+ IGV: {formatCurrency(precioConIgv)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Unidad</div>
                  <div className="text-sm font-medium">{s.unidad}</div>
                  {s.tiempoEstimado && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {s.tiempoEstimado}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{s._count.cotizacionItems} cotizaciones</span>
                <span className={s.activo ? 'text-green-500' : 'text-muted-foreground'}>
                  {s.activo ? '● Activo' : '○ Inactivo'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
