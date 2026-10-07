import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import store from '../data/store.json'
import { OrderModal } from '../components/order/OrderModal'
import { CatalogEndSlide } from '../components/catalog/CatalogEndSlide'
import { PhotoSlideshow } from '../components/catalog/PhotoSlideshow'
import { ProductSlide } from '../components/catalog/ProductSlide'
import { SiteHeader } from '../components/SiteHeader'
import { getCatalog } from '../lib/catalogs'
import type { OrderLine, Product, StoreSettings } from '../types/catalog'
import { CatalogNotFoundPage } from './CatalogNotFoundPage'

interface CatalogPageProps {
  catalogId?: string
}

function readCart(catalogId: string | undefined, products: Product[]): OrderLine[] {
  if (!catalogId) return []

  try {
    const saved = window.localStorage.getItem(`ateliedocesonho:cart:${catalogId}`)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((entry): OrderLine[] => {
      if (!entry || typeof entry !== 'object') return []
      const savedLine = entry as Record<string, unknown>
      const savedProduct = savedLine.product
      const savedOption = savedLine.option
      if (!savedProduct || typeof savedProduct !== 'object') return []
      if (!savedOption || typeof savedOption !== 'object') return []

      const productId = (savedProduct as Record<string, unknown>).id
      const optionName = (savedOption as Record<string, unknown>).name
      const product = products.find((item) => item.id === productId)
      const option = product?.options.find((item) => item.name === optionName)
      const quantity = savedLine.quantity
      if (!product || !option || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
        return []
      }

      const flavors = Array.isArray(savedLine.flavors)
        ? savedLine.flavors.filter(
            (flavor): flavor is string =>
              typeof flavor === 'string' && (product.flavors ?? []).includes(flavor),
          )
        : []

      return [{
        product,
        option,
        flavors: option.maxFlavors ? flavors.slice(0, option.maxFlavors) : flavors,
        quantity,
      }]
    })
  } catch {
    return []
  }
}

export function CatalogPage({ catalogId: requestedCatalog }: CatalogPageProps) {
  const { catalogId: routeCatalog } = useParams()
  const catalogId = requestedCatalog ?? routeCatalog
  const catalog = catalogId ? getCatalog(catalogId) : undefined
  const products = useMemo(() => catalog?.products ?? [], [catalog])
  const scrollContainerRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [orderProduct, setOrderProduct] = useState<Product | null>(null)
  const [cartLines, setCartLines] = useState<OrderLine[]>(() =>
    readCart(catalogId, products),
  )
  const [cartCatalogId, setCartCatalogId] = useState(catalogId)
  const [cartView, setCartView] = useState(false)
  const [animateCart, setAnimateCart] = useState(false)
  const cartAnimationTimer = useRef<number | undefined>(undefined)
  const [orderFlavors, setOrderFlavors] = useState<string[]>()
  const [slideshow, setSlideshow] = useState<{
    product: Product
    index: number
  } | null>(null)

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root || products.length === 0) return

    const slides = root.querySelectorAll<HTMLElement>('[data-product-slide]')
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!mostVisible) return

        const slideIndex = Array.from(slides).indexOf(
          mostVisible.target as HTMLElement,
        )
        if (slideIndex >= 0) setActiveIndex(slideIndex)
      },
      { root, threshold: [0.35, 0.55, 0.75] },
    )

    slides.forEach((slide) => observer.observe(slide))
    return () => observer.disconnect()
  }, [catalogId, products.length])

  useEffect(() => {
    if (cartCatalogId === catalogId) return
    setCartLines(readCart(catalogId, products))
    setCartCatalogId(catalogId)
  }, [cartCatalogId, catalogId, products])

  useEffect(() => {
    if (!catalogId || cartCatalogId !== catalogId) return
    try {
      window.localStorage.setItem(
        `ateliedocesonho:cart:${catalogId}`,
        JSON.stringify(cartLines),
      )
    } catch {
      // Keep the cart usable if browser storage is unavailable.
    }
  }, [cartCatalogId, cartLines, catalogId])

  const closeSlideshow = useCallback(() => setSlideshow(null), [])
  useEffect(() => () => window.clearTimeout(cartAnimationTimer.current), [])
  const closeOrder = useCallback(() => {
    setOrderProduct(null)
    setOrderFlavors(undefined)
    setCartView(false)
  }, [])
  const changeSlideshowPhoto = useCallback((index: number) => {
    setSlideshow((current) => (current ? { ...current, index } : current))
  }, [])

  if (!catalog || products.length === 0) return <CatalogNotFoundPage />

  function openOrder(product: Product, flavor?: string) {
    if (product.soldOut) return
    setCartView(false)
    setOrderFlavors(flavor ? [flavor] : undefined)
    setOrderProduct(product)
  }

  function openCart() {
    const cartProduct =
      cartLines[0]?.product ?? products[activeIndex] ?? products[0]
    if (!cartProduct) return

    setCartView(true)
    setOrderFlavors(undefined)
    setOrderProduct(cartProduct)
  }

  function showCartAddedFeedback() {
    window.clearTimeout(cartAnimationTimer.current)
    setAnimateCart(false)
    cartAnimationTimer.current = window.setTimeout(() => {
      setAnimateCart(true)
      cartAnimationTimer.current = window.setTimeout(
        () => setAnimateCart(false),
        800,
      )
    }, 300)
  }

  function goToProduct(index: number) {
    const product = products[index]
    if (!product) return

    document
      .getElementById(`product-${product.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main
      key={catalog.id}
      ref={scrollContainerRef}
      aria-label={catalog.title}
      className="snap-scroll bg-[#fbf8f3]"
    >
      <SiteHeader
        onCartClick={openCart}
        cartCount={cartLines.reduce((count, line) => count + line.quantity, 0)}
        animateCart={animateCart}
      />

      {products.map((product, index) => (
        <ProductSlide
          key={product.id}
          product={product}
          catalogLabel={`${catalog.title} · ${catalog.subtitle}`}
          index={index}
          total={products.length}
          activeIndex={activeIndex}
          showScrollHint={index === 0}
          onOrder={openOrder}
          onOpenSlideshow={(selectedProduct, photoIndex) =>
            setSlideshow({ product: selectedProduct, index: photoIndex })
          }
          onGoToProduct={goToProduct}
        />
      ))}

      <CatalogEndSlide
        store={store as StoreSettings}
        onStartOrder={() => {
          const firstAvailable = products.find((product) => !product.soldOut)
          if (firstAvailable) openOrder(firstAvailable)
        }}
      />

      {orderProduct && (
        <OrderModal
          key={orderProduct.id}
          initialProduct={orderProduct}
          initialFlavors={orderFlavors}
          lines={cartLines}
          onLinesChange={setCartLines}
          onAddToCart={showCartAddedFeedback}
          cartView={cartView}
          store={store as StoreSettings}
          onClose={closeOrder}
        />
      )}

      {slideshow && (
        <PhotoSlideshow
          photos={slideshow.product.images}
          title={slideshow.product.title}
          activeIndex={slideshow.index}
          onChange={changeSlideshowPhoto}
          onClose={closeSlideshow}
        />
      )}
    </main>
  )
}
