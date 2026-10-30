'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { ROLE_LABELS } from '@/lib/format'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Mail, Calendar, Shield, Briefcase, CheckSquare, CheckCircle2, Edit } from 'lucide-react'

interface UserItem {
  id: string
  email: string
  name: string
  avatar?: string | null
  role: string
  createdAt: string
  contacto?: { id: string; nombre: string; codigo: string } | null
  tareasPendientes: number
  tareasCompletadas: number
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-primary/20 text-primary',
  PRODUCTOR: 'bg-chart-3/20 text-chart-3',
  'A&R': 'bg-chart-2/20 text-chart-2',
  CONTABILIDAD: 'bg-chart-5/20 text-chart-5',
  CLIENTE: 'bg-chart-1/20 text-chart-1',
}

const roleIcons: Record<string, any> = {
  ADMIN: Shield,
  PRODUCTOR: Briefcase,
  'A&R': Briefcase,
  CONTABILIDAD: Calendar,
  CLIENTE: Mail,
}

export function EquipoView() {
  const { openEditUsuario } = useAppStore()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/equipo')
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const byRole = users.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = []
    acc[u.role].push(u)
    return acc
  }, {} as Record<string, UserItem[]>)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Equipo SEAGULL</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} miembros · {Object.keys(byRole).length} roles
        </p>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(byRole).map(([role, roleUsers]) => {
          const Icon = roleIcons[role] || Shield
          return (
            <div key={role} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', roleColors[role])}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tabular-nums">{roleUsers.length}</div>
              <div className="text-[11px] text-muted-foreground">{ROLE_LABELS[role]}</div>
            </div>
          )
        })}
      </div>

      {/* Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {users.map((u) => {
          const Icon = roleIcons[u.role] || Shield
          return (
            <div key={u.id} className="relative rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 transition-colors hover:bg-card/60">
              <div className="flex items-start gap-3">
                {u.avatar && u.avatar.trim() !== "" ? (
                  <img src={u.avatar} alt={u.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-border/50 shrink-0" />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {u.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{u.name}</div>
                    <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide', roleColors[u.role])}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {u.email}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1">
                    Miembro desde {formatDate(u.createdAt)}
                  </div>
                  {u.role === 'PRODUCTOR' || u.role === 'A&R' ? (
                    <div className="flex gap-3 mt-3 pt-3 border-t border-border/30 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckSquare className="h-3 w-3 text-chart-5" />
                        <span className="tabular-nums font-semibold">{u.tareasPendientes}</span>
                        <span className="text-muted-foreground text-[10px]">pend</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="tabular-nums font-semibold">{u.tareasCompletadas}</span>
                        <span className="text-muted-foreground text-[10px]">ok</span>
                      </div>
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => openEditUsuario(u.id)}
                  className="absolute right-3 top-3 p-1.5 rounded-md bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  title="Editar miembro"
                >
                  <Edit className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
