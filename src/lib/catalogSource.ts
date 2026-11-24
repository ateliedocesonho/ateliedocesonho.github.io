// Fonte única das edições feitas no painel. A branch `database` funciona como
// "banco de dados": o site lê daqui e o painel escreve aqui. `main` e
// `gh-pages` não são tocados pelo painel.
export const REPO = 'ateliedocesonho/ateliedocesonho.github.io'
export const DATA_BRANCH = 'database'
export const CATALOG_ID = 'encomendas'
export const CATALOG_PATH = `catalogs/${CATALOG_ID}.json`
export const PHOTOS_DIR = 'products'

const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${DATA_BRANCH}`

export function catalogRawUrl(catalogId: string): string {
  return `${RAW_BASE}/catalogs/${catalogId}.json?t=${Date.now()}`
}

export function photoRawUrl(src: string): string {
  return `${RAW_BASE}/${src.replace(/^\/+/, '')}`
}

export function localPhotoUrl(src: string): string {
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`
}
