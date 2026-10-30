'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { formatCurrency, formatDate, TIPO_CONTACTO_LABELS, ESTADO_CONTACTO_LABELS, ESTADO_PROYECTO_LABELS, ESTADO_CONTRATO_LABELS, ESTADO_COTIZACION_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, Calendar, FileText, FolderKanban, ScrollText, Wallet, ChevronRight, User, MapPin, Edit, Trash2 } from 'lucide-react'

interface ContactoDetalle {
  id: string
  codigo: string
  nombre: string
  dniRuc?: string | null
  email?: string | null
  emailAlterno?: string | null
  telefono?: string | null
  avatar?: string | null
  tipo: string
  origen?: string | null
  estado: string
  estadoContractual?: string | null
  fechaRegistro: string
  observaciones?: string | null
  cotizaciones: any[]
  proyectos: any[]
  contratos: any[]
  ingresos: any[]
}

const tipoColors: Record<string, string> = {
  SOLISTA: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  BANDA: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  MANAGER: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  PRODUCTOR: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
  SELLO: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
}

export function ContactoDetalleView() {
  const { selectedContactoId, setView, openProyecto, openEditContacto } = useAppStore()
  const [contacto, setContacto] = useState<ContactoDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedContactoId) return
    fetch(`/api/contactos/${selectedContactoId}`)
      .then((r) => r.json())
      .then((d) => setContacto(d.contacto))
      .finally(() => setLoading(false))
  }, [selectedContactoId])

  if (loading) return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!contacto) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Contacto no encontrado</p>
      <button onClick={() => setView('contactos')} className="text-primary hover:underline text-sm">Volver a contactos</button>
    </div>
  )

  const totalIngresos = contacto.ingresos.reduce((s, i) => s + i.monto, 0)
  const totalCotizado = contacto.cotizaciones.reduce((s, c) => s + c.total, 0)

  return (
    <div className="space-y-6">
      <button onClick={() => setView('contactos')} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a contactos
      </button>

      {/* Header */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {contacto.avatar && contacto.avatar.trim() !== '' ? (
              <img src={contacto.avatar} alt={contacto.nombre} className="h-20 w-20 rounded-full object-cover ring-4 ring-card shadow-xl shrink-0" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {contacto.nombre.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold tracking-tight">{contacto.nombre}</h1>
                <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', tipoColors[contacto.tipo] || 'bg-muted text-muted-foreground border-border')}>
                  {TIPO_CONTACTO_LABELS[contacto.tipo] || contacto.tipo}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">{contacto.codigo}</div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="rounded bg-green-500/20 text-green-500 px-1.5 py-0.5 font-semibold uppercase tracking-wide">
                  {ESTADO_CONTACTO_LABELS[contacto.estado] || contacto.estado}
                </span>
                {contacto.dniRuc && <span className="flex items-center gap-1"><User className="h-3 w-3" />DNI/RUC: {contacto.dniRuc}</span>}
                {contacto.origen && <span>Origen: {contacto.origen}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Desde {formatDate(contacto.fechaRegistro)}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => openEditContacto(contacto.id)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Edit className="h-3 w-3" />
                  Editar contacto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-t border-border/40">
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums text-primary">{formatCurrency(totalIngresos)}</div>
            <div className="text-[11px] text-muted-foreground">Total ingresos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums">{contacto.proyectos.length}</div>
            <div className="text-[11px] text-muted-foreground">Proyectos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums">{contacto.cotizaciones.length}</div>
            <div className="text-[11px] text-muted-foreground">Cotizaciones</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold tabular-nums">{contacto.contratos.length}</div>
            <div className="text-[11px] text-muted-foreground">Contratos</div>
          </div>
        </div>
      </div>

      {/* Contacto info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <h3 className="text-sm font-semibold mb-3">Información de contacto</h3>
          <div className="space-y-3 text-xs">
            {contacto.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="font-medium">{contacto.telefono}</span>
              </div>
            )}
            {contacto.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium truncate">{contacto.email}</span>
              </div>
            )}
            {contacto.emailAlterno && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Alt:</span>
                <span className="font-medium truncate">{contacto.emailAlterno}</span>
              </div>
            )}
            {!contacto.telefono && !contacto.email && (
              <p className="text-muted-foreground/60 italic">Sin datos de contacto</p>
            )}
          </div>
          {contacto.observaciones && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Observaciones</div>
              <p className="text-xs">{contacto.observaciones}</p>
            </div>
          )}
        </div>

        {/* Proyectos */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <h3 className="text-sm font-semibold mb-3">Proyectos vinculados</h3>
          <div className="space-y-2">
            {contacto.proyectos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Sin proyectos</p>
            ) : (
              contacto.proyectos.map((p) => (
                <button key={p.id} onClick={() => openProyecto(p.id)} className="block w-full text-left rounded-lg border border-border/40 p-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-primary font-semibold">{p.codigo}</span>
                        <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                          p.estadoGeneral === 'ENTREGADO' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500')}>
                          {ESTADO_PROYECTO_LABELS[p.estadoGeneral] || p.estadoGeneral}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate">{p.nombreProyecto}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {p.responsable && `Resp: ${p.responsable} · `}
                        {p._count?.tareas || 0} tareas
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>

          {contacto.contratos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <h4 className="text-xs font-semibold mb-2">Contratos</h4>
              <div className="space-y-1.5">
                {contacto.contratos.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-md border border-border/30 p-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-primary">{c.codigo}</span>
                      <span className="text-muted-foreground ml-2">{c.tipoContrato}</span>
                    </div>
                    <span className="tabular-nums font-semibold">{formatCurrency(c.montoTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingresos */}
      {contacto.ingresos.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
          <h3 className="text-sm font-semibold mb-3">Historial de pagos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2 text-left font-semibold">Fecha</th>
                  <th className="px-2 py-2 text-left font-semibold">Concepto</th>
                  <th className="px-2 py-2 text-left font-semibold hidden sm:table-cell">Método</th>
                  <th className="px-2 py-2 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {contacto.ingresos.map((i) => (
                  <tr key={i.id} className="border-b border-border/30">
                    <td className="px-2 py-2 text-muted-foreground">{formatDate(i.fecha, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-2 py-2">{i.concepto}</td>
                    <td className="px-2 py-2 hidden sm:table-cell text-muted-foreground">{i.metodo || '—'}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums text-green-500">+{formatCurrency(i.monto)}</td>
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
