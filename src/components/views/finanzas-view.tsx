'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, METODO_PAGO_LABELS, CATEGORIA_EGRESO_LABELS, ESTADO_INGRESO_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Download, Plus } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  AreaChart, Area,
} from 'recharts'

interface FinanzasData {
  ingresos: Array<{
    id: string
    codigo: string
    concepto: string
    monto: number
    fecha: string
    metodo?: string | null
    comprobante?: string | null
    estado: string
    contacto?: { id: string; nombre: string; codigo: string } | null
    proyecto?: { id: string; codigo: string } | null
  }>
  egresos: Array<{
    id: string
    codigo: string
    categoria: string
    concepto: string
    monto: number
    fecha: string
    proveedor?: string | null
    metodo?: string | null
    comprobante?: string | null
    estado: string
  }>
  summary: {
    totalIngresos: number
    totalEgresos: number
    utilidadNeta: number
    pendientesCobrar: number
    margenUtilidad: number
  }
  porMetodo: Array<{ metodo: string; monto: number }>
  egresosPorCategoria: Array<{ categoria: string; monto: number }>
}

export function FinanzasView() {
  const { openContacto, openModal } = useAppStore()
  const [data, setData] = useState<FinanzasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'resumen' | 'ingresos' | 'egresos'>('resumen')

  const load = () => {
    fetch('/api/finanzas')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading || !data) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finanzas</h2>
          <p className="text-sm text-muted-foreground">
            {data.ingresos.length + data.egresos.length} transacciones · Margen {data.summary.margenUtilidad.toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('ingreso')}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-500 hover:bg-green-500/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Nuevo ingreso
          </button>
          <button
            onClick={() => openModal('egreso')}
            className="inline-flex items-center gap-1.5 rounded-md border border-chart-2/40 bg-chart-2/10 px-3 py-1.5 text-xs font-medium text-chart-2 hover:bg-chart-2/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Nuevo egreso
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs font-medium hover:bg-muted/60 transition-colors">
            <Download className="h-3 w-3" />
            Sheets
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums text-green-500">{formatCurrency(data.summary.totalIngresos)}</div>
          <div className="text-[11px] text-muted-foreground">Ingresos totales</div>
        </div>
        <div className="rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums text-chart-2">{formatCurrency(data.summary.totalEgresos)}</div>
          <div className="text-[11px] text-muted-foreground">Egresos totales</div>
        </div>
        <div className={cn('rounded-xl border p-4', data.summary.utilidadNeta >= 0 ? 'border-primary/30 bg-primary/5' : 'border-red-500/30 bg-red-500/5')}>
          <div className="flex items-center justify-between mb-2">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', data.summary.utilidadNeta >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500')}>
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className={cn('text-xl font-bold tabular-nums', data.summary.utilidadNeta >= 0 ? 'text-primary' : 'text-red-500')}>
            {formatCurrency(data.summary.utilidadNeta)}
          </div>
          <div className="text-[11px] text-muted-foreground">Utilidad neta</div>
        </div>
        <div className="rounded-xl border border-chart-5/30 bg-chart-5/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold tabular-nums text-chart-5">{formatCurrency(data.summary.pendientesCobrar)}</div>
          <div className="text-[11px] text-muted-foreground">Pendientes de cobro</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/40">
        <div className="flex gap-1">
          <button onClick={() => setTab('resumen')} className={cn('px-4 py-2.5 text-xs font-medium border-b-2 transition-colors', tab === 'resumen' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>Resumen</button>
          <button onClick={() => setTab('ingresos')} className={cn('px-4 py-2.5 text-xs font-medium border-b-2 transition-colors', tab === 'ingresos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>Ingresos ({data.ingresos.length})</button>
          <button onClick={() => setTab('egresos')} className={cn('px-4 py-2.5 text-xs font-medium border-b-2 transition-colors', tab === 'egresos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>Egresos ({data.egresos.length})</button>
        </div>
      </div>

      {/* Resumen tab */}
      {tab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Egresos por categoría</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.egresosPorCategoria.map(e => ({ ...e, label: CATEGORIA_EGRESO_LABELS[e.categoria] || e.categoria }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280 / 30%)" />
                <XAxis type="number" stroke="oklch(0.62 0.02 280)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="label" stroke="oklch(0.62 0.02 280)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.14 0.01 280)',
                    border: '1px solid oklch(0.3 0.02 280 / 50%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Monto']}
                />
                <Bar dataKey="monto" radius={[0, 4, 4, 0]} fill="oklch(0.72 0.24 350)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Ingresos por método de pago</h3>
            <div className="space-y-3">
              {data.porMetodo.map((m) => {
                const max = Math.max(...data.porMetodo.map(x => x.monto))
                const pct = (m.monto / max) * 100
                return (
                  <div key={m.metodo}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{METODO_PAGO_LABELS[m.metodo] || m.metodo}</span>
                      <span className="tabular-nums text-muted-foreground">{formatCurrency(m.monto)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border/40">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resumen financiero</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margen de utilidad</span>
                  <span className={cn('font-bold tabular-nums', data.summary.margenUtilidad >= 30 ? 'text-green-500' : data.summary.margenUtilidad >= 15 ? 'text-chart-5' : 'text-chart-2')}>
                    {data.summary.margenUtilidad.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ingresos por egreso</span>
                  <span className="font-bold tabular-nums">
                    {(data.summary.totalIngresos / Math.max(data.summary.totalEgresos, 1)).toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendiente de cobro</span>
                  <span className="font-bold tabular-nums text-chart-5">{formatCurrency(data.summary.pendientesCobrar)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingresos tab */}
      {tab === 'ingresos' && (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Código</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Concepto</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Método</th>
                  <th className="px-4 py-3 text-left font-semibold hidden xl:table-cell">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.ingresos.map((i) => (
                  <tr key={i.id} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono">{i.codigo}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(i.fecha, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{i.concepto}</div>
                      {i.comprobante && <div className="text-[10px] text-muted-foreground">{i.comprobante}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {i.contacto ? (
                        <button onClick={() => openContacto(i.contacto!.id)} className="text-xs hover:text-primary transition-colors text-left">
                          <div className="font-medium">{i.contacto!.nombre}</div>
                          <div className="text-[10px] text-muted-foreground">{i.contacto!.codigo}</div>
                        </button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {i.metodo ? METODO_PAGO_LABELS[i.metodo] || i.metodo : '—'}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                        i.estado === 'CONFIRMADO' ? 'bg-green-500/20 text-green-500' :
                        i.estado === 'PENDIENTE' ? 'bg-chart-5/20 text-chart-5' : 'bg-muted text-muted-foreground')}>
                        {ESTADO_INGRESO_LABELS[i.estado] || i.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-green-500">+{formatCurrency(i.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Egresos tab */}
      {tab === 'egresos' && (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Código</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Concepto</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Proveedor</th>
                  <th className="px-4 py-3 text-left font-semibold hidden xl:table-cell">Método</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.egresos.map((e) => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono">{e.codigo}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(e.fecha, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{e.concepto}</div>
                      {e.comprobante && <div className="text-[10px] text-muted-foreground">{e.comprobante}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        {CATEGORIA_EGRESO_LABELS[e.categoria] || e.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{e.proveedor || '—'}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                      {e.metodo ? METODO_PAGO_LABELS[e.metodo] || e.metodo : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-chart-2">-{formatCurrency(e.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
