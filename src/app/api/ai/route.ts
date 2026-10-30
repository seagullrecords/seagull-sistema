import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai - Asistente IA para SEAGULL RECORDS
// Acciones: chat, cotizacion, copy, analisis
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, context, message, history } = body

    const zai = await ZAI.create()

    if (action === 'chat') {
      // Chat asistente del estudio - responde a clientes y al equipo
      const systemPrompt = `Eres el asistente virtual de SEAGULL RECORDS, un estudio de producción musical en Chimbote, Perú. Atiendes a:
- Clientes que preguntan por sus proyectos, pagos pendientes, estado de cotizaciones
- Miembros del equipo (Martha, Aarón, Caleb, Oseías) que consultan tareas, agenda, finanzas

Servicios que ofrece el estudio:
- Sala de ensayo: S/.30/hora
- Grabación en estudio: S/.60/hora
- Arreglos: S/.150/canción
- Edición: S/.100/canción
- Mezcla: S/.200/canción
- Masterización: S/.150/canción
- Productor musical: S/.150/canción
- Músico de sesión: S/.100/canción
- Producción completa: S/.1,500/canción (incluye todo el proceso)

Todos los precios + IGV 18%. Moneda: Soles (S/.).

Eres cálido, profesional y conoces la industria musical peruana. Respondes en español, de forma concisa (máx 4 párrafos). Si no sabes algo específico de un cliente, sugieres contactar al estudio directamente por WhatsApp 910 216 278 o email seagull.records.99@gmail.com.`

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ]

      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 500,
      })

      return NextResponse.json({
        content: completion.choices[0].message.content,
      })
    }

    if (action === 'cotizacion') {
      // Generar cotización automática según requisitos del cliente
      const { descripcionProyecto, nombreCliente, tipoProyecto } = context || {}

      const systemPrompt = `Eres un cotizador experto de SEAGULL RECORDS. Generas cotizaciones profesionales en español basándote en los servicios del estudio:

LISTA DE PRECIOS (en Soles, sin IGV):
- Sala de Ensayo: S/.30/hora
- Grabación en Estudio: S/.60/hora
- Arreglos Musicales: S/.150/canción (3 días)
- Edición: S/.100/canción (2 días)
- Mezcla: S/.200/canción (3 días)
- Masterización: S/.150/canción (3 días)
- Productor Musical: S/.150/canción (20 días)
- Músico de Sesión: S/.100/canción
- Producción Completa: S/.1,500/canción (incluye todo: preprod + grab + edit + mezcla + master, 20 días)

IGV: 18% sobre subtotal
Vigencia: 15 días
Moneda: Soles (S/.)

FORMATO DE RESPUESTA (markdown):
## Cotización COT-[código]

**Cliente:** [nombre]
**Fecha:** [fecha actual]
**Vigencia:** 15 días

### Detalle

| # | Servicio | Cantidad | Unidad | Precio Unit. | Subtotal |
|---|----------|----------|--------|-------------|----------|
| 1 | ... | ... | ... | S/.XXX | S/.XXX |

### Resumen
- Subtotal: S/.XXX
- IGV (18%): S/.XXX
- **Total: S/.XXX**

### Tiempo estimado de entrega
XX días

### Observaciones
- Anticipo del 50% para iniciar el proyecto
- Saldo contra entrega
- Forma de pago: Efectivo, Yape, Plin, Transferencia`

      const userPrompt = `Genera una cotización para:
- Cliente: ${nombreCliente || 'Cliente'}
- Tipo de proyecto: ${tipoProyecto || 'No especificado'}
- Descripción: ${descripcionProyecto || 'No especificada'}

Usa los servicios del estudio que correspondan. Si el proyecto es ambiguo, haz supuestos razonables basados en prácticas estándar de la industria musical peruana.`

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      })

      return NextResponse.json({
        content: completion.choices[0].message.content,
      })
    }

    if (action === 'copy') {
      // Generar copy: descripciones de servicios, anuncios, mensajes a clientes
      const { tipo, servicio, contexto, tono } = context || {}

      const systemPrompt = `Eres copywriter de SEAGULL RECORDS, estudio de producción musical en Chimbote, Perú. Generas contenido en español neutro con tono ${tono || 'profesional pero cálido'}. Tienes experiencia en marketing de estudios de grabación y conoces a músicos peruanos.`

      const userPrompt = `Genera ${tipo} para "${servicio}".
Contexto adicional: ${contexto || 'sin contexto adicional'}

Tipos disponibles:
- descripcion_servicio: descripción para catálogo web (2 párrafos)
- post_instagram: caption con hashtags (máx 2200 caracteres)
- post_facebook: post promocional (máx 500 caracteres)
- email_cliente: email de seguimiento post-sesión
- whatsapp_cobro: mensaje de cobro amable por WhatsApp
- anuncio_ads: copy para anuncio en Meta Ads
- guion_tiktok: guion de video TikTok 30 seg

Devuelve solo el contenido generado, sin metadatos.`

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 800,
      })

      return NextResponse.json({
        content: completion.choices[0].message.content,
      })
    }

    if (action === 'analisis') {
      // Análisis financiero del estudio
      const { metricas } = context || {}

      const systemPrompt = `Eres un analista financiero especializado en estudios de producción musical. Analizas métricas y das recomendaciones accionables. Respondes en español, formato estructurado, conciso.`

      const userPrompt = `Analiza estas métricas del estudio SEAGULL RECORDS:
${JSON.stringify(metricas, null, 2)}

Proporciona:
1. Diagnóstico general (1 párrafo)
2. 3 fortalezas del estudio
3. 3 áreas de mejora concretas
4. 2 recomendaciones estratégicas para aumentar ingresos
5. Proyección a 30/60/90 días si se mantienen las tendencias

Sé específico, práctico y usa datos. No agregues disclaimers.`

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 800,
      })

      return NextResponse.json({
        content: completion.choices[0].message.content,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      {
        error: 'AI service unavailable',
        content:
          '⚠️ El asistente de IA no está disponible en este momento. Por favor intenta más tarde o contacta al equipo directamente al WhatsApp 910 216 278.',
      },
      { status: 500 }
    )
  }
}
