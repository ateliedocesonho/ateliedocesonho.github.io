import { useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import type { ProductPhoto } from '../../types/catalog'

interface ProductGalleryProps {
  productId: string
  title: string
  images: ProductPhoto[]
  soldOut: boolean
  prioritizeFirstImage?: boolean
  onOpenSlideshow: (index: number) => void
}

export function ProductGallery({
  productId,
  title,
  images,
  soldOut,
  prioritizeFirstImage = false,
  onOpenSlideshow,
}: ProductGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultiplePhotos = images.length > 1

  function updateActivePhoto() {
    const gallery = galleryRef.current
    if (!gallery) return

    setActiveIndex(Math.round(gallery.scrollLeft / gallery.clientWidth))
  }

  function goToPhoto(index: number) {
    const gallery = galleryRef.current
    if (!gallery) return

    gallery.scrollTo({ left: index * gallery.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="product-gallery relative h-full w-full overflow-hidden bg-[#eee2d6]">
      <div
        ref={galleryRef}
        onScroll={updateActivePhoto}
        aria-label={`Fotos de ${title}`}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((photo, index) => (
          <button
            key={`${productId}-${photo.src}`}
            type="button"
            onClick={() => onOpenSlideshow(index)}
            aria-label={`Ampliar foto ${index + 1} de ${title}`}
            className="relative h-full w-full shrink-0 snap-center overflow-hidden text-left"
          >
            <img
              src={`${import.meta.env.BASE_URL}${photo.src}`}
              alt={photo.alt}
              className="h-full w-full object-cover object-center"
              loading={prioritizeFirstImage && index === 0 ? 'eager' : 'lazy'}
            />
            <span className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#fffaf5]/85 text-[#781f2b] shadow backdrop-blur-sm">
              <Maximize2 size={16} />
            </span>
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#351614]/30 via-transparent to-transparent" />

      {hasMultiplePhotos && (
        <div
          role="tablist"
          aria-label={`Escolher foto de ${title}`}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#321815]/35 px-2.5 py-2 backdrop-blur-sm"
        >
          {images.map((photo, index) => (
            <button
              key={`${productId}-${photo.src}-dot`}
              type="button"
              role="tab"
              aria-label={`Foto ${index + 1}`}
              aria-selected={activeIndex === index}
              onClick={() => goToPhoto(index)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index ? 'w-5 bg-white' : 'w-2 bg-white/55'
              }`}
            />
          ))}
        </div>
      )}

      {soldOut && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#2b1516]/25">
          <span className="rounded-xl border border-white/80 bg-[#741c28] px-7 py-3 text-sm font-extrabold tracking-[.22em] text-white shadow-xl sm:text-base">
            ESGOTADO
          </span>
        </div>
      )}
    </div>
  )
}
