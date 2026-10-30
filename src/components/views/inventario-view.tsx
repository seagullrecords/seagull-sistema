'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate, INVENTARIO_CATEGORIA_LABELS, INVENTARIO_ESTADO_LABELS, INVENTARIO_ESTADO_COLORS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Package, Plus, Search, MapPin, Wrench, ArrowRight, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface InventarioItem {
  id: string
  codigo: string
  nombre: string
  categoria: string
  marca?: string | null
  modelo?: string | null
  numeroSerie?: string | null
  estado: string
  ubicacion?: string | null
  fechaAdquisicion?: string | null
  valorCompra?: number | null
  notas?: string | null
  prestamos: Array<{ id: string; prestadoA: string; fechaPrestamo: string; fechaDevolucionEsperada?: string | null }>
  mantenimientos: Array<{ id: string; tipo: string; estado: string; descripcion: string }>
}

const categoriaColors: Record<string, string> = {
  MICROFONO: 'bg-chart-1/20 text-chart-1',
  CABLE: 'bg-chart-3/20 text-chart-3',
  INTERFACE: 'bg-chart-2/20 text-chart-2',
  INSTRUMENTO: 'bg-chart-5/20 text-chart-5',
  MONITOR: 'bg-purple-500/20 text-purple-500',
  ACCESORIO: 'bg-blue-500/20 text-blue-500',
  OTRO: 'bg-muted text-muted-foreground',
}

export function InventarioView() {
  const { openModal } = useAppStore()
  const [items, setItems] = useState<InventarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('ALL')
  const [estadoFilter, setEstadoFilter] = useState('ALL')

  const load = () => {
    fetch('/api/inventario')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter((i) => {
    if (search && !i.nombre.toLowerCase().includes(search.toLowerCase()) && !i.codigo.toLowerCase().includes(search.toLowerCase())) return false
    if (categoriaFilter !== 'ALL' && i.categoria !== categoriaFilter) return false
    if (estadoFilter !== 'ALL' && i.estado !== estadoFilter) return false
    return true
  })

  const totalValor = items.reduce((s, i) => s + (i.valorCompra || 0), 0)
  const disponibles = items.filter(i => i.estado === 'DISPONIBLE').length
  const prestados = items.filter(i => i.estado === 'PRESTADO').length
  const enReparacion = items.filter(i => i.estado === 'EN_REPARACION').length

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} equipos · Valor total {formatCurrency(totalValor)}
          </p>
        </div>
        <button
          onClick={() => openModal('inventario')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Nuevo equipo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="text-xl font-bold tabular-nums text-green-500">{disponibles}</div>
          <div className="text-[11px] text-muted-foreground">Disponibles</div>
        </div>
        <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-4">
          <div className="text-xl font-bold tabular-nums text-chart-5">{prestados}</div>
          <div className="text-[11px] text-muted-foreground">Prestados</div>
        </div>
        <div className="rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
          <div className="text-xl font-bold tabular-nums text-chart-2">{enReparacion}</div>
          <div className="text-[11px] text-muted-foreground">En reparación</div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="text-xl font-bold tabular-nums text-primary">{formatCurrency(totalValor)}</div>
          <div className="text-[11px] text-muted-foreground">Valor total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="h-9 w-full rounded-md border border-border/40 bg-input/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
          />
        </div>
        <select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todas las categorías</option>
          {Object.entries(INVENTARIO_CATEGORIA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todos los estados</option>
          {Object.entries(INVENTARIO_ESTADO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Grid de items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 transition-all hover-lift hover:border-primary/40">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', INVENTARIO_ESTADO_COLORS[item.estado])}>
                {INVENTARIO_ESTADO_LABELS[item.estado]}
              </span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mb-1">{item.codigo}</div>
            <div className="text-sm font-bold leading-tight mb-1">{item.nombre}</div>
            {item.marca && (
              <div className="text-[11px] text-muted-foreground">
                {item.marca}{item.modelo && ` · ${item.modelo}`}
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide', categoriaColors[item.categoria] || 'bg-muted text-muted-foreground')}>
                {INVENTARIO_CATEGORIA_LABELS[item.categoria] || item.categoria}
              </span>
              {item.ubicacion && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  {item.ubicacion}
                </span>
              )}
            </div>

            {/* Préstamo activo */}
            {item.prestamos.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30 rounded-md bg-chart-5/5 p-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-chart-5 mb-0.5">Prestado a</div>
                <div className="text-xs font-medium">{item.prestamos[0].prestadoA}</div>
                {item.prestamos[0].fechaDevolucionEsperada && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Devolución: {formatDate(item.prestamos[0].fechaDevolucionEsperada, { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            )}

            {/* Mantenimiento activo */}
            {item.mantenimientos.length > 0 && item.mantenimientos[0].estado !== 'COMPLETADO' && (
              <div className="mt-2 rounded-md bg-chart-2/5 p-2">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-chart-2 mb-0.5">
                  <Wrench className="h-2.5 w-2.5" />
                  Mantenimiento {item.mantenimientos[0].estado.toLowerCase()}
                </div>
                <div className="text-[10px] text-muted-foreground">{item.mantenimientos[0].descripcion}</div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-[10px]">
              {item.valorCompra && (
                <span className="font-semibold tabular-nums">{formatCurrency(item.valorCompra)}</span>
              )}
              {item.fechaAdquisicion && (
                <span className="text-muted-foreground">Desde {formatDate(item.fechaAdquisicion, { year: 'numeric' })}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No se encontraron equipos con los filtros.</div>
      )}
    </div>
  )
}
