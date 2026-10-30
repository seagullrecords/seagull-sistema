'use client'

import { useEffect, useState } from 'react'
import { Modal, Field, inputClass, selectClass, Button } from './modal-base'
import { ROLE_LABELS } from '@/lib/format'
import { Loader2, Save, Camera } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

export function ModalEditarUsuario({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { setView } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UserData | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    fetch('/api/equipo')
      .then((r) => r.json())
      .then((d) => {
        const user = d.users?.find((u: any) => u.id === userId)
        if (user) {
          setForm({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar || null,
          })
        } else {
          alert('Usuario no encontrado')
          onClose()
        }
      })
      .finally(() => setLoading(false))
  }, [userId, onClose])

  const submit = async () => {
    if (!form || !form.name) return alert('Nombre es obligatorio')
    setSaving(true)
    try {
      const res = await fetch(`/api/equipo/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.user) {
        alert(`✓ Usuario ${data.user.name} actualizado correctamente`)
        onClose()
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

  if (loading || !form) {
    return (
      <Modal title="Editar miembro del equipo" onClose={onClose}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Editar miembro del equipo" subtitle={`${form.name} · Modifica la información`} onClose={onClose} size="md">
      <div className="p-5 space-y-3">
        {/* Foto */}
        <Field label="Foto del miembro">
          <div className="flex items-center gap-3 mt-1">
            {form.avatar && form.avatar.trim() !== '' ? (
              <img src={form.avatar} alt="Foto" className="h-16 w-16 rounded-full object-cover ring-2 ring-border/50" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center text-xl font-bold text-white">
                {form.name.charAt(0)}
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
                  formData.append('tipo', 'user')
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

        <Field label="Nombre completo *">
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Martha García Pacheco" />
        </Field>

        <Field label="Email">
          <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@seagullrecords.pe" />
        </Field>

        <Field label="Rol">
          <select className={selectClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-border/40">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar cambios
        </Button>
      </div>
    </Modal>
  )
}
