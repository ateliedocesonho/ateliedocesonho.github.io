import { ArrowRight, Heart, ShoppingBag, Sparkles } from 'lucide-react'
import type { Product } from '../../types/catalog'
import { formatPrice } from '../../lib/format'
import { ProductGallery } from './ProductGallery'
import { ScrollHint } from './ScrollHint'

interface ProductSlideProps {
  product: Product
  catalogLabel: string
  index: number
  total: number
  activeIndex: number
  showScrollHint: boolean
  onOrder: (product: Product, flavor?: string) => void
  onOpenSlideshow: (product: Product, index: number) => void
  onGoToProduct: (index: number) => void
}

export function ProductSlide({
  product,
  catalogLabel,
  index,
  total,
  activeIndex,
  showScrollHint,
  onOrder,
  onOpenSlideshow,
  onGoToProduct,
}: ProductSlideProps) {
  return (
    <section
      id={`product-${product.id}`}
      data-product-slide
      aria-label={product.title}
      className="product-slide relative flex flex-col bg-[#fbf8f3] md:flex-row md:items-stretch"
    >
      <div className="relative h-[43svh] min-h-[290px] w-full overflow-hidden bg-[#eee2d6] md:h-[100svh] md:w-[54%] md:min-h-0">
        <ProductGallery
          productId={product.id}
          title={product.title}
          images={product.images}
          soldOut={product.soldOut === true}
          prioritizeFirstImage={index === 0}
          onOpenSlideshow={(photoIndex) => onOpenSlideshow(product, photoIndex)}
        />
        <span className="pointer-events-none absolute bottom-5 left-5 z-10 flex items-center gap-1.5 rounded-full border border-white/35 bg-[#fffaf5]/85 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[#781f2b] shadow-sm backdrop-blur-sm">
          <Sparkles size={13} /> {product.tag}
        </span>
        {showScrollHint && <ScrollHint />}
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 pb-8 pt-5 sm:px-10 md:px-[7%] md:pt-24">
        {index === 0 && (
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#ab8580]">
            {catalogLabel}
          </p>
        )}
        <p className="text-[10px] font-bold uppercase tracking-[.23em] text-[#a84d53]">
          {String(index + 1).padStart(2, '0')}
          <span className="mx-1.5 text-[#d9c8bd]">/</span>
          {product.category}
        </p>
        <h1 className="serif mt-2 text-[34px] leading-[1.08] text-[#541720] sm:text-5xl">
          {product.title}
        </h1>
        <p className="mt-3 max-w-md text-[13px] leading-[1.75] text-[#806e69] sm:text-sm">
          {product.description}
        </p>

        {product.flavors && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#8b303a]">
              <Heart size={12} fill="currentColor" />
              {product.flavorSelection === 'multiple'
                ? 'Escolha seus sabores'
                : 'Escolha seu sabor'}
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {product.flavors.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  disabled={product.soldOut}
                  onClick={() => onOrder(product, flavor)}
                  className="min-h-9 rounded-xl border border-[#d9b7ae] bg-[#fffaf6] px-2 py-1.5 text-[11px] font-semibold leading-tight text-[#781f2b] transition hover:border-[#781f2b] hover:bg-[#f5e7e2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 border-y border-[#eaded4] py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a48f88]">
            Tamanhos e valores
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.options.slice(0, 3).map((option) => (
              <span
                key={option.name}
                className="rounded-full border border-[#eaded4] bg-white/70 px-3 py-1.5 text-[11px] text-[#634d49]"
              >
                {option.name}
                <b className="ml-1 text-[#781f2b]">
                  {formatPrice(option.price)}
                </b>
              </span>
            ))}
            {product.options.length > 3 && (
              <span className="px-1 py-1.5 text-[11px] font-semibold text-[#8c7772]">
                + {product.options.length - 3} opções disponíveis
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={product.soldOut}
          onClick={() => onOrder(product)}
          className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#781f2b] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(120,31,43,.16)] transition hover:-translate-y-0.5 hover:bg-[#641a25] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#927f7b] disabled:shadow-none"
        >
          <ShoppingBag size={16} />
          {product.soldOut ? 'Produto esgotado' : 'Solicitar encomenda'}
          {!product.soldOut && <ArrowRight size={16} />}
        </button>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#907b75]">
            Role para conhecer o catálogo
          </span>
          <span className="text-[10px] text-[#aa9691]">
            {index + 1} de {total}
          </span>
        </div>
        <div
          aria-label={`Produto ${index + 1} de ${total}`}
          className="mt-2 flex gap-1.5"
        >
          {Array.from({ length: total }, (_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={() => onGoToProduct(dotIndex)}
              aria-label={`Ir para produto ${dotIndex + 1}`}
              aria-current={dotIndex === activeIndex ? 'step' : undefined}
              className={`h-1 rounded-full transition-all ${
                dotIndex === activeIndex
                  ? 'w-7 bg-[#781f2b]'
                  : 'w-1.5 bg-[#dacac0]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
