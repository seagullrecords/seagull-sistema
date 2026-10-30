'use client'

import { useEffect, useState } from 'react'
import {
  Users, Wallet, FolderKanban, CheckSquare, TrendingUp, TrendingDown,
  AlertTriangle, Calendar, Sparkles, ArrowRight, FileText, Music, Phone,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatNumber, formatRelativeTime, daysUntil, formatDateTime } from '@/lib/format'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

interface DashboardData {
  empresa: { nombre: string; ruc: string; direccion: string; telefono: string; email: string; moneda: string; igv: number }
  kpis: {
    totalIngresos: number
    totalEgresos: number
    utilidadNeta: number
    saldosPendientes: number
    contratosConSaldoCount: number
    proyectosActivos: number
    proyectosEntregados: number
    tareasPendientes: number
    tareasVencidas: number
    tareasEstaSemana: number
    contactosActivos: number
    contactosCotizacionEnviada: number
    cotizacionesEnviadas: number
    cotizacionesAprobadas: number
    servicios: number
  }
  monthlyData: Array<{ month: string; ingresos: number; egresos: number; utilidad: number }>
  ingresosPorTipo: Array<{ tipo: string; monto: number }>
  egresosPorCategoria: Array<{ categoria: string; monto: number }>
  proyectosPorEtapa: Array<{ etapa: string; count: number; proyectos: any[] }>
  topContactos: Array<{ nombre: string; codigo: string; total: number; count: number }>
  proximosEventos: Array<{ id: string; titulo: string; tipo: string; fechaInicio: string; estado: string; contactoNombre?: string; proyectoNombre?: string }>
  actividades: Array<{ id: string; tipo: string; titulo: string; descripcion: string; severidad: string; createdAt: string; contactoNombre?: string; proyectoNombre?: string }>
  integraciones: Array<{ service: string; status: string; lastSync: string; metadata: any }>
}

const etapaColors: Record<string, string> = {
  PREPRODUCCION: 'oklch(0.62 0.24 308)',
  GRABACION: 'oklch(0.72 0.24 350)',
  EDICION: 'oklch(0.7 0.2 200)',
  MEZCLA: 'oklch(0.78 0.19 90)',
  MASTERIZACION: 'oklch(0.65 0.22 30)',
  REVISION: 'oklch(0.55 0.15 280)',
  ENTREGA: 'oklch(0.7 0.18 160)',
  FINALIZADO: 'oklch(0.5 0.1 150)',
}

const etapaLabels: Record<string, string> = {
  PREPRODUCCION: 'Pre-prod',
  GRABACION: 'Grabación',
  EDICION: 'Edición',
  MEZCLA: 'Mezcla',
  MASTERIZACION: 'Master',
  REVISION: 'Revisión',
  ENTREGA: 'Entrega',
  FINALIZADO: 'Final',
}

const categoriaLabels: Record<string, string> = {
  SERVICIOS: 'Servicios',
  EQUIPO: 'Equipo',
  SOFTWARE: 'Software',
  PERSONAL: 'Personal',
  MARKETING: 'Marketing',
  ADMIN: 'Admin',
  RENTA: 'Renta',
  OTROS: 'Otros',
}

const tipoIngresoLabels: Record<string, string> = {
  ANTICIPO: 'Anticipos',
  SALDO: 'Saldos',
  SALA_ENSAYO: 'Sala ensayo',
  GRABACION: 'Grabación',
  OTROS: 'Otros',
}

