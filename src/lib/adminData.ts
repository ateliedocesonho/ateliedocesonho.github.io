import type { ProductCatalog } from '../types/catalog'
import type { ProductDraft } from '../types/admin'

export function buildCatalog(
  source: ProductCatalog,
  products: ProductDraft[],
): ProductCatalog {
  return {
    id: source.id,
    title: source.title.trim(),
    subtitle: source.subtitle.trim(),
    products: products.map(normalizeProduct),
  }
}

function normalizeProduct(product: ProductDraft) {
  const result: Record<string, unknown> = { ...product }
  delete result.file
  delete result.name

  result.id = String(product.id || '').trim()
  result.category = String(product.category || '').trim()
  result.title = String(product.title || '').trim()
  result.description = String(product.description || '').trim()
  result.tag = String(product.tag || '').trim()
  result.options = product.options.map((option) => {
    const normalized: Record<string, unknown> = {
      name: String(option.name || '').trim(),
      price:
        option.price === null || option.price === undefined
          ? null
          : Number(option.price),
    }
    if (option.maxFlavors !== undefined && Number.isFinite(option.maxFlavors)) {
      normalized.maxFlavors = Number(option.maxFlavors)
    }
    return normalized
  })

  const flavors = (product.flavors || [])
    .map((flavor) => String(flavor).trim())
    .filter(Boolean)
  if (flavors.length > 0) {
    result.flavors = flavors
    result.flavorSelection =
      product.flavorSelection === 'multiple' ? 'multiple' : 'single'
  } else {
    delete result.flavors
    delete result.flavorSelection
  }

  result.images = product.images.map((image) => ({
    src: String(image.src || '').trim(),
    alt: String(image.alt || '').trim(),
  }))
  result.soldOut = Boolean(product.soldOut)
  return result as unknown as ProductDraft
}

export function validateCatalog(catalog: ProductCatalog): string[] {
  const errors: string[] = []
  if (!catalog.title) errors.push('Informe o título do catálogo.')

  const ids = new Set<string>()
  catalog.products.forEach((product, index) => {
    const label = product.title || `produto ${index + 1}`

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) {
      errors.push(
        `O endereço do "${label}" deve ter só letras minúsculas, números e hífens.`,
      )
    }
    if (ids.has(product.id)) {
      errors.push(`O endereço "${product.id}" está repetido.`)
    }
    ids.add(product.id)

    if (!product.title) errors.push(`Dê um nome ao produto ${index + 1}.`)

    if (product.options.length === 0) {
      errors.push(`"${label}" precisa de pelo menos uma apresentação.`)
    }
    product.options.forEach((option, optionIndex) => {
      if (!option.name) {
        errors.push(
          `Informe o nome da apresentação ${optionIndex + 1} de "${label}".`,
        )
      }
      if (
        option.price !== null &&
        (!Number.isFinite(option.price) || option.price < 0)
      ) {
        errors.push(
          `Confira o preço da apresentação ${optionIndex + 1} de "${label}".`,
        )
      }
      if (
        option.maxFlavors !== undefined &&
        (!Number.isInteger(option.maxFlavors) || option.maxFlavors < 1)
      ) {
        errors.push(`Confira o máximo de sabores de "${label}".`)
      }
    })

    if (product.images.length === 0) {
      errors.push(`"${label}" precisa de pelo menos uma foto.`)
    }
    product.images.forEach((image, imageIndex) => {
      if (
        !/^[a-zA-Z0-9._/-]+$/.test(image.src) ||
        image.src.startsWith('/') ||
        image.src.includes('..')
      ) {
        errors.push(
          `Confira o caminho da foto ${imageIndex + 1} de "${label}".`,
        )
      }
      if (!image.alt) {
        errors.push(`Descreva a foto ${imageIndex + 1} de "${label}".`)
      }
    })

    if (
      product.flavors &&
      new Set(product.flavors).size !== product.flavors.length
    ) {
      errors.push(`"${label}" tem sabores repetidos.`)
    }
  })
  return errors
}

export function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'produto'
  )
}

export function uniqueProductId(
  products: ProductDraft[],
  title: string,
): string {
  const used = new Set(products.map((product) => product.id))
  const base = slugify(title)
  let candidate = base
  let number = 2
  while (used.has(candidate)) candidate = `${base}-${number++}`
  return candidate
}

export function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
  return cleaned || 'foto.jpg'
}

export function uniquePhotoName(used: string[], name: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const extension = dot > 0 ? name.slice(dot) : ''
  let candidate = `${base}${extension}`
  let number = 2
  while (used.includes(candidate)) candidate = `${base}-${number++}${extension}`
  return candidate
}

export function priceLabel(price: number | null): string {
  return price === null
    ? 'Sob consulta'
    : `R$ ${String(price).replace('.', ',')}`
}

export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}
