import type { ProductCatalog } from '../types/catalog'
import { catalogRawUrl } from './catalogSource'

const catalogModules = import.meta.glob('../data/catalogs/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ProductCatalog>

export function getCatalog(catalogId: string): ProductCatalog | undefined {
  return catalogModules[`../data/catalogs/${catalogId}.json`]
}

// O painel publica o catálogo em uma branch própria. O JSON embutido no bundle
// continua como reserva se a branch ainda não existir ou estiver indisponível.
export async function fetchCatalog(
  catalogId: string,
): Promise<ProductCatalog | undefined> {
  try {
    const response = await fetch(catalogRawUrl(catalogId), {
      cache: 'no-store',
    })
    if (!response.ok) return undefined

    const data: unknown = await response.json()
    if (!data || typeof data !== 'object') return undefined
    const catalog = data as ProductCatalog
    return Array.isArray(catalog.products) ? catalog : undefined
  } catch {
    return undefined
  }
}
