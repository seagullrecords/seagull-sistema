'use client'

import {
  LayoutDashboard, Users, FileText, FolderKanban, CheckSquare, Music,
  ScrollText, Wallet, Calendar, Plug, UserCog, Sparkles, Search,
  Package, Clock3, FileBarChart, Settings,
} from 'lucide-react'
import { useAppStore, ViewKey, UserRole } from '@/lib/store'
import { ROLE_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'

interface NavItem {
  key: ViewKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'contactos', label: 'Contactos', icon: Users },
  { key: 'cotizaciones', label: 'Cotizaciones', icon: FileText, roles: ['ADMIN', 'PRODUCTOR', 'CONTABILIDAD'] },
  { key: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { key: 'tareas', label: 'Tareas', icon: CheckSquare, roles: ['ADMIN', 'PRODUCTOR', 'A&R'] },
  { key: 'servicios', label: 'Servicios', icon: Music },
  { key: 'contratos', label: 'Contratos', icon: ScrollText, roles: ['ADMIN', 'CONTABILIDAD'] },
  { key: 'finanzas', label: 'Finanzas', icon: Wallet, roles: ['ADMIN', 'CONTABILIDAD'] },
  { key: 'agenda', label: 'Agenda', icon: Calendar },
  { key: 'inventario', label: 'Inventario', icon: Package, roles: ['ADMIN', 'PRODUCTOR'] },
  { key: 'asistencia', label: 'Asistencia', icon: Clock3, roles: ['ADMIN', 'PRODUCTOR', 'A&R'] },
  { key: 'informes', label: 'Informes', icon: FileBarChart, roles: ['ADMIN', 'CONTABILIDAD'] },
  { key: 'integraciones', label: 'Google', icon: Plug, roles: ['ADMIN'] },
  { key: 'configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN'] },
  { key: 'equipo', label: 'Equipo', icon: UserCog, roles: ['ADMIN'] },
]

export function Sidebar() {
  const { currentView, setView, role } = useAppStore()

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-2/20 flex items-center justify-center p-1">
          <img
            src="/logo-seagull.png"
            alt="SEAGULL RECORDS"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight">SEAGULL RECORDS</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Studio OS
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar contacto, proyecto..."
            className="h-9 w-full rounded-md border border-border/40 bg-input/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 scrollbar-thin">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Operaciones
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            currentView === item.key ||
            (item.key === 'contactos' && currentView === 'contacto-detalle') ||
            (item.key === 'proyectos' && currentView === 'proyecto-detalle')
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-neon" />
              )}
            </button>
          )
        })}

        <div className="pt-4">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Asistente IA
          </div>
          <button
            onClick={() => setView('ai')}
            className={cn(
              'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
              currentView === 'ai'
                ? 'bg-chart-2/15 text-chart-2'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
            )}
          >
            <Sparkles
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                currentView === 'ai'
                  ? 'text-chart-2'
                  : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
            <span>Asistente IA</span>
            <span className="ml-auto rounded bg-chart-2/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-chart-2">
              Beta
            </span>
          </button>
        </div>
      </nav>

      {/* User role badge */}
      <div className="border-t border-border/50 p-3">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/50 px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-xs font-bold text-white">
            {ROLE_LABELS[role]?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold">Rol activo</span>
            <span className="text-[11px] text-muted-foreground">{ROLE_LABELS[role]}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
