import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import store from '../data/store.json'
import { OrderModal } from '../components/order/OrderModal'
import { CatalogEndSlide } from '../components/catalog/CatalogEndSlide'
import { PhotoSlideshow } from '../components/catalog/PhotoSlideshow'
import { ProductSlide } from '../components/catalog/ProductSlide'
import { SiteHeader } from '../components/SiteHeader'
import { getCatalog } from '../lib/catalogs'
import type { Product, StoreSettings } from '../types/catalog'
import { CatalogNotFoundPage } from './CatalogNotFoundPage'

interface CatalogPageProps {
  catalogId?: string
}

export function CatalogPage({ catalogId: requestedCatalog }: CatalogPageProps) {
  const { catalogId: routeCatalog } = useParams()
  const catalogId = requestedCatalog ?? routeCatalog
  const catalog = catalogId ? getCatalog(catalogId) : undefined
  const scrollContainerRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [orderProduct, setOrderProduct] = useState<Product | null>(null)
  const [orderFlavors, setOrderFlavors] = useState<string[]>()
  const [slideshow, setSlideshow] = useState<{
    product: Product
    index: number
  } | null>(null)

  const products = useMemo(() => catalog?.products ?? [], [catalog])

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

  const closeSlideshow = useCallback(() => setSlideshow(null), [])
  const closeOrder = useCallback(() => {
    setOrderProduct(null)
    setOrderFlavors(undefined)
  }, [])
  const changeSlideshowPhoto = useCallback((index: number) => {
    setSlideshow((current) => (current ? { ...current, index } : current))
  }, [])

  if (!catalog || products.length === 0) return <CatalogNotFoundPage />

  function openOrder(product: Product, flavor?: string) {
    if (product.soldOut) return
    setOrderFlavors(flavor ? [flavor] : undefined)
    setOrderProduct(product)
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
      <SiteHeader />

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
          products={products}
          initialProduct={orderProduct}
          initialFlavors={orderFlavors}
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
