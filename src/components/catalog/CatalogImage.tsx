import { useEffect, useState } from 'react'
import type { ImgHTMLAttributes } from 'react'
import { localPhotoUrl, photoRawUrl } from '../../lib/catalogSource'

type CatalogImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string
}

// Tenta a foto na branch de dados (onde o painel sobe arquivos novos) e, se
// ela não existir lá, usa a foto publicada junto com o site.
export function CatalogImage({ src, ...props }: CatalogImageProps) {
  const localSrc = localPhotoUrl(src)
  const [currentSrc, setCurrentSrc] = useState(() => photoRawUrl(src))

  useEffect(() => {
    setCurrentSrc(photoRawUrl(src))
  }, [src])

  return (
    <img
      {...props}
      src={currentSrc}
      onError={() =>
        setCurrentSrc((value) => (value === localSrc ? value : localSrc))
      }
    />
  )
}
