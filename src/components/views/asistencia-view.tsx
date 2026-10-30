'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { ROLE_LABELS, ASISTENCIA_ESTADO_LABELS, ASISTENCIA_ESTADO_COLORS, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Clock3, LogIn, LogOut, User, Calendar } from 'lucide-react'

interface ResumenUser {
  user: { id: string; name: string; role: string; avatar?: string | null }
  horasTotales: number
  diasTrabajados: number
  diasAusentes: number
  actualmenteActivo: boolean
  checkIn?: string | null
}

interface RegistroAsistencia {
  id: string
  fecha: string
  checkIn?: string | null
  checkOut?: string | null
  horasTrabajadas: number
  estado: string
  observaciones?: string | null
  user: { id: string; name: string; role: string; avatar?: string | null }
}

export function AsistenciaView() {
  const { role } = useAppStore()
  const [resumen, setResumen] = useState<ResumenUser[]>([])
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = () => {
    fetch('/api/asistencia')
      .then((r) => r.json())
      .then((d) => {
        setResumen(d.resumen || [])
        setRegistros(d.registros || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCheck = async (userId: string, action: 'check-in' | 'check-out', userName: string) => {
    setActionLoading(`${userId}-${action}`)
    try {
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        alert(`✓ ${action === 'check-in' ? 'Check-in' : 'Check-out'} de ${userName} registrado`)
        load()
      }
    } catch {
      alert('Error al registrar')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const totalHorasSemana = resumen.reduce((s, r) => s + r.horasTotales, 0)
  const activosAhora = resumen.filter(r => r.actualmenteActivo).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Control de Asistencia</h2>
        <p className="text-sm text-muted-foreground">
          {resumen.length} miembros · {activosAhora} activos ahora · {totalHorasSemana.toFixed(1)} horas esta semana
        </p>
      </div>

      {/* Resumen cards por usuario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {resumen.map((r) => (
          <div
            key={r.user.id}
            className={cn(
              'rounded-xl border bg-card/40 backdrop-blur-sm p-4 transition-all',
              r.actualmenteActivo ? 'border-green-500/40' : 'border-border/50'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                {r.user.avatar && r.user.avatar.trim() !== "" ? (
                  <img src={r.user.avatar} alt={r.user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-sm font-bold text-white">
                    {r.user.name.charAt(0)}
                  </div>
                )}
                {r.actualmenteActivo && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{r.user.name}</div>
                <div className="text-[10px] text-muted-foreground">{ROLE_LABELS[r.user.role]}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div>
                <div className="text-base font-bold tabular-nums text-primary">{r.horasTotales.toFixed(1)}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Horas</div>
              </div>
              <div>
                <div className="text-base font-bold tabular-nums">{r.diasTrabajados}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Días</div>
              </div>
              <div>
                <div className="text-base font-bold tabular-nums text-chart-2">{r.diasAusentes}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Ausencias</div>
              </div>
            </div>

            {/* Estado actual */}
            <div className="mb-3 text-center">
              {r.actualmenteActivo && r.checkIn ? (
                <div className="text-[10px] text-green-500 font-semibold uppercase tracking-wide">
                  ● Activo desde {new Date(r.checkIn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sin check-in hoy</div>
              )}
            </div>

            {/* Botones check-in/out (visible para admin y productor) */}
            {(role === 'ADMIN' || role === 'PRODUCTOR' || role === 'A&R') && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleCheck(r.user.id, 'check-in', r.user.name)}
                  disabled={r.actualmenteActivo || actionLoading === `${r.user.id}-check-in`}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1.5 text-[10px] font-medium text-green-500 disabled:opacity-40 hover:bg-green-500/20 transition-colors"
                >
                  <LogIn className="h-3 w-3" />
                  Check-in
                </button>
                <button
                  onClick={() => handleCheck(r.user.id, 'check-out', r.user.name)}
                  disabled={!r.actualmenteActivo || actionLoading === `${r.user.id}-check-out`}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-chart-2/30 bg-chart-2/10 px-2 py-1.5 text-[10px] font-medium text-chart-2 disabled:opacity-40 hover:bg-chart-2/20 transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  Check-out
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Registros recientes */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="border-b border-border/50 px-5 py-3">
          <h3 className="text-sm font-semibold">Registros recientes (últimos 7 días)</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold">Miembro</th>
                <th className="px-4 py-3 text-left font-semibold">Check-in</th>
                <th className="px-4 py-3 text-left font-semibold">Check-out</th>
                <th className="px-4 py-3 text-right font-semibold">Horas</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {registros.slice(0, 30).map((r) => (
                <tr key={r.id} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.fecha).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.user.avatar && r.user.avatar.trim() !== "" ? (
                        <img src={r.user.avatar} alt={r.user.name} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-[10px] font-bold text-white">
                          {r.user.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-medium">{r.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold tabular-nums">
                    {r.horasTrabajadas > 0 ? r.horasTrabajadas.toFixed(1) + 'h' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide', ASISTENCIA_ESTADO_COLORS[r.estado])}>
                      {ASISTENCIA_ESTADO_LABELS[r.estado] || r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
