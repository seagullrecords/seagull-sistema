'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, TIPO_CONTACTO_LABELS, ESTADO_CONTACTO_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Filter, Grid3x3, List, Search, ChevronRight, Phone, Mail, Calendar, FileText, FolderKanban, Plus, Edit } from 'lucide-react'

interface Contacto {
  id: string
  codigo: string
  nombre: string
  dniRuc?: string | null
  email?: string | null
  telefono?: string | null
  avatar?: string | null
  tipo: string
  origen?: string | null
  estado: string
  estadoContractual?: string | null
  fechaRegistro: string
  _count: { proyectos: number; cotizaciones: number; contratos: number }
}

const tipoColors: Record<string, string> = {
  SOLISTA: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  BANDA: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  MANAGER: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  PRODUCTOR: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  SELLO: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
}

const estadoColors: Record<string, string> = {
  ACTIVO: 'bg-green-500/20 text-green-500',
  CLIENTE_ACTIVO: 'bg-green-500/20 text-green-500',
  COTIZACION_ENVIADA: 'bg-chart-5/20 text-chart-5',
  INACTIVO: 'bg-muted text-muted-foreground',
  PROSPECTO: 'bg-muted/60 text-muted-foreground/80',
}

export function ContactosView() {
  const { openContacto, openModal, openEditContacto } = useAppStore()
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('ALL')
  const [estadoFilter, setEstadoFilter] = useState('ALL')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetch('/api/contactos')
      .then((r) => r.json())
      .then((d) => setContactos(d.contactos || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = contactos.filter((c) => {
    if (search && !c.nombre.toLowerCase().includes(search.toLowerCase()) && !c.codigo.toLowerCase().includes(search.toLowerCase())) return false
    if (tipoFilter !== 'ALL' && c.tipo !== tipoFilter) return false
    if (estadoFilter !== 'ALL' && c.estado !== estadoFilter) return false
    return true
  })

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contactos</h2>
          <p className="text-sm text-muted-foreground">
            {contactos.length} contactos · {contactos.filter(c => c.estado === 'CLIENTE_ACTIVO').length} clientes activos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('contacto')}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Nuevo contacto
          </button>
          <div className="flex items-center gap-1 rounded-md border border-border/40 bg-muted/30 p-1">
            <button onClick={() => setView('grid')} className={cn('p-1.5 rounded', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <Grid3x3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setView('list')} className={cn('p-1.5 rounded', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contacto o código..."
            className="h-9 w-full rounded-md border border-border/40 bg-input/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
          />
        </div>
        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todos los tipos</option>
          <option value="SOLISTA">Solistas</option>
          <option value="BANDA">Bandas</option>
          <option value="MANAGER">Managers</option>
          <option value="PRODUCTOR">Productores</option>
          <option value="SELLO">Sellos</option>
        </select>
        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="h-9 rounded-md border border-border/40 bg-input/60 px-3 text-xs focus:border-primary/60 focus:outline-none">
          <option value="ALL">Todos los estados</option>
          <option value="CLIENTE_ACTIVO">Clientes activos</option>
          <option value="COTIZACION_ENVIADA">Cotización enviada</option>
          <option value="PROSPECTO">Prospectos</option>
        </select>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => openContacto(c.id)}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm transition-all hover-lift hover:border-primary/40 text-left"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  {c.avatar && c.avatar.trim() !== '' ? (
                    <img src={c.avatar} alt={c.nombre} className="h-11 w-11 rounded-full object-cover ring-2 ring-border/50" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 to-chart-2 text-sm font-bold text-white">
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn('rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', tipoColors[c.tipo] || 'bg-muted text-muted-foreground border-border')}>
                      {TIPO_CONTACTO_LABELS[c.tipo] || c.tipo}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold leading-tight mb-1">{c.nombre}</div>
                <div className="text-[10px] text-muted-foreground mb-3">{c.codigo} · Desde {formatDate(c.fechaRegistro, { month: 'short', year: 'numeric' })}</div>

                <div className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide mb-3', estadoColors[c.estado])}>
                  {ESTADO_CONTACTO_LABELS[c.estado] || c.estado}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-xs font-bold tabular-nums">{c._count.proyectos}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Proy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold tabular-nums">{c._count.cotizaciones}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Cot</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold tabular-nums">{c._count.contratos}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Cont</div>
                  </div>
                </div>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditContacto(c.id)
                  }}
                  className="p-1.5 rounded-md bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  title="Editar contacto"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left font-semibold">Código</th>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">Proy</th>
                <th className="px-4 py-3 text-center font-semibold">Cot</th>
                <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">Cont</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Registro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openContacto(c.id)}
                  className="border-b border-border/30 transition-colors hover:bg-muted/40 cursor-pointer"
                >
                  <td className="px-4 py-3 text-xs font-mono">{c.codigo}</td>
                  <td className="px-4 py-3 font-semibold">{c.nombre}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={cn('rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', tipoColors[c.tipo] || 'bg-muted text-muted-foreground border-border')}>
                      {TIPO_CONTACTO_LABELS[c.tipo] || c.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', estadoColors[c.estado])}>
                      {ESTADO_CONTACTO_LABELS[c.estado] || c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">{c._count.proyectos}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{c._count.cotizaciones}</td>
                  <td className="px-4 py-3 text-center tabular-nums hidden sm:table-cell">{c._count.contratos}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatDate(c.fechaRegistro)}</td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No se encontraron contactos con los filtros seleccionados.
        </div>
      )}
    </div>
  )
}
