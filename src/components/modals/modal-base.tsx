'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ title, subtitle, onClose, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={cn('w-full rounded-xl border border-border/60 bg-card shadow-2xl max-h-[90vh] overflow-hidden flex flex-col', sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border/50">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {hint && <div className="text-[10px] text-muted-foreground/70 mt-1">{hint}</div>}
    </div>
  )
}

export const inputClass = 'mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none'

export const selectClass = 'mt-1 h-9 w-full rounded-md border border-border/40 bg-input/60 px-3 text-sm focus:border-primary/60 focus:outline-none'

export const textareaClass = 'mt-1 w-full rounded-md border border-border/40 bg-input/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none'

export function Button({ children, onClick, disabled, variant = 'primary' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' }) {
  const classes = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'border border-border/40 bg-muted/30 hover:bg-muted/60',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors', classes[variant])}
    >
      {children}
    </button>
  )
}
