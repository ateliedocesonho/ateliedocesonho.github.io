import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { ProductPhoto } from '../../types/catalog'

interface PhotoSlideshowProps {
  photos: ProductPhoto[]
  title: string
  activeIndex: number
  onChange: (index: number) => void
  onClose: () => void
}

export function PhotoSlideshow({
  photos,
  title,
  activeIndex,
  onChange,
  onClose,
}: PhotoSlideshowProps) {
  const photo = photos[activeIndex]
  const touchStartX = useRef<number | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        onChange((activeIndexRef.current + 1) % photos.length)
      }
      if (event.key === 'ArrowLeft') {
        onChange((activeIndexRef.current - 1 + photos.length) % photos.length)
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusableElements = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled])',
          ),
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement?.focus()
    }
  }, [onChange, onClose, photos.length])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos: ${title}`}
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1111]/95 p-4 text-white backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Fechar galeria"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
      >
        <X size={21} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              onChange((activeIndex - 1 + photos.length) % photos.length)
            }
            aria-label="Foto anterior"
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:left-8"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => onChange((activeIndex + 1) % photos.length)}
            aria-label="Próxima foto"
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:right-8"
          >
            <ArrowRight size={20} />
          </button>
        </>
      )}

      <figure
        className="flex max-h-full max-w-full flex-col items-center gap-3"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return

          const distance = event.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(distance) > 45) {
            const direction = distance < 0 ? 1 : -1
            onChange((activeIndex + direction + photos.length) % photos.length)
          }

          touchStartX.current = null
        }}
      >
        <img
          key={photo.src}
          src={`${import.meta.env.BASE_URL}${photo.src}`}
          alt={photo.alt}
          className="max-h-[80svh] max-w-full rounded-lg object-contain"
        />
        <figcaption className="text-center text-xs text-white/75">
          {title} · {activeIndex + 1} de {photos.length}
        </figcaption>
        {photos.length > 1 && (
          <div
            className="flex items-center gap-2"
            aria-label="Fotos do produto"
          >
            {photos.map((item, index) => (
              <button
                key={`${item.src}-lightbox`}
                type="button"
                aria-label={`Ver foto ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => onChange(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-2.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </figure>
    </div>
  )
}
