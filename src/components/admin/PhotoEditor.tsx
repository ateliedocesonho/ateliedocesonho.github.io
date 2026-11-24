import { useEffect, useState } from 'react'
import { ImagePlus, UploadCloud } from 'lucide-react'
import type { PhotoDraft } from '../../types/admin'
import { photoRawUrl, localPhotoUrl } from '../../lib/catalogSource'
import { button, dangerButton, field, fieldLabel, hint } from './ui'

interface PhotoEditorProps {
  photos: PhotoDraft[]
  options: string[]
  productTitle: string
  onChange: (photos: PhotoDraft[]) => void
}

function useObjectUrl(file?: File | null): string | undefined {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!file) {
      setUrl(undefined)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return url
}

interface PhotoRowProps {
  photo: PhotoDraft
  index: number
  options: string[]
  productTitle: string
  onPatch: (patch: Partial<PhotoDraft>) => void
  onRemove: () => void
}

function PhotoRow({
  photo,
  index,
  options,
  productTitle,
  onPatch,
  onRemove,
}: PhotoRowProps) {
  const previewUrl = useObjectUrl(photo.file)
  const [broken, setBroken] = useState(false)
  const publishedSrc = photoRawUrl(photo.src)
  const fallbackSrc = localPhotoUrl(photo.src)
  const [imageSrc, setImageSrc] = useState(publishedSrc)

  useEffect(() => {
    setBroken(false)
    setImageSrc(publishedSrc)
  }, [publishedSrc])

  const displayed = previewUrl || imageSrc

  return (
    <div className="grid gap-3 rounded-2xl border border-[#e9ded6] bg-[#fbf7f2] p-4">
      {photo.src || previewUrl ? (
        <img
          src={
            broken && !previewUrl && imageSrc === publishedSrc
              ? fallbackSrc
              : displayed
          }
          alt=""
          onError={() => {
            if (!previewUrl && imageSrc === publishedSrc) setBroken(true)
          }}
          className="h-36 w-full rounded-xl border border-[#e9ded6] object-cover"
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={fieldLabel}>
          Nome da foto no repositório
          <input
            type="text"
            value={photo.name ?? ''}
            onChange={(event) => onPatch({ name: event.target.value })}
            placeholder="bolo-de-aniversario.jpg"
            className={field}
          />
        </label>
        <label className={fieldLabel}>
          Texto da foto
          <input
            type="text"
            value={photo.alt}
            onChange={(event) => onPatch({ alt: event.target.value })}
            placeholder={`Foto de ${productTitle || 'produto'}`}
            className={field}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`${button} relative cursor-pointer`}
          title="Escolha o arquivo agora; ele só é enviado ao publicar"
        >
          <UploadCloud size={16} />
          Escolher foto
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              if (!file.type.startsWith('image/')) {
                event.target.value = ''
                return
              }
              onPatch({
                file,
                name: photo.name || file.name,
                src: '',
              })
              event.target.value = ''
            }}
          />
        </label>

        <select
          aria-label={`Usar foto existente ${index + 1}`}
          value={photo.file ? '' : photo.src}
          onChange={(event) => {
            if (!event.target.value) return
            onPatch({
              src: event.target.value,
              file: undefined,
              name: undefined,
            })
          }}
          className={`${field} min-w-52 flex-1`}
        >
          <option value="">Usar foto que já existe...</option>
          {options.map((src) => (
            <option key={src} value={src}>
              {src.replace(/^products\//, '')}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRemove}
          className={dangerButton}
          aria-label={`Remover foto ${index + 1}`}
        >
          ×
        </button>
      </div>

      {photo.file ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-vinho">
          <ImagePlus size={14} />
          Foto pronta: será enviada quando você publicar.
        </p>
      ) : (
        <p className={hint}>
          O arquivo escolhido fica só no celular até o botão Publicar.
        </p>
      )}
    </div>
  )
}

export function PhotoEditor({
  photos,
  options,
  productTitle,
  onChange,
}: PhotoEditorProps) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-lg text-[#3d2c2c]">Fotos</h4>
          <p className={hint}>
            Escolha o arquivo e dê um nome bonito. Nada é enviado antes de
            publicar.
          </p>
        </div>
        <button
          type="button"
          className={button}
          onClick={() => onChange([...photos, { src: '', alt: '' }])}
        >
          + Foto
        </button>
      </div>

      {photos.map((photo, index) => (
        <PhotoRow
          key={index}
          photo={photo}
          index={index}
          options={options}
          productTitle={productTitle}
          onPatch={(patch) =>
            onChange(
              photos.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...patch } : item,
              ),
            )
          }
          onRemove={() =>
            onChange(photos.filter((_, itemIndex) => itemIndex !== index))
          }
        />
      ))}
    </section>
  )
}
