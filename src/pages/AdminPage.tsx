import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { ProductEditor } from '../components/admin/ProductEditor'
import { TokenGate } from '../components/admin/TokenGate'
import {
  button,
  card,
  ghostButton,
  hint,
  primaryButton,
} from '../components/admin/ui'
import {
  clearToken,
  describeError,
  ensureDataBranch,
  listPhotos,
  loadCatalog,
  readToken,
  saveToken,
  uploadPhoto,
  writeCatalog,
} from '../lib/adminApi'
import {
  buildCatalog,
  sanitizeFileName,
  unique,
  uniquePhotoName,
  uniqueProductId,
  validateCatalog,
} from '../lib/adminData'
import { getCatalog } from '../lib/catalogs'
import { CATALOG_ID, PHOTOS_DIR } from '../lib/catalogSource'
import type { ProductDraft } from '../types/admin'
import type { ProductCatalog } from '../types/catalog'

type Notice = { text: string; type: 'success' | 'error' | 'info' }

interface LoadedCatalog {
  catalog: ProductCatalog
  sha: string
}

interface PendingUpload {
  productIndex: number
  photoIndex: number
  name: string
  src: string
  file: File
}

function toDrafts(catalog: ProductCatalog): ProductDraft[] {
  return catalog.products.map((product) => ({
    ...product,
    images: product.images.map((image) => ({ ...image })),
  }))
}

function photoNamesFrom(catalog: ProductCatalog): string[] {
  return catalog.products.flatMap((product) =>
    product.images.map((image) => image.src),
  )
}

