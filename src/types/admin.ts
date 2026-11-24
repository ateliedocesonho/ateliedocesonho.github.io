import type { Product, ProductPhoto } from './catalog'

// Foto em edição: `file` existe só no navegador e é enviada no publish.
export interface PhotoDraft extends ProductPhoto {
  name?: string
  file?: File | null
}

export type ProductDraft = Omit<Product, 'images'> & { images: PhotoDraft[] }
