'use client'

import { useEffect, useState } from 'react'
import { Modal, Field, inputClass, selectClass, textareaClass, Button } from './modal-base'
import { TIPO_CONTACTO_LABELS } from '@/lib/format'
import { Loader2, Save, Trash2, Upload, Camera } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ContactoData {
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
  observaciones?: string | null
}

export function ModalEditarContacto({ onClose }: { onClose: () => void }) {
  const { editingContactoId, setView } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<ContactoData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Cargar datos del contacto al abrir el modal
  useEffect(() => {
    if (!editingContactoId) return
    fetch(`/api/contactos/${editingContactoId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.contacto) {
          setForm(d.contacto)
        } else {
          alert('Contacto no encontrado')
          onClose()
        }
      })
      .finally(() => setLoading(false))
  }, [editingContactoId, onClose])

  const submit = async () => {
    if (!form || !form.nombre) return alert('Nombre es obligatorio')
    setSaving(true)
    try {
      const res = await fetch(`/api/contactos/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.contacto) {
        alert(`✓ Contacto ${data.contacto.codigo} actualizado correctamente`)
        onClose()
        // Recargar vista
        window.location.reload()
      } else {
        alert('Error: ' + (data.error || 'desconocido'))
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async () => {
    if (!form) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/contactos/${form.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        alert(`✓ Contacto ${form.codigo} eliminado`)
        onClose()
        setView('contactos')
        window.location.reload()
      } else {
        alert('Error: ' + (data.error || 'desconocido'))
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading || !form) {
    return (
      <Modal title="Editar contacto" onClose={onClose}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando contacto...</span>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title="Editar contacto"
      subtitle={`${form.codigo} · Modifica la información del contacto`}
      onClose={onClose}
      size="md"
    >
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 to-chart-2 text-sm font-bold text-white shrink-0">
            {form.nombre.charAt(0)}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{form.codigo}</div>
            <div className="text-sm font-medium">{form.nombre}</div>
          </div>
        </div>

        <Field label="Nombre *">
          <input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Karla Castañeda" />
        </Field>

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
              <option value="INACTIVO">Inactivo</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="DNI / RUC">
            <input className={inputClass} value={form.dniRuc || ''} onChange={(e) => setForm({ ...form, dniRuc: e.target.value })} placeholder="12345678" />
          </Field>
          <Field label="Origen">
            <select className={selectClass} value={form.origen || 'Web'} onChange={(e) => setForm({ ...form, origen: e.target.value })}>
              <option value="Web">Web</option>
              <option value="Referido">Referido</option>
              <option value="Migración">Migración</option>
              <option value="Redes">Redes</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <input className={inputClass} type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" />
          </Field>
          <Field label="Email alterno (opcional)">
            <input className={inputClass} type="email" value={form.emailAlterno || ''} onChange={(e) => setForm({ ...form, emailAlterno: e.target.value })} placeholder="alternativo@email.com" />
          </Field>
        </div>

        <Field label="Teléfono">
          <input className={inputClass} value={form.telefono || ''} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="910 216 278" />
        </Field>

        {/* Foto del contacto */}
        <Field label="Foto del contacto">
          <div className="flex items-center gap-3 mt-1">
            {form.avatar && form.avatar.trim() !== '' ? (
              <img src={form.avatar} alt="Foto" className="h-16 w-16 rounded-full object-cover ring-2 ring-border/50" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-xl font-bold text-white">
                {form.nombre.charAt(0)}
              </div>
            )}
            <label className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs font-medium hover:bg-muted/60 transition-colors cursor-pointer">
              <Camera className="h-3 w-3" />
              {form.avatar && form.avatar.trim() !== '' ? 'Cambiar foto' : 'Subir foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const formData = new FormData()
                  formData.append('file', file)
                  formData.append('tipo', 'contacto')
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  const data = await res.json()
                  if (data.ok) {
                    setForm({ ...form, avatar: data.url })
                  } else {
                    alert('Error: ' + (data.error || 'no se pudo subir'))
                  }
                }}
              />
            </label>
          </div>
        </Field>

        <Field label="Estado contractual (opcional)">
          <input className={inputClass} value={form.estadoContractual || ''} onChange={(e) => setForm({ ...form, estadoContractual: e.target.value })} placeholder="Ej: Contrato firmado 2026" />
        </Field>

        <Field label="Observaciones">
          <textarea className={textareaClass} rows={2} value={form.observaciones || ''} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} placeholder="Notas internas sobre el contacto" />
        </Field>
      </div>

      <div className="flex justify-between gap-2 p-4 border-t border-border/40">
        <button
          onClick={eliminar}
          disabled={deleting}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
            confirmDelete
              ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-500/10'
          )}
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          {confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar contacto'}
        </button>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Guardar cambios
          </Button>
        </div>
      </div>
    </Modal>
  )
}
