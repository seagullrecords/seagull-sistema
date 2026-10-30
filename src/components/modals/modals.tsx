'use client'

import { useState } from 'react'
import { Modal, Field, inputClass, selectClass, textareaClass, Button } from './modal-base'
import { TIPO_CONTACTO_LABELS } from '@/lib/format'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'

// ============ MODAL CONTACTO ============
export function ModalContacto({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', dniRuc: '', email: '', telefono: '', tipo: 'SOLISTA', origen: 'Web', estado: 'PROSPECTO', observaciones: '',
  })

  const submit = async () => {
    if (!form.nombre) return alert('Nombre es obligatorio')
    setLoading(true)
    try {
      const res = await fetch('/api/contactos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.contacto) { alert(`✓ Contacto creado: ${data.contacto.codigo}`); onClose() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nuevo contacto" subtitle="Agrega un cliente, manager o banda al CRM" onClose={onClose}>
      <div className="p-5 space-y-3">
        <Field label="Nombre *"><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Karla Castañeda" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <select className={selectClass} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {Object.entries(TIPO_CONTACTO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className={selectClass} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              <option value="PROSPECTO">Prospecto</option>
              <option value="COTIZACION_ENVIADA">Cotización enviada</option>
              <option value="CLIENTE_ACTIVO">Cliente activo</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="DNI / RUC"><input className={inputClass} value={form.dniRuc} onChange={(e) => setForm({ ...form, dniRuc: e.target.value })} placeholder="12345678" /></Field>
          <Field label="Origen">
            <select className={selectClass} value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })}>
              <option value="Web">Web</option><option value="Referido">Referido</option><option value="Migración">Migración</option><option value="Redes">Redes</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" /></Field>
          <Field label="Teléfono"><input className={inputClass} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="910 216 278" /></Field>
        </div>
        <Field label="Observaciones"><textarea className={textareaClass} rows={2} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></Field>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar contacto
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL COTIZACIÓN ============
export function ModalCotizacion({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [contactos, setContactos] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [contactoId, setContactoId] = useState('')
  const [nombreCliente, setNombreCliente] = useState('')
  const [items, setItems] = useState<any[]>([{ descripcion: '', cantidad: 1, unidad: 'Canción', precioUnitario: 0, descuento: 0 }])
  const [observaciones, setObservaciones] = useState('')

  useEffectLoad(() => {
    Promise.all([
      fetch('/api/contactos').then(r => r.json()),
      fetch('/api/servicios').then(r => r.json()),
    ]).then(([c, s]) => {
      setContactos(c.contactos || [])
      setServicios(s.servicios || [])
    })
  })

  const subtotal = items.reduce((s, it) => s + (it.cantidad * it.precioUnitario - (it.descuento || 0)), 0)
  const igv = subtotal * 0.18
  const total = subtotal + igv

  const selectServicio = (idx: number, servicioId: string) => {
    const serv = servicios.find(s => s.id === servicioId)
    if (!serv) return
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], servicioId, descripcion: serv.nombre, unidad: serv.unidad, precioUnitario: serv.precioBase }
    setItems(newItems)
  }

  const submit = async () => {
    if (!contactoId) return alert('Selecciona un contacto')
    if (items.length === 0) return alert('Agrega al menos un item')
    setLoading(true)
    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactoId, nombreCliente, items, observaciones }),
      })
      const data = await res.json()
      if (data.cotizacion) { alert(`✓ Cotización creada: ${data.cotizacion.codigo}`); onClose() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nueva cotización" subtitle="Genera una cotización profesional para un cliente" onClose={onClose} size="xl">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contacto *">
            <select className={selectClass} value={contactoId} onChange={(e) => {
              setContactoId(e.target.value)
              const c = contactos.find(x => x.id === e.target.value)
              if (c) setNombreCliente(c.nombre)
            }}>
              <option value="">Selecciona un contacto...</option>
              {contactos.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
            </select>
          </Field>
          <Field label="Nombre del cliente"><input className={inputClass} value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} /></Field>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Items</label>
            <button onClick={() => setItems([...items, { descripcion: '', cantidad: 1, unidad: 'Canción', precioUnitario: 0, descuento: 0 }])}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              <Plus className="h-3 w-3" /> Agregar item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-2 rounded-md border border-border/40 bg-card/40">
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Servicio</label>
                  <select className="h-9 w-full rounded-md border border-border/40 bg-input/60 px-2 text-xs" value={it.servicioId || ''} onChange={(e) => selectServicio(i, e.target.value)}>
                    <option value="">Personalizado</option>
                    {servicios.map(s => <option key={s.id} value={s.id}>{s.codigo} · {s.nombre} (S/.{s.precioBase})</option>)}
                  </select>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Descripción</label>
                  <input className="h-9 w-full rounded-md border border-border/40 bg-input/60 px-2 text-xs" value={it.descripcion} onChange={(e) => { const ni = [...items]; ni[i].descripcion = e.target.value; setItems(ni) }} />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Cant</label>
                  <input type="number" className="h-9 w-full rounded-md border border-border/40 bg-input/60 px-2 text-xs" value={it.cantidad} onChange={(e) => { const ni = [...items]; ni[i].cantidad = Number(e.target.value); setItems(ni) }} />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">P. Unit</label>
                  <input type="number" className="h-9 w-full rounded-md border border-border/40 bg-input/60 px-2 text-xs" value={it.precioUnitario} onChange={(e) => { const ni = [...items]; ni[i].precioUnitario = Number(e.target.value); setItems(ni) }} />
                </div>
                <div className="col-span-4 sm:col-span-1">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Subt</label>
                  <div className="h-9 flex items-center justify-end px-2 text-xs font-semibold tabular-nums">
                    S/.{(it.cantidad * it.precioUnitario - (it.descuento || 0)).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1">
                  <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums font-medium">S/.{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IGV (18%)</span><span className="tabular-nums font-medium">S/.{igv.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-border pt-1.5"><span className="font-bold">Total</span><span className="tabular-nums font-bold text-primary">S/.{total.toFixed(2)}</span></div>
          </div>
        </div>

        <Field label="Observaciones"><textarea className={textareaClass} rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Vigencia 15 días · Anticipo 50%..." /></Field>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar cotización
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL PROYECTO ============
export function ModalProyecto({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [contactos, setContactos] = useState<any[]>([])
  const [form, setForm] = useState({
    contactoId: '', nombreArtista: '', nombreProyecto: '', tipoProyecto: 'PRODUCCION_MUSICAL',
    responsable: 'Caleb', numCanciones: 1, fechaInicio: '', fechaEntregaEstimada: '',
    urlCarpetaDrive: '', observaciones: '',
  })

  useEffectLoad(() => {
    fetch('/api/contactos').then(r => r.json()).then(d => setContactos(d.contactos || []))
  })

  const submit = async () => {
    if (!form.contactoId || !form.nombreProyecto) return alert('Contacto y nombre del proyecto son obligatorios')
    setLoading(true)
    try {
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.proyecto) { alert(`✓ Proyecto creado: ${data.proyecto.codigo}\n${data.tareasGeneradas} tareas auto-generadas`); onClose() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nuevo proyecto" subtitle="Crea un proyecto y se generan tareas automáticamente" onClose={onClose} size="lg">
      <div className="p-5 space-y-3">
        <Field label="Contacto *">
          <select className={selectClass} value={form.contactoId} onChange={(e) => {
            const c = contactos.find(x => x.id === e.target.value)
            setForm({ ...form, contactoId: e.target.value, nombreArtista: c?.nombre || '' })
          }}>
            <option value="">Selecciona contacto...</option>
            {contactos.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre del artista"><input className={inputClass} value={form.nombreArtista} onChange={(e) => setForm({ ...form, nombreArtista: e.target.value })} /></Field>
          <Field label="Nombre del proyecto *"><input className={inputClass} value={form.nombreProyecto} onChange={(e) => setForm({ ...form, nombreProyecto: e.target.value })} placeholder="Producción EP (3 canciones)" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo de proyecto">
            <select className={selectClass} value={form.tipoProyecto} onChange={(e) => setForm({ ...form, tipoProyecto: e.target.value })}>
              <option value="PRODUCCION_MUSICAL">Producción Musical</option>
              <option value="MEZCLA">Mezcla</option>
              <option value="MASTERIZACION">Masterización</option>
              <option value="PRODUCCION_COMPLETA">Producción Completa</option>
            </select>
          </Field>
          <Field label="Responsable">
            <select className={selectClass} value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })}>
              <option>Martha</option><option>Aarón</option><option>Caleb</option><option>Oseías</option>
            </select>
          </Field>
        </div>
        <Field label="Número de canciones" hint="Se generan 9 tareas por canción (Preprod → Grab → Edit → Mezcla → Master → Revisión → Entrega)">
          <input type="number" min={1} max={20} className={inputClass} value={form.numCanciones} onChange={(e) => setForm({ ...form, numCanciones: Number(e.target.value) })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de inicio"><input type="date" className={inputClass} value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} /></Field>
          <Field label="Fecha estimada de entrega"><input type="date" className={inputClass} value={form.fechaEntregaEstimada} onChange={(e) => setForm({ ...form, fechaEntregaEstimada: e.target.value })} /></Field>
        </div>
        <Field label="URL carpeta Drive (opcional)"><input className={inputClass} value={form.urlCarpetaDrive} onChange={(e) => setForm({ ...form, urlCarpetaDrive: e.target.value })} placeholder="https://drive.google.com/drive/folders/..." /></Field>
        <Field label="Observaciones"><textarea className={textareaClass} rows={2} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></Field>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Crear proyecto + tareas
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL SERVICIO ============
export function ModalServicio({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', unidad: 'Canción', precioBase: 0, tiempoEstimado: '' })

  const submit = async () => {
    if (!form.nombre || !form.precioBase) return alert('Nombre y precio son obligatorios')
    setLoading(true)
    try {
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.servicio) { alert(`✓ Servicio creado: ${data.servicio.codigo}`); onClose() }
      else alert('Error')
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nuevo servicio" subtitle="Agrega un servicio al catálogo del estudio" onClose={onClose}>
      <div className="p-5 space-y-3">
        <Field label="Nombre *"><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Mezcla" /></Field>
        <Field label="Descripción"><textarea className={textareaClass} rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unidad">
            <select className={selectClass} value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
              <option>Canción</option><option>Hora</option><option>Sesión</option><option>Proyecto</option>
            </select>
          </Field>
          <Field label="Precio base (S/.) *"><input type="number" className={inputClass} value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Tiempo estimado"><input className={inputClass} value={form.tiempoEstimado} onChange={(e) => setForm({ ...form, tiempoEstimado: e.target.value })} placeholder="3 días, 1 hora..." /></Field>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar servicio
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL TAREA ============
export function ModalTarea({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [proyectos, setProyectos] = useState<any[]>([])
  const [form, setForm] = useState({ proyectoId: '', nombre: '', etapa: 'Preproducción', responsable: 'Caleb', fechaLimite: '', prioridad: 'ALTA' })

  useEffectLoad(() => {
    fetch('/api/proyectos').then(r => r.json()).then(d => setProyectos(d.proyectos || []))
  })

  const submit = async () => {
    if (!form.proyectoId || !form.nombre) return alert('Proyecto y nombre son obligatorios')
    setLoading(true)
    try {
      const res = await fetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.tarea) { alert(`✓ Tarea creada: ${data.tarea.codigo}`); onClose() }
      else alert('Error')
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nueva tarea" subtitle="Asigna una tarea a un proyecto" onClose={onClose}>
      <div className="p-5 space-y-3">
        <Field label="Proyecto *">
          <select className={selectClass} value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
            <option value="">Selecciona proyecto...</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.codigo} · {p.nombreProyecto}</option>)}
          </select>
        </Field>
        <Field label="Nombre de la tarea *"><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Mezcla - Canción 1" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Etapa">
            <select className={selectClass} value={form.etapa} onChange={(e) => setForm({ ...form, etapa: e.target.value })}>
              {['Preproducción', 'Grabación', 'Edición', 'Mezcla', 'Masterización', 'Revisión', 'Entrega'].map(e => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="Responsable">
            <select className={selectClass} value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })}>
              <option>Martha</option><option>Aarón</option><option>Caleb</option><option>Oseías</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha límite"><input type="date" className={inputClass} value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} /></Field>
          <Field label="Prioridad">
            <select className={selectClass} value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
              <option>URGENTE</option><option>ALTA</option><option>MEDIA</option><option>BAJA</option>
            </select>
          </Field>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar tarea
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL CONTRATO ============
export function ModalContrato({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [contactos, setContactos] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const [form, setForm] = useState({ contactoId: '', proyectoId: '', nombreArtista: '', nombreProyecto: '', tipoContrato: 'Sencillo', montoTotal: 0, anticipo: 0, fechaFirma: '' })

  useEffectLoad(() => {
    Promise.all([
      fetch('/api/contactos').then(r => r.json()),
      fetch('/api/proyectos').then(r => r.json()),
    ]).then(([c, p]) => { setContactos(c.contactos || []); setProyectos(p.proyectos || []) })
  })

  const saldoPendiente = form.montoTotal - form.anticipo

  const submit = async () => {
    if (!form.contactoId || !form.nombreProyecto) return alert('Contacto y nombre del proyecto son obligatorios')
    setLoading(true)
    try {
      const res = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.contrato) { alert(`✓ Contrato creado: ${data.contrato.codigo}`); onClose() }
      else alert('Error')
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nuevo contrato" subtitle="Registra un contrato con un cliente" onClose={onClose}>
      <div className="p-5 space-y-3">
        <Field label="Contacto *">
          <select className={selectClass} value={form.contactoId} onChange={(e) => {
            const c = contactos.find(x => x.id === e.target.value)
            setForm({ ...form, contactoId: e.target.value, nombreArtista: c?.nombre || '' })
          }}>
            <option value="">Selecciona contacto...</option>
            {contactos.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre del artista"><input className={inputClass} value={form.nombreArtista} onChange={(e) => setForm({ ...form, nombreArtista: e.target.value })} /></Field>
          <Field label="Nombre del proyecto *"><input className={inputClass} value={form.nombreProyecto} onChange={(e) => setForm({ ...form, nombreProyecto: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Proyecto vinculado (opcional)">
            <select className={selectClass} value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">Sin proyecto</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.codigo} · {p.nombreProyecto}</option>)}
            </select>
          </Field>
          <Field label="Tipo de contrato">
            <select className={selectClass} value={form.tipoContrato} onChange={(e) => setForm({ ...form, tipoContrato: e.target.value })}>
              <option>Sencillo</option><option>EP</option><option>Álbum</option><option>Producción Completa</option><option>Mezcla y Masterización</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Monto total (S/.)"><input type="number" className={inputClass} value={form.montoTotal} onChange={(e) => setForm({ ...form, montoTotal: Number(e.target.value) })} /></Field>
          <Field label="Anticipo (S/.)"><input type="number" className={inputClass} value={form.anticipo} onChange={(e) => setForm({ ...form, anticipo: Number(e.target.value) })} /></Field>
          <Field label="Saldo pendiente"><div className="h-9 flex items-center px-2 text-sm font-bold tabular-nums text-chart-2">S/.{saldoPendiente.toFixed(2)}</div></Field>
        </div>
        <Field label="Fecha de firma"><input type="date" className={inputClass} value={form.fechaFirma} onChange={(e) => setForm({ ...form, fechaFirma: e.target.value })} /></Field>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar contrato
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL TRANSACCIÓN (INGRESO / EGRESO) ============
export function ModalTransaccion({ tipo, onClose }: { tipo: 'INGRESO' | 'EGRESO'; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [contactos, setContactos] = useState<any[]>([])
  const [proyectos, setProyectos] = useState<any[]>([])
  const isEgreso = tipo === 'EGRESO'
  const [form, setForm] = useState({
    tipo, concepto: '', monto: 0, fecha: '', metodo: 'EFECTIVO', comprobante: 'BOLETA',
    contactoId: '', proyectoId: '', categoria: 'OTROS', proveedor: '',
  })

  useEffectLoad(() => {
    Promise.all([
      fetch('/api/contactos').then(r => r.json()),
      fetch('/api/proyectos').then(r => r.json()),
    ]).then(([c, p]) => { setContactos(c.contactos || []); setProyectos(p.proyectos || []) })
  })

  const submit = async () => {
    if (!form.concepto || !form.monto) return alert('Concepto y monto son obligatorios')
    setLoading(true)
    try {
      const res = await fetch('/api/finanzas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ingreso || data.egreso) { alert(`✓ ${tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado`); onClose() }
      else alert('Error')
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title={isEgreso ? 'Nuevo egreso' : 'Nuevo ingreso'} subtitle={isEgreso ? 'Registra un gasto del estudio' : 'Registra un pago recibido'} onClose={onClose}>
      <div className="p-5 space-y-3">
        <Field label="Concepto *"><input className={inputClass} value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder={isEgreso ? 'Ej: Alquiler local octubre' : 'Ej: Anticipo PRY-2026-001'} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monto (S/.) *"><input type="number" className={inputClass} value={form.monto} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} /></Field>
          <Field label="Fecha"><input type="date" className={inputClass} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Método de pago">
            <select className={selectClass} value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value })}>
              <option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="YAPE">Yape</option><option value="PLIN">Plin</option><option value="TARJETA">Tarjeta</option>
            </select>
          </Field>
          <Field label="Comprobante">
            <select className={selectClass} value={form.comprobante} onChange={(e) => setForm({ ...form, comprobante: e.target.value })}>
              <option>BOLETA</option><option>FACTURA</option><option>RECIBO</option>
            </select>
          </Field>
        </div>
        {isEgreso ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <select className={selectClass} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {['SERVICIOS', 'EQUIPO', 'SOFTWARE', 'PERSONAL', 'MARKETING', 'ADMIN', 'RENTA', 'OTROS'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Proveedor"><input className={inputClass} value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} /></Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contacto (opcional)">
              <select className={selectClass} value={form.contactoId} onChange={(e) => setForm({ ...form, contactoId: e.target.value })}>
                <option value="">Sin contacto</option>
                {contactos.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Proyecto (opcional)">
              <select className={selectClass} value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
                <option value="">Sin proyecto</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.codigo} · {p.nombreProyecto}</option>)}
              </select>
            </Field>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar {isEgreso ? 'egreso' : 'ingreso'}
        </Button>
      </div>
    </Modal>
  )
}

// ============ MODAL INVENTARIO ============
export function ModalInventario({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', categoria: 'MICROFONO', marca: '', modelo: '', numeroSerie: '', estado: 'DISPONIBLE', ubicacion: '', valorCompra: '', fechaAdquisicion: '', notas: '' })

  const submit = async () => {
    if (!form.nombre) return alert('Nombre es obligatorio')
    setLoading(true)
    try {
      const res = await fetch('/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          valorCompra: form.valorCompra ? Number(form.valorCompra) : null,
          fechaAdquisicion: form.fechaAdquisicion || null,
        }),
      })
      const data = await res.json()
      if (data.item) { alert(`✓ Equipo creado: ${data.item.codigo}`); onClose() }
      else alert('Error')
    } catch { alert('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Nuevo equipo" subtitle="Agrega un item al inventario del estudio" onClose={onClose}>
      <div className="p-5 space-y-3">
        <Field label="Nombre *"><input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Shure SM7B" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría">
            <select className={selectClass} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {['MICROFONO', 'CABLE', 'INTERFACE', 'INSTRUMENTO', 'MONITOR', 'ACCESORIO', 'OTRO'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select className={selectClass} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              {['DISPONIBLE', 'EN_USO', 'PRESTADO', 'EN_REPARACION', 'BAJA'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca"><input className={inputClass} value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Shure" /></Field>
          <Field label="Modelo"><input className={inputClass} value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="SM7B" /></Field>
        </div>
        <Field label="Número de serie"><input className={inputClass} value={form.numeroSerie} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ubicación"><input className={inputClass} value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} placeholder="Estudio A" /></Field>
          <Field label="Valor de compra (S/.)"><input type="number" className={inputClass} value={form.valorCompra} onChange={(e) => setForm({ ...form, valorCompra: e.target.value })} /></Field>
        </div>
        <Field label="Fecha de adquisición"><input type="date" className={inputClass} value={form.fechaAdquisicion} onChange={(e) => setForm({ ...form, fechaAdquisicion: e.target.value })} /></Field>
        <Field label="Notas"><textarea className={textareaClass} rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></Field>
      </div>
      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar equipo
        </Button>
      </div>
    </Modal>
  )
}

// Hook helper para useEffect load
import { useEffect } from 'react'
function useEffectLoad(fn: () => void) {
  useEffect(() => { fn() }, [])
}