export function AdminPage() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'login' | 'ready'>('login')
  const [authError, setAuthError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const [catalog, setCatalog] = useState<ProductCatalog | null>(null)
  const [products, setProducts] = useState<ProductDraft[]>([])
  const [sha, setSha] = useState('')
  const [savedSnapshot, setSavedSnapshot] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [openIndex, setOpenIndex] = useState(-1)

  const dirty = useMemo(() => {
    if (!catalog) return false
    return JSON.stringify(buildCatalog(catalog, products)) !== savedSnapshot
  }, [catalog, products, savedSnapshot])

  const jsonPreview = useMemo(
    () =>
      catalog ? JSON.stringify(buildCatalog(catalog, products), null, 2) : '',
    [catalog, products],
  )

  async function applyLoaded(value: string, loaded: LoadedCatalog) {
    const drafts = toDrafts(loaded.catalog)
    const remotePhotos = await listPhotos(value)
    const embeddedPhotos = photoNamesFrom(
      getCatalog(CATALOG_ID) || loaded.catalog,
    )

    setCatalog(loaded.catalog)
    setProducts(drafts)
    setSha(loaded.sha)
    setSavedSnapshot(JSON.stringify(buildCatalog(loaded.catalog, drafts)))
    setPhotos(unique([...embeddedPhotos, ...remotePhotos]))
    setOpenIndex(-1)
    setNotice(null)
    setStatus('ready')
  }

  async function enter(value: string) {
    setAuthError('')
    setBusy(true)
    try {
      const bundled = getCatalog(CATALOG_ID)
      if (!bundled) throw new Error('Catálogo base não encontrado no projeto.')

      await ensureDataBranch(value, bundled)
      let loaded = await loadCatalog(value)
      if (!loaded) {
        loaded = { catalog: bundled, sha: await writeCatalog(value, bundled) }
      }
      await applyLoaded(value, loaded)
      saveToken(value)
      setToken(value)
    } catch (error) {
      clearToken()
      setToken('')
      setStatus('login')
      setAuthError(describeError(error))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const saved = readToken()
    if (saved) void enter(saved)
  }, [])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function patchProduct(
    index: number,
    updater: (product: ProductDraft) => ProductDraft,
  ) {
    setProducts((current) =>
      current.map((product, productIndex) =>
        productIndex === index ? updater(product) : product,
      ),
    )
  }

  function addProduct() {
    const title = 'Novo produto'
    const product: ProductDraft = {
      id: uniqueProductId(products, title),
      category: 'Nova categoria',
      title,
      description: '',
      tag: '',
      options: [{ name: 'Apresentação', price: 0 }],
      images: [{ src: '', alt: '' }],
      soldOut: false,
    }
    setProducts((current) => [...current, product])
    setOpenIndex(products.length)
  }

  async function publish() {
    if (!catalog || !token) return

    const usedNames = photos.map((src) => src.replace(/^products\//, ''))
    const uploads: PendingUpload[] = []

    const nextProducts = products.map((product, productIndex) => ({
      ...product,
      images: product.images.map((image, photoIndex) => {
        if (!image.file) return { src: image.src, alt: image.alt }
        const name = uniquePhotoName(
          usedNames,
          sanitizeFileName(image.name || image.file.name),
        )
        usedNames.push(name)
        uploads.push({
          productIndex,
          photoIndex,
          name,
          src: `${PHOTOS_DIR}/${name}`,
          file: image.file,
        })
        return { src: `${PHOTOS_DIR}/${name}`, alt: image.alt }
      }),
    }))

    const nextCatalog = buildCatalog(catalog, nextProducts)
    const errors = validateCatalog(nextCatalog)
    if (errors.length) {
      setNotice({
        text: `Corrija antes de publicar: ${errors.slice(0, 4).join(' ')}`,
        type: 'error',
      })
      return
    }

    const oversized = uploads.find(
      (upload) => upload.file.size > 5 * 1024 * 1024,
    )
    if (oversized) {
      setNotice({
        text: `A foto "${oversized.name}" passa de 5 MB. Escolha um arquivo menor.`,
        type: 'error',
      })
      return
    }

    if (
      !confirm(
        'Publicar as alterações no branch de dados? O catálogo do site será atualizado.',
      )
    ) {
      return
    }

    setBusy(true)
    try {
      for (const [index, upload] of uploads.entries()) {
        setNotice({
          text: `Enviando foto ${index + 1} de ${uploads.length}...`,
          type: 'info',
        })
        await uploadPhoto(token, upload.name, upload.file)
        setPhotos((current) => unique([...current, upload.src]))
      }

      // Já marca as fotos como enviadas no rascunho para não reenviar em uma retry.
      setProducts(nextProducts)
      setNotice({ text: 'Salvando catálogo...', type: 'info' })
      const newSha = await writeCatalog(token, nextCatalog, sha)

      setCatalog(nextCatalog)
      setSha(newSha)
      setSavedSnapshot(JSON.stringify(nextCatalog))
      setNotice({
        text: 'Publicado! As alterações já aparecem no catálogo da loja.',
        type: 'success',
      })
    } catch (error) {
      setNotice({ text: describeError(error), type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  async function reload() {
    if (!token) return
    if (dirty && !confirm('Descartar as alterações e recarregar do GitHub?'))
      return

    setBusy(true)
    try {
      const loaded = await loadCatalog(token)
      if (!loaded)
        throw new Error('Catálogo não encontrado no branch de dados.')
      await applyLoaded(token, loaded)
      setNotice({ text: 'Dados recarregados.', type: 'success' })
    } catch (error) {
      setNotice({ text: describeError(error), type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    clearToken()
    setToken('')
    setStatus('login')
    setCatalog(null)
    setProducts([])
    setSha('')
    setSavedSnapshot('')
    setPhotos([])
    setOpenIndex(-1)
    setNotice(null)
    setAuthError('')
  }

  if (status !== 'ready' || !catalog) {
    return (
      <TokenGate
        onSubmit={(value) => void enter(value)}
        error={authError}
        busy={busy}
      />
    )
  }

  return (
    <div className="min-h-screen bg-creme text-[#3d2c2c]">
      <header className="sticky top-0 z-20 border-b border-[#e9ded6] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-vinho">
              Ateliê Doce Sonho
            </p>
            <h1 className="font-display text-2xl text-[#3d2c2c]">
              Painel de encomendas
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#/encomendas"
              target="_blank"
              rel="noopener"
              className={ghostButton}
            >
              Ver catálogo <ExternalLink size={15} />
            </a>
            <button
              type="button"
              onClick={logout}
              className={ghostButton}
              disabled={busy}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`fixed inset-x-4 bottom-28 z-30 mx-auto flex max-w-2xl items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${
            notice.type === 'success'
              ? 'bg-[#e7f2e8] text-[#3f6b45]'
              : notice.type === 'error'
                ? 'bg-[#fbecec] text-[#a32727]'
                : 'bg-[#f6f0ea] text-[#3d2c2c]'
          }`}
        >
          <span className="flex-1 leading-relaxed">{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Fechar aviso"
            className="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none opacity-70 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <main className="mx-auto grid max-w-4xl gap-5 px-4 pb-32 pt-6">
        <section className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Produtos</h2>
              <p className={`${hint} mt-1`}>
                A ordem aqui é a ordem em que os produtos aparecem no catálogo.
              </p>
            </div>
            <button
              type="button"
              onClick={addProduct}
              className={button}
              disabled={busy}
            >
              + Adicionar produto
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {products.length === 0 ? (
              <p className={hint}>
                Nenhum produto. Clique em Adicionar produto.
              </p>
            ) : (
              products.map((product, index) => (
                <ProductEditor
                  key={product.id}
                  product={product}
                  index={index}
                  total={products.length}
                  open={openIndex === index}
                  photoOptions={photos}
                  onToggle={() =>
                    setOpenIndex(openIndex === index ? -1 : index)
                  }
                  onMove={(direction) => {
                    const target = index + direction
                    if (target < 0 || target >= products.length) return
                    const reordered = [...products]
                    ;[reordered[index], reordered[target]] = [
                      reordered[target],
                      reordered[index],
                    ]
                    setProducts(reordered)
                    setOpenIndex(target)
                  }}
                  onDuplicate={() => {
                    const copy: ProductDraft = {
                      ...product,
                      id: uniqueProductId(products, `${product.title}-copia`),
                      title: `${product.title} (cópia)`,
                      images: product.images.map((image) => ({ ...image })),
                      options: product.options.map((option) => ({ ...option })),
                    }
                    setProducts((current) => [
                      ...current.slice(0, index + 1),
                      copy,
                      ...current.slice(index + 1),
                    ])
                    setOpenIndex(index + 1)
                  }}
                  onDelete={() => {
                    if (!confirm(`Excluir "${product.title}" do catálogo?`))
                      return
                    setProducts((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                    setOpenIndex(-1)
                  }}
                  onPatch={(updater) => patchProduct(index, updater)}
                />
              ))
            )}
          </div>
        </section>

        <details className={card}>
          <summary className="min-h-11 cursor-pointer font-semibold text-vinho">
            Ver JSON gerado
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-[#f6f0ea] p-4 text-xs">
            {jsonPreview}
          </pre>
        </details>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e9ded6] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <span
            className={`text-sm ${dirty ? 'font-semibold text-vinho' : hint}`}
          >
            {dirty ? 'Você tem alterações não publicadas' : 'Tudo publicado'}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              className={ghostButton}
              disabled={busy}
            >
              <RefreshCw size={15} /> Recarregar
            </button>
            <button
              type="button"
              onClick={() => void publish()}
              className={primaryButton}
              disabled={busy || !dirty}
            >
              Publicar alterações
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
