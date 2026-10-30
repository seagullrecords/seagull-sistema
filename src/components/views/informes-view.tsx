'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FileBarChart, Download, Send, RefreshCw, Mail, MessageSquare, Calendar } from 'lucide-react'

interface Informe {
  id: string
  mes: number
  anio: number
  estado: string
  pdfUrl?: string | null
  enviadoA?: string | null
  fechaEnvio?: string | null
  datos: any
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function InformesView() {
  const [informes, setInformes] = useState<Informe[]>([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1)
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear())

  const load = () => {
    fetch('/api/informes')
      .then((r) => r.json())
      .then((d) => setInformes(d.informes || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const generarInforme = async () => {
    setGenerando(true)
    try {
      const res = await fetch('/api/informes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes: selectedMes, anio: selectedAnio }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        alert(`✓ Informe de ${MESES[selectedMes - 1]} ${selectedAnio} generado`)
        load()
      }
    } catch {
      alert('Error generando informe')
    } finally {
      setGenerando(false)
    }
  }

  const enviarInforme = async (informe: Informe, metodo: 'email' | 'telegram') => {
    try {
      if (metodo === 'telegram') {
        const res = await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'informe_diario' }),
        })
        const data = await res.json()
        alert(data.message || data.error)
      } else {
        const res = await fetch('/api/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'enviar_email',
            to: 'seagull.records.99@gmail.com',
            subject: `Informe mensual SEAGULL RECORDS - ${MESES[informe.mes - 1]} ${informe.anio}`,
            body: `Informe del mes de ${MESES[informe.mes - 1]} ${informe.anio}.\n\nIngresos: ${formatCurrency(informe.datos.resumen.totalIngresos)}\nEgresos: ${formatCurrency(informe.datos.resumen.totalEgresos)}\nUtilidad: ${formatCurrency(informe.datos.resumen.utilidadNeta)}\n\nGenerado por SEAGULL Studio OS`,
          }),
        })
        const data = await res.json()
        alert(data.message || data.error)
      }
    } catch {
      alert('Error al enviar')
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Informes Mensuales</h2>
          <p className="text-sm text-muted-foreground">
            {informes.length} informes generados · Genera reportes automáticos con todas las métricas del mes
          </p>
        </div>
      </div>

      {/* Generador */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Generar nuevo informe
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mes</label>
            <select value={selectedMes} onChange={(e) => setSelectedMes(Number(e.target.value))} className="mt-1 h-9 rounded-md border border-border/40 bg-input/60 px-3 text-sm focus:border-primary/60 focus:outline-none">
              {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Año</label>
            <input type="number" value={selectedAnio} onChange={(e) => setSelectedAnio(Number(e.target.value))} className="mt-1 h-9 rounded-md border border-border/40 bg-input/60 px-3 text-sm focus:border-primary/60 focus:outline-none w-24" />
          </div>
          <button
            onClick={generarInforme}
            disabled={generando}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors h-9"
          >
            {generando ? <RefreshCw className="h-3 w-3 animate-spin" /> : <FileBarChart className="h-3 w-3" />}
            {generando ? 'Generando...' : 'Generar informe'}
          </button>
        </div>
      </div>

      {/* Lista de informes */}
      <div className="space-y-3">
        {informes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 bg-card/40 p-12 text-center">
            <FileBarChart className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground mb-2">No hay informes generados todavía</p>
            <p className="text-xs text-muted-foreground/70">Selecciona mes y año arriba y haz clic en "Generar informe"</p>
          </div>
        ) : (
          informes.map((informe) => (
            <div key={informe.id} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 p-5 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">
                      SEAGULL RECORDS S.A.C.
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Informe {MESES[informe.mes - 1]} {informe.anio}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      Generado el {formatDate(informe.datos?.periodo ? new Date(informe.anio, informe.mes - 1, 1) : new Date())}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn('inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide',
                      informe.estado === 'GENERADO' ? 'bg-muted text-muted-foreground' :
                      informe.estado === 'ENVIADO_EMAIL' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-chart-2/20 text-chart-2')}>
                      {informe.estado === 'GENERADO' ? 'Generado' : informe.estado === 'ENVIADO_EMAIL' ? 'Enviado por email' : informe.estado}
                    </span>
                    <div className="text-xl font-bold tabular-nums mt-2 text-primary">
                      {informe.datos ? formatCurrency(informe.datos.resumen.utilidadNeta) : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Utilidad neta</div>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              {informe.datos && (
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ingresos</div>
                      <div className="text-base font-bold tabular-nums text-green-500">{formatCurrency(informe.datos.resumen.totalIngresos)}</div>
                    </div>
                    <div className="rounded-lg border border-chart-2/30 bg-chart-2/5 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Egresos</div>
                      <div className="text-base font-bold tabular-nums text-chart-2">{formatCurrency(informe.datos.resumen.totalEgresos)}</div>
                    </div>
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Utilidad</div>
                      <div className="text-base font-bold tabular-nums text-primary">{formatCurrency(informe.datos.resumen.utilidadNeta)}</div>
                    </div>
                    <div className="rounded-lg border border-chart-5/30 bg-chart-5/5 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Margen</div>
                      <div className="text-base font-bold tabular-nums text-chart-5">{informe.datos.resumen.margenUtilidad.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Proyectos</div>
                      <div className="font-medium">{informe.datos.proyectos.activos} activos · {informe.datos.proyectos.entregados} entregados · {informe.datos.proyectos.total} total</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tareas</div>
                      <div className="font-medium">{informe.datos.tareas.completadas} completadas · {informe.datos.tareas.pendientes} pendientes</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Contactos</div>
                      <div className="font-medium">{informe.datos.contactos.activos} activos · {informe.datos.contactos.total} total</div>
                    </div>
                  </div>

                  {/* Top ingresos */}
                  {informe.datos.topIngresos && informe.datos.topIngresos.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Top 5 ingresos del mes</div>
                      <div className="space-y-1">
                        {informe.datos.topIngresos.slice(0, 5).map((ing: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs py-1 border-b border-border/30">
                            <span className="truncate flex-1">{ing.concepto}{ing.contacto && ` · ${ing.contacto}`}</span>
                            <span className="font-semibold tabular-nums text-green-500 ml-3">{formatCurrency(ing.monto)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40">
                    <button
                      onClick={() => generarPDF(informe)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={() => enviarInforme(informe, 'email')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-500 hover:bg-blue-500/20 transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      Enviar por email
                    </button>
                    <button
                      onClick={() => enviarInforme(informe, 'telegram')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-chart-2/30 bg-chart-2/10 px-3 py-1.5 text-xs text-chart-2 hover:bg-chart-2/20 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Enviar por Telegram
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Generar PDF imprimiendo el contenido del informe en nueva ventana
function generarPDF(informe: Informe) {
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Informe SEAGULL RECORDS - ${MESES[informe.mes - 1]} ${informe.anio}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; color: #1a1a1a; padding: 40px; background: white; }
  .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #FFA500; }
  .empresa { font-size: 24px; font-weight: bold; color: #FFA500; }
  .ruc { font-size: 12px; color: #666; margin-top: 4px; }
  .titulo { font-size: 20px; margin-top: 10px; }
  .periodo { font-size: 14px; color: #666; }
  .section { margin: 30px 0; }
  .section-title { font-size: 16px; font-weight: bold; padding-bottom: 8px; border-bottom: 1px solid #ddd; margin-bottom: 15px; }
  .metricas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
  .metrica { padding: 15px; border: 1px solid #ddd; border-radius: 6px; text-align: center; }
  .metrica-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .metrica-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
  .ingresos { color: #16a34a; }
  .egresos { color: #FFFFFF; }
  .utilidad { color: #FFA500; }
  .margen { color: #f59e0b; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th { text-align: left; padding: 8px; background: #f5f5f5; font-size: 11px; text-transform: uppercase; }
  td { padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; }
  .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="empresa">SEAGULL RECORDS S.A.C.</div>
    <div class="ruc">RUC 20612281352 · Jr. Ferrocarril 151, Chimbote, Áncash, Perú</div>
    <div class="titulo">Informe Mensual</div>
    <div class="periodo">${MESES[informe.mes - 1]} ${informe.anio}</div>
  </div>

  <div class="section">
    <div class="section-title">Resumen Financiero</div>
    <div class="metricas">
      <div class="metrica">
        <div class="metrica-label">Ingresos</div>
        <div class="metrica-value ingresos">${formatCurrency(informe.datos.resumen.totalIngresos)}</div>
      </div>
      <div class="metrica">
        <div class="metrica-label">Egresos</div>
        <div class="metrica-value egresos">${formatCurrency(informe.datos.resumen.totalEgresos)}</div>
      </div>
      <div class="metrica">
        <div class="metrica-label">Utilidad</div>
        <div class="metrica-value utilidad">${formatCurrency(informe.datos.resumen.utilidadNeta)}</div>
      </div>
      <div class="metrica">
        <div class="metrica-label">Margen</div>
        <div class="metrica-value margen">${informe.datos.resumen.margenUtilidad.toFixed(1)}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Operaciones</div>
    <table>
      <tr><th>Proyectos activos</th><td>${informe.datos.proyectos.activos}</td></tr>
      <tr><th>Proyectos entregados</th><td>${informe.datos.proyectos.entregados}</td></tr>
      <tr><th>Tareas completadas</th><td>${informe.datos.tareas.completadas}</td></tr>
      <tr><th>Tareas pendientes</th><td>${informe.datos.tareas.pendientes}</td></tr>
      <tr><th>Contactos activos</th><td>${informe.datos.contactos.activos}</td></tr>
    </table>
  </div>

  ${informe.datos.topIngresos && informe.datos.topIngresos.length > 0 ? `
  <div class="section">
    <div class="section-title">Top Ingresos del Mes</div>
    <table>
      <thead>
        <tr><th>#</th><th>Concepto</th><th>Cliente</th><th style="text-align:right">Monto</th></tr>
      </thead>
      <tbody>
        ${informe.datos.topIngresos.map((ing: any, i: number) => `
          <tr><td>${i + 1}</td><td>${ing.concepto}</td><td>${ing.contacto || '—'}</td><td style="text-align:right">${formatCurrency(ing.monto)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${informe.datos.egresosPorCategoria ? `
  <div class="section">
    <div class="section-title">Egresos por Categoría</div>
    <table>
      <thead>
        <tr><th>Categoría</th><th style="text-align:right">Monto</th></tr>
      </thead>
      <tbody>
        ${Object.entries(informe.datos.egresosPorCategoria).map(([cat, monto]: [string, any]) => `
          <tr><td>${cat}</td><td style="text-align:right">${formatCurrency(monto)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="footer">
    Informe generado por SEAGULL Studio OS · ${new Date().toLocaleString('es-PE')}
  </div>

  <script>window.print();</script>
</body>
</html>
  `
  win.document.write(html)
  win.document.close()
}
