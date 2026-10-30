'use client'

import { useState } from 'react'
import { Bell, Sparkles, ChevronDown, Check, MapPin, Phone } from 'lucide-react'
import { useAppStore, UserRole } from '@/lib/store'
import { ROLE_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'

const ROLES: UserRole[] = ['ADMIN', 'PRODUCTOR', 'A&R', 'CONTABILIDAD', 'CLIENTE']

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Martha · Acceso total al sistema',
  PRODUCTOR: 'Aarón / Caleb · Tareas, proyectos, contactos',
  'A&R': 'Oseías · Pre-producción y contactos',
  CONTABILIDAD: 'Finanzas, contratos, cotizaciones',
  CLIENTE: 'Vista limitada del cliente',
}

export function Topbar() {
  const { role, setRole, currentView, toggleAIPanel } = useAppStore()
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const titleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    contactos: 'Contactos',
    'contacto-detalle': 'Detalle de Contacto',
    cotizaciones: 'Cotizaciones',
    proyectos: 'Proyectos',
    'proyecto-detalle': 'Detalle de Proyecto',
    tareas: 'Tareas',
    servicios: 'Servicios',
    contratos: 'Contratos',
    finanzas: 'Finanzas',
    agenda: 'Agenda',
    inventario: 'Inventario',
    asistencia: 'Asistencia',
    informes: 'Informes Mensuales',
    integraciones: 'Integraciones Google',
    configuracion: 'Configuración',
    equipo: 'Equipo',
    ai: 'Asistente IA',
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">
          {titleMap[currentView] || 'SEAGULL RECORDS'}
        </h1>
        <span className="hidden rounded-md border border-border/40 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:inline-block">
          Chimbote, Perú
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Contacto rápido */}
        <div className="hidden lg:flex items-center gap-3 mr-2 text-[11px] text-muted-foreground">
          <a href="tel:910216278" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Phone className="h-3 w-3" />
            910 216 278
          </a>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Chimbote
          </span>
        </div>

        {/* AI Quick access */}
        <button
          onClick={toggleAIPanel}
          className="hidden items-center gap-2 rounded-md border border-chart-2/30 bg-chart-2/10 px-3 py-1.5 text-xs font-medium text-chart-2 transition-colors hover:bg-chart-2/20 sm:flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Asistente IA</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border/40 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-chart-2 animate-pulse-neon" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-border/60 bg-popover shadow-2xl z-50">
                <div className="border-b border-border/50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Notificaciones</span>
                    <span className="rounded bg-chart-2/20 px-1.5 py-0.5 text-[10px] font-bold text-chart-2">
                      3 nuevas
                    </span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {[
                    { title: '5 tareas vencen esta semana', desc: 'PRY-2026-004 · PRY-2026-005', time: 'hace 2h', urgent: true },
                    { title: 'Saldos pendientes: S/.8,950', desc: '4 contratos con saldo por cobrar', time: 'hace 5h' },
                    { title: 'Nueva cotización enviada', desc: 'COT-2026-010 · EL FER TV', time: 'hace 1d' },
                    { title: 'Cobro pendiente: Elton Bryan', desc: 'S/.4,200 · vence 15 dic', time: 'hace 2d', urgent: true },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="flex gap-3 border-b border-border/40 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          n.urgent ? 'bg-chart-2' : 'bg-primary'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold leading-tight">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</div>
                        <div className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 px-4 py-2 text-center">
                  <button className="text-[11px] text-primary hover:underline">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Role selector */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 transition-colors hover:bg-muted/60"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 to-chart-2 text-[10px] font-bold text-white">
              {ROLE_LABELS[role]?.charAt(0)}
            </div>
            <div className="hidden flex-col leading-tight text-left sm:flex">
              <span className="text-xs font-semibold">{ROLE_LABELS[role]}</span>
              <span className="text-[10px] text-muted-foreground">demo</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {roleMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-lg border border-border/60 bg-popover shadow-2xl z-50">
                <div className="border-b border-border/50 px-4 py-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Cambiar rol · demo
                  </span>
                </div>
                <div className="py-1">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r)
                        setRoleMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50',
                        role === r && 'bg-primary/10'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                          role === r
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {ROLE_LABELS[r]?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold">{ROLE_LABELS[r]}</span>
                          {role === r && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                          {ROLE_DESCRIPTIONS[r]}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border/50 px-4 py-2">
                  <p className="text-[10px] text-muted-foreground">
                    El rol cambia las vistas y permisos disponibles.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
