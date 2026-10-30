'use client'

import { create } from 'zustand'

export type ViewKey =
  | 'dashboard'
  | 'contactos'
  | 'contacto-detalle'
  | 'cotizaciones'
  | 'proyectos'
  | 'proyecto-detalle'
  | 'tareas'
  | 'servicios'
  | 'contratos'
  | 'finanzas'
  | 'agenda'
  | 'inventario'
  | 'asistencia'
  | 'informes'
  | 'integraciones'
  | 'configuracion'
  | 'equipo'
  | 'ai'

export type UserRole = 'ADMIN' | 'PRODUCTOR' | 'A&R' | 'CONTABILIDAD' | 'CLIENTE'

interface AppState {
  currentView: ViewKey
  selectedContactoId: string | null
  selectedProyectoId: string | null
  setView: (view: ViewKey) => void
  openContacto: (id: string) => void
  openProyecto: (id: string) => void

  role: UserRole
  setRole: (role: UserRole) => void

  searchQuery: string
  setSearch: (q: string) => void

  // Modales de creación/edición
  modalOpen: null | 'contacto' | 'editar-contacto' | 'cotizacion' | 'proyecto' | 'servicio' | 'tarea' | 'contrato' | 'ingreso' | 'egreso' | 'inventario' | 'editar-usuario'
  editingContactoId: string | null
  editingUserId: string | null
  openModal: (modal: AppState['modalOpen']) => void
  openEditContacto: (id: string) => void
  openEditUsuario: (id: string) => void
  closeModal: () => void

  aiPanelOpen: boolean
  toggleAIPanel: () => void
  setAIPanel: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  selectedContactoId: null,
  selectedProyectoId: null,
  setView: (view) =>
    set({
      currentView: view,
      selectedContactoId: view === 'contacto-detalle' ? null : undefined,
      selectedProyectoId: view === 'proyecto-detalle' ? null : undefined,
    }),
  openContacto: (id) =>
    set({ currentView: 'contacto-detalle', selectedContactoId: id }),
  openProyecto: (id) =>
    set({ currentView: 'proyecto-detalle', selectedProyectoId: id }),

  role: 'ADMIN',
  setRole: (role) => set({ role }),

  searchQuery: '',
  setSearch: (q) => set({ searchQuery: q }),

  modalOpen: null,
  editingContactoId: null,
  editingUserId: null,
  openModal: (modal) => set({ modalOpen: modal, editingContactoId: null, editingUserId: null }),
  openEditContacto: (id) => set({ modalOpen: 'editar-contacto', editingContactoId: id, editingUserId: null }),
  openEditUsuario: (id) => set({ modalOpen: 'editar-usuario', editingUserId: id, editingContactoId: null }),
  closeModal: () => set({ modalOpen: null, editingContactoId: null, editingUserId: null }),

  aiPanelOpen: false,
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setAIPanel: (open) => set({ aiPanelOpen: open }),
}))
