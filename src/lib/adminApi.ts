import type { ProductCatalog } from '../types/catalog'
import { CATALOG_PATH, DATA_BRANCH, PHOTOS_DIR, REPO } from './catalogSource'

const API = 'https://api.github.com'
const TOKEN_KEY = 'ateliedocesonho.admin.token'

export class GithubError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function readToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function describeError(error: unknown): string {
  if (error instanceof GithubError) {
    if (error.status === 401) {
      return 'Token inválido ou expirado. Crie outro e entre de novo.'
    }
    if (error.status === 403) {
      return 'Sem permissão. Confira se o token tem Contents = Read and write neste repositório.'
    }
    if (error.status === 404) {
      return 'Arquivo ou repositório não encontrado com este token.'
    }
    if (error.status === 422 && /already exists/i.test(error.message)) {
      return 'Um arquivo com esse nome já existe. Escolha outro nome.'
    }
    return `GitHub respondeu ${error.status}: ${error.message}`
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir.'
}

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API}/${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data: unknown = await response.json()
      if (data && typeof data === 'object' && 'message' in data) {
        message = String((data as { message: unknown }).message)
      }
    } catch {
      // mantém o statusText
    }
    throw new GithubError(response.status, message)
  }

  return (await response.json()) as T
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function decodeBase64(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''))
  return new TextDecoder().decode(
    Uint8Array.from(binary, (char) => char.charCodeAt(0)),
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(new Error('Não foi possível ler a foto.'))
    reader.readAsDataURL(file)
  })
}

function catalogText(catalog: ProductCatalog): string {
  return `${JSON.stringify(catalog, null, 2)}\n`
}

// A branch de dados é órfã: o primeiro commit traz somente o catálogo inicial,
// sem copiar o código da `main` (uma árvore vazia é rejeitada pela API).
export async function ensureDataBranch(
  token: string,
  initialCatalog: ProductCatalog,
): Promise<void> {
  try {
    await request(`repos/${REPO}/branches/${DATA_BRANCH}`, token)
    return
  } catch (error) {
    if (!(error instanceof GithubError && error.status === 404)) throw error
  }

  const tree = await request<{ sha: string }>(
    `repos/${REPO}/git/trees`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        tree: [
          {
            path: CATALOG_PATH,
            mode: '100644',
            type: 'blob',
            content: catalogText(initialCatalog),
          },
        ],
      }),
    },
  )
  const commit = await request<{ sha: string }>(
    `repos/${REPO}/git/commits`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        message: 'content: cria branch de dados com catálogo inicial',
        tree: tree.sha,
        parents: [],
      }),
    },
  )
  await request(`repos/${REPO}/git/refs`, token, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${DATA_BRANCH}`,
      sha: commit.sha,
    }),
  })
}

interface ContentResponse {
  content: string
  sha: string
}

export async function loadCatalog(
  token: string,
): Promise<{ catalog: ProductCatalog; sha: string } | null> {
  try {
    const data = await request<ContentResponse>(
      `repos/${REPO}/contents/${CATALOG_PATH}?ref=${DATA_BRANCH}`,
      token,
    )
    return { catalog: JSON.parse(decodeBase64(data.content)), sha: data.sha }
  } catch (error) {
    if (error instanceof GithubError && error.status === 404) return null
    throw error
  }
}

export async function writeCatalog(
  token: string,
  catalog: ProductCatalog,
  sha?: string,
): Promise<string> {
  const data = await request<{ content: ContentResponse }>(
    `repos/${REPO}/contents/${CATALOG_PATH}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: sha
          ? 'content: atualiza catálogo pelo painel'
          : 'content: cria catálogo no branch de dados',
        content: bytesToBase64(new TextEncoder().encode(catalogText(catalog))),
        branch: DATA_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    },
  )
  return data.content.sha
}

export async function listPhotos(token: string): Promise<string[]> {
  try {
    const files = await request<Array<{ name: string; type: string }>>(
      `repos/${REPO}/contents/${PHOTOS_DIR}?ref=${DATA_BRANCH}`,
      token,
    )
    return files
      .filter((file) => file.type === 'file')
      .map((file) => `${PHOTOS_DIR}/${file.name}`)
  } catch (error) {
    if (error instanceof GithubError && error.status === 404) return []
    throw error
  }
}

export async function uploadPhoto(
  token: string,
  name: string,
  file: File,
): Promise<void> {
  try {
    await request(`repos/${REPO}/contents/${PHOTOS_DIR}/${name}`, token, {
      method: 'PUT',
      body: JSON.stringify({
        message: `content: adiciona foto ${name} pelo painel`,
        content: await fileToBase64(file),
        branch: DATA_BRANCH,
      }),
    })
  } catch (error) {
    // Em uma nova tentativa o arquivo pode já ter sido enviado.
    if (
      error instanceof GithubError &&
      error.status === 422 &&
      /already exists/i.test(error.message)
    ) {
      return
    }
    throw error
  }
}
