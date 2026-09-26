import { ArrowUp, Hand } from 'lucide-react'
import { useEffect, useState } from 'react'

const ONBOARDING_DURATION = 5000

export function ScrollHint() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('catalog-onboarding-seen') !== 'true'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!visible) return
    try {
      sessionStorage.setItem('catalog-onboarding-seen', 'true')
    } catch {
      // Keep the onboarding available when session storage is unavailable.
    }

    const timeoutId = window.setTimeout(
      () => setVisible(false),
      ONBOARDING_DURATION,
    )

    function dismiss() {
      setVisible(false)
    }

    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('wheel', dismiss, { once: true, passive: true })
    window.addEventListener('keydown', dismiss, { once: true })

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('wheel', dismiss)
      window.removeEventListener('keydown', dismiss)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="scroll-onboarding fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#281817]/75 px-8 text-center text-white backdrop-blur-[2px]"
    >
      <div className="scroll-onboarding-content flex flex-col items-center">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/10">
          <Hand
            className="scroll-onboarding-hand h-12 w-12 -rotate-12 stroke-[1.5]"
            aria-hidden="true"
          />
          <ArrowUp
            className="absolute -top-3 right-1 h-6 w-6 animate-bounce text-[#f3c9bd]"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[.24em] text-[#f3c9bd]">
          Catálogo interativo
        </p>
        <p className="serif mt-3 text-3xl leading-tight sm:text-4xl">
          Deslize para cima
        </p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
          Passe os produtos como no TikTok e toque nas fotos para ver cada
          detalhe.
        </p>
      </div>
    </div>
  )
}
