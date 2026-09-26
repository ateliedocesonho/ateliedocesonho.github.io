import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getWhatsAppUrl } from '../lib/whatsapp'
import { Brand } from './Brand'

export function SiteHeader() {
  const navigate = useNavigate()

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Voltar ao início"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-[#fbf8f3]/80 text-[#541720] shadow-sm backdrop-blur"
      >
        <ArrowLeft size={18} />
      </button>

      <Brand small />

      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com o Ateliê Doce Sonho pelo WhatsApp"
        className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/60 bg-[#fbf8f3]/85 px-3 text-xs font-semibold text-[#781f2b] shadow-sm backdrop-blur"
      >
        <MessageCircle size={16} />
        WhatsApp
      </a>
    </header>
  )
}
