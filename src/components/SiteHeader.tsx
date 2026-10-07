import { ArrowLeft, Check, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Brand } from './Brand'

interface SiteHeaderProps {
  onCartClick: () => void
  cartCount: number
  animateCart: boolean
}

export function SiteHeader({
  onCartClick,
  cartCount,
  animateCart,
}: SiteHeaderProps) {
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

      <button
        type="button"
        onClick={onCartClick}
        aria-label={`Abrir carrinho${cartCount ? ` com ${cartCount} itens` : ''}`}
        className={`cart-button flex min-h-11 items-center gap-2 rounded-2xl border border-[#eaded4] bg-white/95 py-1.5 pl-2 pr-3 text-left text-[#541720] shadow-[0_4px_14px_rgba(84,23,32,.09)] backdrop-blur transition-colors hover:border-[#cda9a1] hover:bg-white ${animateCart ? 'animate-cart-added' : ''}`}
      >
        <span className="cart-icon-wrap flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f8efec] text-[#781f2b]">
          {animateCart ? (
            <Check className="cart-icon" size={17} strokeWidth={2.5} />
          ) : (
            <ShoppingCart className="cart-icon" size={17} strokeWidth={2} />
          )}
        </span>
        <span
          aria-live="polite"
          className="min-w-[68px] text-xs font-semibold leading-none"
        >
          {animateCart ? 'Adicionado!' : 'Carrinho'}
        </span>
        {cartCount > 0 && (
          <span className="cart-count flex h-6 min-w-6 items-center justify-center rounded-full bg-[#781f2b] px-1.5 text-[11px] font-bold tabular-nums text-white">
            {cartCount}
          </span>
        )}
      </button>
    </header>
  )
}
