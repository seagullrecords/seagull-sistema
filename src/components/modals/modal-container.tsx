'use client'

import { useAppStore } from '@/lib/store'
import {
  ModalContacto, ModalCotizacion, ModalProyecto, ModalServicio,
  ModalTarea, ModalContrato, ModalTransaccion, ModalInventario,
} from './modals'
import { ModalEditarContacto } from './modal-editar-contacto'
import { ModalEditarUsuario } from './modal-editar-usuario'

export function ModalContainer() {
  const { modalOpen, closeModal, editingUserId } = useAppStore()

  if (!modalOpen) return null

  switch (modalOpen) {
    case 'contacto': return <ModalContacto onClose={closeModal} />
    case 'editar-contacto': return <ModalEditarContacto onClose={closeModal} />
    case 'editar-usuario': return <ModalEditarUsuario userId={editingUserId} onClose={closeModal} />
    case 'cotizacion': return <ModalCotizacion onClose={closeModal} />
    case 'proyecto': return <ModalProyecto onClose={closeModal} />
    case 'servicio': return <ModalServicio onClose={closeModal} />
    case 'tarea': return <ModalTarea onClose={closeModal} />
    case 'contrato': return <ModalContrato onClose={closeModal} />
    case 'ingreso': return <ModalTransaccion tipo="INGRESO" onClose={closeModal} />
    case 'egreso': return <ModalTransaccion tipo="EGRESO" onClose={closeModal} />
    case 'inventario': return <ModalInventario onClose={closeModal} />
    default: return null
  }
}
