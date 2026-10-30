'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Sparkles, Send, Bot, User, Wand2, TrendingUp, MessageSquare,
  Loader2, Copy, Check, FileText,
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const CHAT_SUGGESTIONS = [
  '¿Cuánto cuesta grabar una canción?',
  '¿Cómo contrato un servicio del estudio?',
  '¿Cuándo se paga el saldo de mi proyecto?',
  '¿Qué servicios incluyen producción completa?',
]

const COTIZACION_PRESETS = [
  { label: 'Single (1 canción)', tipoProyecto: 'Producción de 1 canción', descripcion: 'Producción completa de un sencillo, incluye grabación, mezcla y masterización' },
  { label: 'EP (3 canciones)', tipoProyecto: 'EP de 3 canciones', descripcion: 'Producción completa de un EP de 3 canciones' },
  { label: 'Álbum (10 canciones)', tipoProyecto: 'Álbum de 10 canciones', descripcion: 'Producción completa de un álbum de 10 canciones' },
  { label: 'Covers para redes', tipoProyecto: 'Covers para redes sociales', descripcion: 'Masterización de 10 covers para publicación en redes sociales' },
]

const COPY_TYPES = [
  { key: 'descripcion_servicio', label: 'Desc. servicio', desc: 'Para catálogo web' },
  { key: 'post_instagram', label: 'Post Instagram', desc: 'Caption con hashtags' },
  { key: 'post_facebook', label: 'Post Facebook', desc: 'Promoción en Facebook' },
  { key: 'email_cliente', label: 'Email a cliente', desc: 'Seguimiento post-sesión' },
  { key: 'whatsapp_cobro', label: 'Cobro WhatsApp', desc: 'Mensaje de cobro amable' },
  { key: 'anuncio_ads', label: 'Anuncio Ads', desc: 'Copy para Meta Ads' },
]

const TONES = ['Profesional', 'Cálido', 'Urgente', 'Inspirador', 'Casual']

