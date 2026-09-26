import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  message: string
  variant?: 'error' | 'success' | 'info'
  onDismiss: () => void
}

const variantStyles = {
  error: 'border-[#f2b8b5] bg-[#fff2f0] text-[#842c32]',
  success: 'border-[#a9d5b8] bg-[#effaf2] text-[#23613b]',
  info: 'border-[#d9c4b7] bg-[#fffaf5] text-[#654f4a]',
}

export function Toast({ message, variant = 'info', onDismiss }: ToastProps) {
  if (!message) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-[max(16px,env(safe-area-inset-top))]">
      <div
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        className={`toast-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_12px_40px_rgba(40,24,23,.22)] ${variantStyles[variant]}`}
      >
        {variant === 'error' ? (
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
        )}
        <p className="flex-1 text-sm font-semibold leading-snug">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-70 hover:bg-black/5 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
