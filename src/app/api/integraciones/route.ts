import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/integraciones - estado de integraciones Google Workspace
export async function GET() {
  try {
    const integraciones = await db.googleIntegration.findMany({
      orderBy: { service: 'asc' },
    })

    return NextResponse.json({
      integraciones: integraciones.map((i) => ({
        ...i,
        metadata: i.metadata ? JSON.parse(i.metadata) : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching integraciones:', error)
    return NextResponse.json({ error: 'Failed to fetch integraciones' }, { status: 500 })
  }
}
