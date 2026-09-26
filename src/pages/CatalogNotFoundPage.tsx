import { Link } from 'react-router-dom'

export function CatalogNotFoundPage() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-[#fbf8f3] px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a84d53]">
        Catálogo não encontrado
      </p>
      <h1 className="serif mt-3 text-4xl text-[#541720]">
        Vamos voltar ao começo?
      </h1>
      <Link
        to="/"
        className="mt-6 rounded-full bg-[#781f2b] px-6 py-3 text-sm font-semibold text-white"
      >
        Voltar ao início
      </Link>
    </main>
  )
}