export function AIView() {
  const [mode, setMode] = useState<'chat' | 'cotizacion' | 'copy' | 'analisis'>('chat')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente virtual de SEAGULL RECORDS. Puedo ayudarte con:\n\n• Información sobre servicios y precios\n• Generar cotizaciones automáticas\n• Crear copy para tus redes sociales\n• Análisis financiero del estudio\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cotizacion state
  const [cotNombreCliente, setCotNombreCliente] = useState('')
  const [cotTipoProyecto, setCotTipoProyecto] = useState('')
  const [cotDescripcion, setCotDescripcion] = useState('')
  const [cotResult, setCotResult] = useState('')
  const [cotLoading, setCotLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Copy state
  const [copyType, setCopyType] = useState('descripcion_servicio')
  const [copyServicio, setCopyServicio] = useState('')
  const [copyContexto, setCopyContexto] = useState('')
  const [copyTone, setCopyTone] = useState('Profesional')
  const [copyResult, setCopyResult] = useState('')
  const [copyLoading, setCopyLoading] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const message = text || input.trim()
    if (!message || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: message, timestamp: new Date() }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content, timestamp: new Date() }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Disculpa, tuve un problema técnico. ¿Puedes repetir tu pregunta?', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const generarCotizacion = async () => {
    if (!cotTipoProyecto) return
    setCotLoading(true)
    setCotResult('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cotizacion',
          context: {
            nombreCliente: cotNombreCliente || 'Cliente',
            tipoProyecto: cotTipoProyecto,
            descripcionProyecto: cotDescripcion,
          },
        }),
      })
      const data = await res.json()
      setCotResult(data.content)
    } catch {
      setCotResult('Error generando la cotización. Intenta nuevamente.')
    } finally {
      setCotLoading(false)
    }
  }

  const generarCopy = async () => {
    if (!copyServicio) return
    setCopyLoading(true)
    setCopyResult('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copy',
          context: {
            tipo: copyType,
            servicio: copyServicio,
            contexto: copyContexto,
            tono: copyTone,
          },
        }),
      })
      const data = await res.json()
      setCopyResult(data.content)
    } catch {
      setCopyResult('Error generando el copy. Intenta nuevamente.')
    } finally {
      setCopyLoading(false)
    }
  }

  const runAnalisis = async () => {
    setCopyLoading(true)
    setCopyResult('')
    try {
      const res = await fetch('/api/dashboard')
      const dashboard = await res.json()
      const resAI = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analisis',
          context: { metricas: dashboard.kpis },
        }),
      })
      const data = await resAI.json()
      setCopyResult(data.content)
    } catch {
      setCopyResult('Error en el análisis. Intenta nuevamente.')
    } finally {
      setCopyLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight gradient-text flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Asistente IA · SEAGULL
        </h2>
        <p className="text-sm text-muted-foreground">
          Chat para clientes · Cotizador automático · Copy assistant · Análisis del estudio
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 border-b border-border/40 overflow-x-auto scrollbar-thin">
        <ModeButton active={mode === 'chat'} onClick={() => setMode('chat')} icon={MessageSquare} label="Chat" />
        <ModeButton active={mode === 'cotizacion'} onClick={() => setMode('cotizacion')} icon={FileText} label="Cotizador" />
        <ModeButton active={mode === 'copy'} onClick={() => setMode('copy')} icon={Wand2} label="Copy Assistant" />
        <ModeButton active={mode === 'analisis'} onClick={() => setMode('analisis')} icon={TrendingUp} label="Análisis" />
      </div>

      {/* CHAT MODE */}
      {mode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex gap-3 max-w-[85%]', m.role === 'user' && 'ml-auto flex-row-reverse')}>
                  <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    m.role === 'assistant' ? 'bg-gradient-to-br from-chart-1 to-chart-2 text-white' : 'bg-muted text-muted-foreground')}>
                    {m.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div className={cn('rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                    m.role === 'assistant' ? 'bg-muted/40 text-foreground' : 'bg-primary text-primary-foreground')}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-chart-1 to-chart-2 text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-border/40 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 h-10 rounded-md border border-border/40 bg-input/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sugerencias</div>
              <div className="space-y-2">
                {CHAT_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="block w-full text-left rounded-md border border-border/40 bg-muted/30 px-3 py-2 text-xs hover:bg-muted/60 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-chart-2" />
                <span className="text-xs font-semibold text-chart-2">Powered by Z.ai</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Asistente entrenado con los servicios y precios de SEAGULL RECORDS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* COTIZADOR MODE */}
      {mode === 'cotizacion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold mb-3">Tipo de proyecto</div>
              <div className="grid grid-cols-2 gap-2">
                {COTIZACION_PRESETS.map((p) => (
                  <button key={p.label} onClick={() => { setCotTipoProyecto(p.tipoProyecto); setCotDescripcion(p.descripcion) }}
                    className={cn('rounded-md border p-2.5 text-left transition-colors',
                      cotTipoProyecto === p.tipoProyecto ? 'border-primary bg-primary/10' : 'border-border/40 bg-muted/30 hover:bg-muted/60')}>
                    <div className="text-xs font-semibold">{p.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Nombre del cliente (opcional)</label>
              <input type="text" value={cotNombreCliente} onChange={(e) => setCotNombreCliente(e.target.value)} placeholder="Ej: Karla Castañeda"
                className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold">Tipo de proyecto</label>
              <input type="text" value={cotTipoProyecto} onChange={(e) => setCotTipoProyecto(e.target.value)} placeholder="Ej: Single de 1 canción"
                className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold">Descripción del proyecto</label>
              <textarea value={cotDescripcion} onChange={(e) => setCotDescripcion(e.target.value)} rows={3} placeholder="Describe lo que el cliente necesita..."
                className="mt-1 w-full rounded-md border border-border/40 bg-input/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            </div>
            <button onClick={generarCotizacion} disabled={!cotTipoProyecto || cotLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-chart-1 to-chart-2 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity">
              {cotLoading ? (<><Loader2 className="h-4 w-4 animate-spin" />Generando...</>) : (<><Wand2 className="h-4 w-4" />Generar cotización</>)}
            </button>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Resultado</div>
              {cotResult && !cotLoading && (
                <button onClick={() => copyToClipboard(cotResult)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              )}
            </div>
            {cotLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : cotResult ? (
              <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">{cotResult}</div>
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Completa el formulario y genera tu cotización
              </div>
            )}
          </div>
        </div>
      )}

      {/* COPY MODE */}
      {mode === 'copy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold mb-3">Tipo de copy</div>
              <div className="grid grid-cols-2 gap-2">
                {COPY_TYPES.map((t) => (
                  <button key={t.key} onClick={() => setCopyType(t.key)}
                    className={cn('rounded-md border p-2.5 text-left transition-colors',
                      copyType === t.key ? 'border-primary bg-primary/10' : 'border-border/40 bg-muted/30 hover:bg-muted/60')}>
                    <div className="text-xs font-semibold">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Servicio o contexto</label>
              <input type="text" value={copyServicio} onChange={(e) => setCopyServicio(e.target.value)} placeholder="Ej: Grabación de single para banda de rock"
                className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold">Contexto adicional (opcional)</label>
              <textarea value={copyContexto} onChange={(e) => setCopyContexto(e.target.value)} rows={3} placeholder="Cualquier detalle relevante..."
                className="mt-1 w-full rounded-md border border-border/40 bg-input/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold">Tono</label>
              <select value={copyTone} onChange={(e) => setCopyTone(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm focus:border-primary/60 focus:outline-none">
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={generarCopy} disabled={!copyServicio || copyLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-chart-1 to-chart-2 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity">
              {copyLoading ? (<><Loader2 className="h-4 w-4 animate-spin" />Generando...</>) : (<><Wand2 className="h-4 w-4" />Generar copy</>)}
            </button>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Resultado</div>
              {copyResult && !copyLoading && (
                <button onClick={() => copyToClipboard(copyResult)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              )}
            </div>
            {copyLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : copyResult ? (
              <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">{copyResult}</div>
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Completa el formulario y genera tu copy
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALISIS MODE */}
      {mode === 'analisis' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Análisis financiero del estudio</h3>
                <p className="text-xs text-muted-foreground">
                  Genera un análisis completo con fortalezas, áreas de mejora, recomendaciones estratégicas y proyección a 30/60/90 días basado en los datos actuales del estudio.
                </p>
              </div>
              <button onClick={runAnalisis} disabled={copyLoading}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-chart-1 to-chart-2 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity">
                {copyLoading ? (<><Loader2 className="h-4 w-4 animate-spin" />Analizando...</>) : (<><TrendingUp className="h-4 w-4" />Analizar</>)}
              </button>
            </div>
          </div>

          {copyResult && (
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Análisis predictivo</div>
                <button onClick={() => copyToClipboard(copyResult)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">{copyResult}</div>
            </div>
          )}

          {!copyResult && !copyLoading && (
            <div className="rounded-xl border border-dashed border-border/50 bg-card/40 backdrop-blur-sm p-12 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Genera un análisis completo del estudio basado en tus métricas actuales</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ModeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick}
      className={cn('flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
        active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
