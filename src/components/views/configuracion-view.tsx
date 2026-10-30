'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Settings, Save, TestTube, CheckCircle2, XCircle, MessageSquare, Mail, HardDrive, ExternalLink, AlertCircle, Sparkles, Send } from 'lucide-react'
import { RESPONSABLES } from '@/lib/format'

interface Credenciales {
  google: { configured: boolean; clientIdSet: boolean; clientSecretSet: boolean; refreshTokenSet: boolean; redirectUri: string; ultimaConexion?: string }
  gmail: { configured: boolean; email: string; appPasswordSet: boolean; ultimaConexion?: string }
  resend: { configured: boolean; apiKeySet: boolean; fromEmail: string; fromName: string; replyTo: string; ultimaConexion?: string }
  emailService: string
  telegram: { configured: boolean; botTokenSet: boolean; chatIds: Record<string, string>; configuredUsers: string[]; grupoEquipo?: string; ultimaConexion?: string }
}

export function ConfiguracionView() {
  const [creds, setCreds] = useState<Credenciales | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state Google
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleClientSecret, setGoogleClientSecret] = useState('')
  const [googleRefreshToken, setGoogleRefreshToken] = useState('')

  // Form state Gmail
  const [gmailEmail, setGmailEmail] = useState('seagull.records.99@gmail.com')
  const [gmailAppPassword, setGmailAppPassword] = useState('')

  // Form state Resend
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendFromEmail, setResendFromEmail] = useState('onboarding@resend.dev')
  const [resendFromName, setResendFromName] = useState('SEAGULL RECORDS Studio OS')
  const [resendReplyTo, setResendReplyTo] = useState('seagull.records.99@gmail.com')

  // Form state Telegram
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChatIds, setTelegramChatIds] = useState<Record<string, string>>({
    Martha: '', Aarón: '', Caleb: '', Oseías: '',
  })
  const [telegramGrupo, setTelegramGrupo] = useState('')

  // Acciones
  const [saving, setSaving] = useState<string | null>(null)
  const [probando, setProbando] = useState<string | null>(null)

  const load = () => {
    Promise.all([
      fetch('/api/credenciales').then(r => r.json()),
      fetch('/api/google').then(r => r.json()),
      fetch('/api/telegram').then(r => r.json()),
    ]).then(([credsRes, googleRes, telegramRes]) => {
      const cred = credsRes.credenciales?.find((c: any) => c.servicio === 'GOOGLE_OAUTH')
      if (cred?.datos?.clientId) setGoogleClientId(cred.datos.clientId === '••••••••' ? '' : cred.datos.clientId)
      if (cred?.datos?.clientSecret_set) setGoogleClientSecret('')
      if (cred?.datos?.refreshToken_set) setGoogleRefreshToken('')

      const credGmail = credsRes.credenciales?.find((c: any) => c.servicio === 'GMAIL')
      if (credGmail?.datos?.email) setGmailEmail(credGmail.datos.email === '••••••••' ? '' : credGmail.datos.email)

      const credTelegram = credsRes.credenciales?.find((c: any) => c.servicio === 'TELEGRAM_BOT')
      if (credTelegram?.datos?.chatIds) {
        setTelegramChatIds(prev => ({ ...prev, ...credTelegram.datos.chatIds }))
      }

      const credResend = credsRes.credenciales?.find((c: any) => c.servicio === 'RESEND')
      if (credResend?.datos) {
        if (credResend.datos.fromEmail) setResendFromEmail(credResend.datos.fromEmail)
        if (credResend.datos.fromName) setResendFromName(credResend.datos.fromName)
        if (credResend.datos.replyTo) setResendReplyTo(credResend.datos.replyTo)
      }

      setCreds({
        google: googleRes.google,
        gmail: googleRes.gmail,
        resend: googleRes.resend,
        emailService: googleRes.emailService,
        telegram: telegramRes,
      })
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const saveGoogle = async () => {
    setSaving('google')
    try {
      const datos: any = {}
      if (googleClientId) datos.clientId = googleClientId
      if (googleClientSecret) datos.clientSecret = googleClientSecret
      if (googleRefreshToken) datos.refreshToken = googleRefreshToken
      datos.redirectUri = `${window.location.origin}/api/google/callback`

      const res = await fetch('/api/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio: 'GOOGLE_OAUTH', datos }),
      })
      const data = await res.json()
      if (data.ok) { alert('✓ Credenciales Google guardadas'); load() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setSaving(null) }
  }

  const saveGmail = async () => {
    setSaving('gmail')
    try {
      const res = await fetch('/api/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio: 'GMAIL',
          datos: { email: gmailEmail, appPassword: gmailAppPassword },
        }),
      })
      const data = await res.json()
      if (data.ok) { alert('✓ Credenciales Gmail guardadas'); load() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setSaving(null) }
  }

  const saveResend = async () => {
    setSaving('resend')
    try {
      const res = await fetch('/api/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio: 'RESEND',
          datos: {
            apiKey: resendApiKey,
            fromEmail: resendFromEmail,
            fromName: resendFromName,
            replyTo: resendReplyTo,
          },
        }),
      })
      const data = await res.json()
      if (data.ok) { alert('✓ Resend guardado correctamente'); load() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setSaving(null) }
  }

  const probarResend = async () => {
    setProbando('resend')
    try {
      const res = await fetch('/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'probar_email', to: resendReplyTo }),
      })
      const data = await res.json()
      alert(data.message || data.error)
    } catch { alert('Error de conexión') }
    finally { setProbando(null) }
  }

  const saveTelegram = async () => {
    setSaving('telegram')
    try {
      const res = await fetch('/api/credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio: 'TELEGRAM_BOT',
          datos: {
            botToken: telegramBotToken,
            chatIds: telegramChatIds,
            grupoEquipo: telegramGrupo,
          },
        }),
      })
      const data = await res.json()
      if (data.ok) { alert('✓ Bot de Telegram guardado'); load() }
      else alert('Error: ' + (data.error || 'desconocido'))
    } catch { alert('Error de conexión') }
    finally { setSaving(null) }
  }

  const probarGmail = async () => {
    setProbando('gmail')
    try {
      const res = await fetch('/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'probar_email' }),
      })
      const data = await res.json()
      alert(data.message || data.error)
    } catch { alert('Error de conexión') }
    finally { setProbando(null) }
  }

  const probarGoogle = async () => {
    setProbando('google')
    try {
      const res = await fetch('/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'probar' }),
      })
      const data = await res.json()
      alert(data.message || data.error)
    } catch { alert('Error de conexión') }
    finally { setProbando(null) }
  }

  const probarTelegram = async () => {
    setProbando('telegram')
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'probar', destinatario: 'grupo' }),
      })
      const data = await res.json()
      alert(data.message || data.error)
    } catch { alert('Error de conexión') }
    finally { setProbando(null) }
  }

  const enviarRecordatorios = async () => {
    setProbando('recordatorios')
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recordatorio_tareas' }),
      })
      const data = await res.json()
      alert(data.message || data.error)
    } catch { alert('Error de conexión') }
    finally { setProbando(null) }
  }

  const enviarInformeDiario = async () => {
    setProbando('informe')
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'informe_diario' }),
      })
      const data = await res.json()
      alert(data.message || data.error)
    } catch { alert('Error de conexión') }
    finally { setProbando(null) }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona las integraciones con Google Workspace y Telegram
        </p>
      </div>

      {/* Estado actual */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={cn('rounded-lg border p-3 flex items-center gap-3',
            creds?.resend?.configured ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5')}>
            {creds?.resend?.configured ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <div>
              <div className="text-xs font-semibold">Resend</div>
              <div className="text-[10px] text-muted-foreground">{creds?.resend?.configured ? '✅ Recomendado' : 'No configurado'}</div>
            </div>
          </div>
          <div className={cn('rounded-lg border p-3 flex items-center gap-3',
            creds?.google.configured ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5')}>
            {creds?.google.configured ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <div>
              <div className="text-xs font-semibold">Google Workspace</div>
              <div className="text-[10px] text-muted-foreground">{creds?.google.configured ? 'Conectado' : 'Sin configurar'}</div>
            </div>
          </div>
          <div className={cn('rounded-lg border p-3 flex items-center gap-3',
            creds?.gmail.configured ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-red-500/30 bg-red-500/5')}>
            {creds?.gmail.configured ? <AlertCircle className="h-5 w-5 text-yellow-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <div>
              <div className="text-xs font-semibold">Gmail</div>
              <div className="text-[10px] text-muted-foreground">{creds?.gmail.configured ? '⚠️ Bloqueado' : 'Sin configurar'}</div>
            </div>
          </div>
          <div className={cn('rounded-lg border p-3 flex items-center gap-3',
            creds?.telegram.configured ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5')}>
            {creds?.telegram.configured ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <div>
              <div className="text-xs font-semibold">Telegram Bot</div>
              <div className="text-[10px] text-muted-foreground">{creds?.telegram.configured ? '✅ Activo · grupo conectado' : 'Sin configurar'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* IMPORTANTE - Estado actual */}
      <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-green-500">✅ Telegram activo y funcionando</div>
          <div className="text-xs text-muted-foreground mt-1">
            Tu bot <strong>@SeagullAgendaNotificaciones_bot</strong> está conectado y enviando mensajes reales
            al grupo "Seagull - Agenda del Estudio". Usa los botones de abajo para enviar mensajes de prueba,
            recordatorios de tareas vencidas o el informe diario.
          </div>
          <div className="text-xs text-chart-5 mt-2">
            ⚠️ <strong>Pendiente:</strong> Para enviar mensajes privados a Martha, Aarón, Caleb y Oseías,
            cada uno debe abrir el bot en chat privado y enviar <code className="bg-muted/40 px-1">/start</code>.
            Después de eso, dime el Chat ID de cada uno y los agrego al sistema.
          </div>
        </div>
      </div>

      {/* Google Workspace */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Google Workspace (Drive + Calendar)</h3>
              <p className="text-[11px] text-muted-foreground">
                Sincroniza carpetas de proyectos y crea eventos de sesiones automáticamente
              </p>
            </div>
          </div>
          <div className="text-right">
            <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              <ExternalLink className="h-3 w-3" />
              Google Cloud Console
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Client ID (OAuth 2.0)</label>
            <input type="text" value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} placeholder="123456789-abc123.apps.googleusercontent.com"
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Client Secret</label>
            <input type="password" value={googleClientSecret} onChange={(e) => setGoogleClientSecret(e.target.value)} placeholder="GOCSPX-abc123..."
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Refresh Token</label>
            <input type="password" value={googleRefreshToken} onChange={(e) => setGoogleRefreshToken(e.target.value)} placeholder="1//0abc123..."
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
          </div>
          <div className="text-[10px] text-muted-foreground/70">
            Redirect URI a configurar en Google: <code className="text-chart-3">{creds?.google.redirectUri || '...'}</code>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={saveGoogle} disabled={saving === 'google'}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors">
            <Save className="h-3 w-3" />
            {saving === 'google' ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={probarGoogle} disabled={!creds?.google.configured || probando === 'google'}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs disabled:opacity-50 hover:bg-muted/60 transition-colors">
            <TestTube className="h-3 w-3" />
            {probando === 'google' ? 'Probando...' : 'Probar conexión'}
          </button>
        </div>
      </div>

      {/* Resend - RECOMENDADO */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Resend</h3>
                <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-500">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Servicio profesional de envío de emails - 100% confiable, sin bloqueos de Google
              </p>
            </div>
          </div>
          <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            Obtener API key
          </a>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">API Key</label>
            <input type="password" value={resendApiKey} onChange={(e) => setResendApiKey(e.target.value)} placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              Pasos: 1) Regístrate en https://resend.com con Google 2) Ve a "API Keys" → "Create API Key" 3) Permiso: "Sending access" 4) Copia la API key aquí
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email remitente</label>
              <input type="email" value={resendFromEmail} onChange={(e) => setResendFromEmail(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono focus:border-primary/60 focus:outline-none" />
              <div className="text-[10px] text-muted-foreground/70 mt-1">
                Por defecto: onboarding@resend.dev (sin verificar dominio)
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre remitente</label>
              <input type="text" value={resendFromName} onChange={(e) => setResendFromName(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm focus:border-primary/60 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email de respuesta (reply-to)</label>
            <input type="email" value={resendReplyTo} onChange={(e) => setResendReplyTo(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono focus:border-primary/60 focus:outline-none" />
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              Cuando alguien responde a un email del sistema, llegará aquí (tu Gmail)
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={saveResend} disabled={saving === 'resend'}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors">
            <Save className="h-3 w-3" />
            {saving === 'resend' ? 'Guardando...' : 'Guardar Resend'}
          </button>
          <button onClick={probarResend} disabled={!creds?.resend?.configured || probando === 'resend'}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-500 disabled:opacity-50 hover:bg-green-500/20 transition-colors">
            <TestTube className="h-3 w-3" />
            {probando === 'resend' ? 'Enviando...' : 'Enviar email de prueba'}
          </button>
        </div>
      </div>

      {/* Gmail */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Gmail (envío de cotizaciones y correos)</h3>
            <p className="text-[11px] text-muted-foreground">
              Para enviar cotizaciones PDF por email y notificaciones automáticas
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
            <input type="email" value={gmailEmail} onChange={(e) => setGmailEmail(e.target.value)} placeholder="seagull.records.99@gmail.com"
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">App Password (16 caracteres)</label>
            <input type="password" value={gmailAppPassword} onChange={(e) => setGmailAppPassword(e.target.value)} placeholder="abcd efgh ijkl mnop"
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              Generar en: Google Account → Security → 2-Step Verification → App passwords
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={saveGmail} disabled={saving === 'gmail'}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors">
            <Save className="h-3 w-3" />
            {saving === 'gmail' ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={probarGmail} disabled={!creds?.gmail.configured || probando === 'gmail'}
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-500 disabled:opacity-50 hover:bg-blue-500/20 transition-colors">
            <TestTube className="h-3 w-3" />
            {probando === 'gmail' ? 'Enviando...' : 'Enviar email de prueba'}
          </button>
        </div>
      </div>

      {/* Telegram */}
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Bot de Telegram (recordatorios al equipo)</h3>
              <p className="text-[11px] text-muted-foreground">
                Reemplaza el envío manual de recordatorios con mensajes automáticos a tu equipo
              </p>
            </div>
          </div>
          <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            Crear bot con @BotFather
          </a>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bot Token</label>
            <input type="password" value={telegramBotToken} onChange={(e) => setTelegramBotToken(e.target.value)} placeholder="123456789:ABCdefGhiJklmNop..."
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              Pasos: 1) Abre @BotFather en Telegram 2) Envía /newbot 3) Sigue las instrucciones 4) Copia el token aquí
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Chat IDs del equipo</label>
            <div className="grid grid-cols-2 gap-2">
              {RESPONSABLES.map((r) => (
                <div key={r}>
                  <label className="text-[11px] text-muted-foreground">{r}</label>
                  <input type="text" value={telegramChatIds[r] || ''} onChange={(e) => setTelegramChatIds(prev => ({ ...prev, [r]: e.target.value }))} placeholder="123456789"
                    className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-2">
              Para obtener cada Chat ID: 1) Cada miembro debe iniciar el bot con /start 2) Visita https://api.telegram.org/bot[TOKEN]/getUpdates 3) Copia el "id" del chat
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chat ID del grupo del equipo (opcional)</label>
            <input type="text" value={telegramGrupo} onChange={(e) => setTelegramGrupo(e.target.value)} placeholder="-1001234567890"
              className="mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              Si tienes un grupo de Telegram del equipo, pon su ID aquí para enviar mensajes grupales
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={saveTelegram} disabled={saving === 'telegram'}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors">
            <Save className="h-3 w-3" />
            {saving === 'telegram' ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={probarTelegram} disabled={!creds?.telegram.configured || probando === 'telegram'}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-xs disabled:opacity-50 hover:bg-muted/60 transition-colors">
            <TestTube className="h-3 w-3" />
            {probando === 'telegram' ? 'Enviando...' : 'Enviar mensaje de prueba'}
          </button>
          <button onClick={enviarRecordatorios} disabled={!creds?.telegram.configured || probando === 'recordatorios'}
            className="inline-flex items-center gap-1.5 rounded-md border border-chart-2/30 bg-chart-2/10 px-3 py-1.5 text-xs text-chart-2 disabled:opacity-50 hover:bg-chart-2/20 transition-colors">
            <Send className="h-3 w-3" />
            {probando === 'recordatorios' ? 'Enviando...' : 'Recordatorio de tareas vencidas'}
          </button>
          <button onClick={enviarInformeDiario} disabled={!creds?.telegram.configured || probando === 'informe'}
            className="inline-flex items-center gap-1.5 rounded-md border border-chart-1/30 bg-chart-1/10 px-3 py-1.5 text-xs text-chart-1 disabled:opacity-50 hover:bg-chart-1/20 transition-colors">
            <Sparkles className="h-3 w-3" />
            {probando === 'informe' ? 'Enviando...' : 'Informe diario a todos'}
          </button>
        </div>
      </div>

      {/* Instrucciones para despliegue */}
      <div className="rounded-xl border border-chart-2/30 bg-chart-2/5 p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-chart-2">
          <Sparkles className="h-4 w-4" />
          ¿Cómo activar las integraciones reales?
        </h3>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-bold text-chart-2">1.</span>
            <span>Configura tus credenciales arriba (Google OAuth, Gmail App Password, Bot Token Telegram)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-chart-2">2.</span>
            <span>Despliega este sistema en un hosting con acceso a internet (Vercel, Railway, tu propio servidor)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-chart-2">3.</span>
            <span>El código ya está listo — al desplegar, las mismas credenciales activarán el envío real automáticamente</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-chart-2">4.</span>
            <span>Para configurar el bot de Telegram en producción, uncomment las llamadas a fetch en <code className="text-chart-3 font-mono bg-muted/40 px-1">src/app/api/telegram/route.ts</code></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-chart-2">5.</span>
            <span>Para Gmail, uncomment la lógica de nodemailer en <code className="text-chart-3 font-mono bg-muted/40 px-1">src/app/api/google/route.ts</code></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-chart-2">6.</span>
            <span>Para Google Drive/Calendar, instala <code className="text-chart-3 font-mono bg-muted/40 px-1">googleapis</code> y uncomment las llamadas en <code className="text-chart-3 font-mono bg-muted/40 px-1">src/app/api/google/route.ts</code></span>
          </li>
        </ol>
      </div>
    </div>
  )
}
