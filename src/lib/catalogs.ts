import type { ProductCatalog } from '../types/catalog'

const catalogModules = import.meta.glob('../data/catalogs/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ProductCatalog>

export function getCatalog(catalogId: string): ProductCatalog | undefined {
  return catalogModules[`../data/catalogs/${catalogId}.json`]
}
