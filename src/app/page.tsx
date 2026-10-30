'use client'

import { useAppStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { DashboardView } from '@/components/views/dashboard-view'
import { ContactosView } from '@/components/views/contactos-view'
import { ContactoDetalleView } from '@/components/views/contacto-detalle-view'
import { CotizacionesView } from '@/components/views/cotizaciones-view'
import { ProyectosView } from '@/components/views/proyectos-view'
import { ProyectoDetalleView } from '@/components/views/proyecto-detalle-view'
import { TareasView } from '@/components/views/tareas-view'
import { ServiciosView } from '@/components/views/servicios-view'
import { ContratosView } from '@/components/views/contratos-view'
import { FinanzasView } from '@/components/views/finanzas-view'
import { AgendaView } from '@/components/views/agenda-view'
import { InventarioView } from '@/components/views/inventario-view'
import { AsistenciaView } from '@/components/views/asistencia-view'
import { InformesView } from '@/components/views/informes-view'
import { IntegracionesView } from '@/components/views/integraciones-view'
import { ConfiguracionView } from '@/components/views/configuracion-view'
import { EquipoView } from '@/components/views/equipo-view'
import { AIView } from '@/components/views/ai-view'
import { ModalContainer } from '@/components/modals/modal-container'

export default function Home() {
  const { currentView } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />
      case 'contactos': return <ContactosView />
      case 'contacto-detalle': return <ContactoDetalleView />
      case 'cotizaciones': return <CotizacionesView />
      case 'proyectos': return <ProyectosView />
      case 'proyecto-detalle': return <ProyectoDetalleView />
      case 'tareas': return <TareasView />
      case 'servicios': return <ServiciosView />
      case 'contratos': return <ContratosView />
      case 'finanzas': return <FinanzasView />
      case 'agenda': return <AgendaView />
      case 'inventario': return <InventarioView />
      case 'asistencia': return <AsistenciaView />
      case 'informes': return <InformesView />
      case 'integraciones': return <IntegracionesView />
      case 'configuracion': return <ConfiguracionView />
      case 'equipo': return <EquipoView />
      case 'ai': return <AIView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {renderView()}
        </main>
      </div>
      <ModalContainer />
    </div>
  )
}
