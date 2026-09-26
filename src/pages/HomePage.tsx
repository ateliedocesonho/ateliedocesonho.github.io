import {
  ArrowRight,
  Gift,
  Heart,
  Instagram,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import linksData from '../data/links.json'
import store from '../data/store.json'
import { getWhatsAppUrl } from '../lib/whatsapp'
import type { HomeLink } from '../types/catalog'

const icons = {
  'shopping-bag': ShoppingBag,
  gift: Gift,
} as const

export function HomePage() {
  const links = linksData as HomeLink[]

  return (
    <main className="grain relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-[#fbf8f3] px-6 pb-8 pt-12 text-center">
      <div className="pointer-events-none absolute -left-28 top-32 h-64 w-64 rounded-full bg-[#f1e4da]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-24 h-72 w-72 rounded-full bg-[#f4e6e0]/80 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center">
        <div className="mt-4 rounded-full border border-[#eaded4] bg-white/80 p-1 shadow-sm">
          <img
            src={`${import.meta.env.BASE_URL}inspiration/logo.jpg`}
            className="h-28 w-28 rounded-full object-cover"
            alt="Logo do Ateliê Doce Sonho"
          />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[.3em] text-[#8a2f38]">
          feito com carinho, para você
        </p>
        <h1 className="serif mt-2 text-[36px] leading-tight text-[#541720]">
          Ateliê Doce Sonho
        </h1>
        <p className="mt-3 max-w-[290px] text-sm leading-6 text-[#7d6b68]">
          Pequenos momentos ficam ainda mais doces quando são feitos à mão.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3">
          {links.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons] ?? Gift
            const buttonContent = (
              <>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    item.style === 'primary'
                      ? 'bg-white/15'
                      : 'bg-[#781f2b]/[.08]'
                  }`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[15px] font-semibold">
                    {item.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      item.style === 'primary'
                        ? 'text-white/75'
                        : 'text-[#856f6a]'
                    }`}
                  >
                    {item.description}
                  </span>
                </span>
                <ArrowRight size={17} className="opacity-65" />
              </>
            )
            const className = `flex min-h-[70px] items-center gap-3 rounded-2xl px-4 text-sm shadow-sm transition duration-200 active:scale-[.98] ${
              item.style === 'primary'
                ? 'bg-[#781f2b] text-white shadow-[#781f2b]/15 hover:bg-[#641a25]'
                : 'border border-[#eaded4] bg-white/85 text-[#541720] hover:border-[#781f2b]/40 hover:bg-white'
            }`

            return item.href.startsWith('#') ? (
              <Link key={item.id} to={item.href.slice(1)} className={className}>
                {buttonContent}
              </Link>
            ) : (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                {buttonContent}
              </a>
            )
          })}
        </div>

        <p className="mt-7 flex items-center gap-1.5 text-xs text-[#927f7b]">
          <Heart size={13} fill="#a9595f" stroke="#a9595f" />
          Produção artesanal no Rio de Janeiro
        </p>
        <a
          href={store.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-[#8a2f38] hover:bg-white/75"
        >
          <Instagram size={15} /> {store.instagramHandle}
        </a>
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex min-h-10 items-center gap-2 rounded-full border border-[#eaded4] bg-white/80 px-4 text-xs font-semibold text-[#781f2b] shadow-sm transition hover:border-[#cba8a0] hover:bg-white"
        >
          <MessageCircle size={15} /> Fale pelo WhatsApp
        </a>
      </div>

      <BrandingFooter />
    </main>
  )
}

function BrandingFooter() {
  return (
    <div className="relative z-10 pt-5 text-[10px] tracking-wide text-[#ac9a96]">
      CADA PEDIDO, FEITO COM AMOR <span className="mx-1">·</span> © ATELIÊ DOCE
      SONHO
    </div>
  )
}