export function DashboardView() {
  const { setView } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Cargando dashboard...</span>
        </div>
      </div>
    )
  }

  const k = data.kpis

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight gradient-text">
          {data.empresa.nombre}
        </h2>
        <p className="text-sm text-muted-foreground">
          RUC {data.empresa.ruc} · {data.empresa.direccion} · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPIs grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard
          icon={Wallet}
          label="Ingresos totales"
          value={formatCurrency(k.totalIngresos)}
          accent="green"
          trend="up"
          trendValue={`${formatCurrency(k.utilidadNeta)} utilidad`}
          onClick={() => setView('finanzas')}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Saldos por cobrar"
          value={formatCurrency(k.saldosPendientes)}
          sub={`${k.contratosConSaldoCount} contratos`}
          accent="pink"
          urgent
          onClick={() => setView('contratos')}
        />
        <KpiCard
          icon={FolderKanban}
          label="Proyectos activos"
          value={`${k.proyectosActivos}`}
          sub={`${k.proyectosEntregados} entregados`}
          accent="primary"
          onClick={() => setView('proyectos')}
        />
        <KpiCard
          icon={CheckSquare}
          label="Tareas pendientes"
          value={`${k.tareasPendientes}`}
          sub={`${k.tareasVencidas} vencidas · ${k.tareasEstaSemana} esta semana`}
          accent={k.tareasVencidas > 0 ? 'pink' : 'cyan'}
          urgent={k.tareasVencidas > 0}
          onClick={() => setView('tareas')}
        />
        <KpiCard
          icon={Users}
          label="Contactos activos"
          value={`${k.contactosActivos}`}
          sub={`${k.contactosCotizacionEnviada} cotizaciones enviadas`}
          accent="cyan"
          onClick={() => setView('contactos')}
        />
        <KpiCard
          icon={FileText}
          label="Cotizaciones"
          value={`${k.cotizacionesAprobadas}`}
          sub={`${k.cotizacionesEnviadas} enviadas`}
          accent="orange"
          onClick={() => setView('cotizaciones')}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Ingresos vs Egresos */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Ingresos vs Egresos</h3>
              <p className="text-[11px] text-muted-foreground">Últimos 6 meses · en Soles</p>
            </div>
            <button
              onClick={() => setView('finanzas')}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              Ver finanzas
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.monthlyData}>
              <defs>
                <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.62 0.24 308)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.62 0.24 308)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="egrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.24 350)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.72 0.24 350)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280 / 30%)" />
              <XAxis dataKey="month" stroke="oklch(0.62 0.02 280)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.62 0.02 280)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.14 0.01 280)',
                  border: '1px solid oklch(0.3 0.02 280 / 50%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="oklch(0.62 0.24 308)" strokeWidth={2} fill="url(#ingGrad)" />
              <Area type="monotone" dataKey="egresos" name="Egresos" stroke="oklch(0.72 0.24 350)" strokeWidth={2} fill="url(#egrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Egresos por categoría */}
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Egresos por categoría</h3>
            <p className="text-[11px] text-muted-foreground">Distribución del mes</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.egresosPorCategoria}
                dataKey="monto"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {data.egresosPorCategoria.map((entry, index) => {
                  const colors = ['#6366f1', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b', '#a855f7', '#10b981', '#64748b']
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.14 0.01 280)',
                  border: '1px solid oklch(0.3 0.02 280 / 50%)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(value: number, _name: string, props: any) => [
                  formatCurrency(value),
                  categoriaLabels[props.payload.categoria] || props.payload.categoria,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.egresosPorCategoria.slice(0, 4).map((e, i) => {
              const colors = ['#6366f1', '#ec4899', '#06b6d4', '#84cc16']
              return (
                <div key={e.categoria} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                    <span className="text-muted-foreground">{categoriaLabels[e.categoria] || e.categoria}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatCurrency(e.monto)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Proyectos por etapa (kanban preview) + Actividad */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Etapas de proyectos */}
        <div className="lg:col-span-3 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Proyectos por etapa</h3>
              <p className="text-[11px] text-muted-foreground">Flujo de producción</p>
            </div>
            <button
              onClick={() => setView('proyectos')}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              Ver proyectos
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {data.proyectosPorEtapa.map((e) => (
              <button
                key={e.etapa}
                onClick={() => setView('proyectos')}
                className="flex flex-col items-center gap-1 rounded-lg border border-border/40 bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
                <div className="text-2xl font-bold tabular-nums" style={{ color: etapaColors[e.etapa] }}>
                  {e.count}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground text-center leading-tight">
                  {etapaLabels[e.etapa]}
                </div>
              </button>
            ))}
          </div>

          {/* Top contactos */}
          <div className="mt-5 pt-4 border-t border-border/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Top clientes por ingresos
            </div>
            <div className="space-y-2">
              {data.topContactos.map((c, i) => (
                <div key={c.codigo} className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{c.nombre}</div>
                    <div className="text-[10px] text-muted-foreground">{c.codigo} · {c.count} transacciones</div>
                  </div>
                  <div className="text-xs font-bold tabular-nums text-primary">
                    {formatCurrency(c.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Actividad reciente</h3>
              <p className="text-[11px] text-muted-foreground">Feed del estudio</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-chart-2">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-pulse-neon" />
              EN VIVO
            </span>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
            {data.actividades.map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <span
                    className={cn(
                      'mt-1 h-2 w-2 shrink-0 rounded-full',
                      act.severity === 'SUCCESS' && 'bg-green-500',
                      act.severity === 'WARNING' && 'bg-chart-2',
                      act.severity === 'URGENT' && 'bg-red-500 animate-pulse',
                      act.severity === 'INFO' && 'bg-primary'
                    )}
                  />
                  <span className="flex-1 w-px bg-border/40 mt-1" />
                </div>
                <div className="flex-1 pb-3">
                  <div className="text-xs font-medium leading-snug">{act.titulo}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {act.descripcion}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {act.contactoNombre && (
                      <span className="text-[10px] text-muted-foreground/80">{act.contactoNombre}</span>
                    )}
                    {act.proyectoNombre && (
                      <>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground/80">{act.proyectoNombre}</span>
                      </>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">
                      · {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Próximos eventos + Integraciones Google */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Próximos eventos</h3>
              <p className="text-[11px] text-muted-foreground">Agenda del estudio</p>
            </div>
            <button
              onClick={() => setView('agenda')}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              Ver agenda
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {data.proximosEventos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No hay eventos próximos</p>
            ) : (
              data.proximosEventos.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col items-center justify-center w-12 shrink-0 rounded-md bg-primary/10 p-1.5 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-primary/70">
                      {new Date(ev.fechaInicio).toLocaleDateString('es-PE', { month: 'short' })}
                    </div>
                    <div className="text-sm font-bold text-primary tabular-nums">
                      {new Date(ev.fechaInicio).getDate()}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {new Date(ev.fechaInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{ev.titulo}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="rounded bg-muted px-1 py-0.5 uppercase tracking-wide">{ev.tipo.replace(/_/g, ' ')}</span>
                      {ev.contactoNombre && <span>· {ev.contactoNombre}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Integraciones Google Workspace</h3>
              <p className="text-[11px] text-muted-foreground">Estado de conexión</p>
            </div>
            <button
              onClick={() => setView('integraciones')}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              Ver todas
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.integraciones.map((i) => (
              <div
                key={i.service}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  i.status === 'CONNECTED'
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {i.service}
                  </span>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      i.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                    )}
                  />
                </div>
                <div className="text-[11px] text-foreground/80">
                  {i.status === 'CONNECTED' ? 'Conectado' : 'Sin conectar'}
                </div>
                {i.lastSync && (
                  <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                    sync {formatRelativeTime(i.lastSync)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI banner */}
      <div className="rounded-xl border border-chart-2/30 bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-1/10 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold">Insight del asistente IA</h3>
              <span className="rounded bg-chart-2/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-chart-2">
                Beta
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detecté <strong className="text-foreground">{formatCurrency(k.saldosPendientes)} por cobrar</strong> en {k.contratosConSaldoCount} contratos activos y
              <strong className="text-foreground"> {k.tareasVencidas} tareas vencidas</strong>. Tu margen de utilidad actual es del
              <strong className="text-foreground"> {k.totalIngresos > 0 ? ((k.utilidadNeta / k.totalIngresos) * 100).toFixed(1) : 0}%</strong>.
              ¿Quieres que genere un análisis completo del estudio?
            </p>
            <button
              onClick={() => setView('ai')}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-chart-2/20 px-3 py-1.5 text-xs font-medium text-chart-2 hover:bg-chart-2/30 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Abrir asistente IA
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  accent?: 'primary' | 'cyan' | 'pink' | 'green' | 'orange'
  urgent?: boolean
  trend?: 'up' | 'down'
  trendValue?: string
  onClick?: () => void
}

function KpiCard({ icon: Icon, label, value, sub, accent = 'primary', urgent, trend, trendValue, onClick }: KpiCardProps) {
  const accents: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    cyan: 'text-chart-3 bg-chart-3/10',
    pink: 'text-chart-2 bg-chart-2/10',
    green: 'text-green-500 bg-green-500/10',
    orange: 'text-chart-5 bg-chart-5/10',
  }
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card/40 backdrop-blur-sm p-4 text-left transition-all',
        urgent ? 'border-chart-2/40' : 'border-border/50',
        onClick && 'hover-lift cursor-pointer hover:border-primary/40'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accents[accent])}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-0.5 text-[10px] font-semibold',
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          )}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          </div>
        )}
      </div>
      <div className="text-xl font-bold tabular-nums tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>}
      {trendValue && (
        <div className="text-[10px] text-green-500 mt-1">{trendValue}</div>
      )}
    </button>
  )
}
