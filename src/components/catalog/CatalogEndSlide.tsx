import { ArrowRight, Clock3, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { StoreSettings } from '../../types/catalog'

interface CatalogEndSlideProps {
  onStartOrder: () => void
  store: StoreSettings
}

export function CatalogEndSlide({ onStartOrder, store }: CatalogEndSlideProps) {
  return (
    <section className="product-slide flex min-h-[100svh] flex-col items-center justify-center px-7 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#781f2b] shadow-sm">
        <Heart size={23} />
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[.23em] text-[#a84d53]">
        Sua comemoração merece esse carinho
      </p>
      <h2 className="serif mt-2 max-w-md text-4xl leading-tight text-[#541720]">
        Vamos adoçar esse momento?
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#806e69]">
        Escolha os sabores com calma. A gente te ajuda a deixar tudo do jeitinho
        que você sonhou.
      </p>

      <div className="mt-6 w-full max-w-md space-y-2 rounded-2xl border border-[#eaded4] bg-white/75 p-4 text-left text-[11px] leading-relaxed text-[#806e69]">
        <p>
          <b className="text-[#654f4a]">Retirada:</b> {store.pickupPolicy}{' '}
          {store.deliveryPolicy} {store.transportPolicy}
        </p>
        <p>
          <b className="text-[#654f4a]">Reserva:</b> {store.depositPercent}% de
          sinal. {store.acceptsCard ? 'Aceitamos cartão.' : ''} Prazo ideal de
          encomenda: {store.advanceNoticeDays} dias.
        </p>
        <p>
          <b className="text-[#654f4a]">Cancelamentos:</b> até{' '}
          {store.cancellationNoticeDays} dias antes da retirada.
        </p>
      </div>

      <button
        type="button"
        onClick={onStartOrder}
        className="mt-6 flex items-center gap-2 rounded-full bg-[#781f2b] px-7 py-3.5 text-sm font-semibold text-white shadow-md"
      >
        Montar minha encomenda <ArrowRight size={17} />
      </button>
      <Link to="/" className="mt-4 text-xs text-[#907b75]">
        Voltar ao início
      </Link>
      <p className="mt-3 flex items-center gap-1 text-[10px] text-[#a18d87]">
        <Clock3 size={11} /> Pedido ideal com {store.advanceNoticeDays} dias de
        antecedência
      </p>
    </section>
  )
}
