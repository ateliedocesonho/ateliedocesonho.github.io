import { useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { button, card, field, fieldLabel, hint, primaryButton } from './ui'

interface TokenGateProps {
  onSubmit: (token: string) => void
  error: string
  busy: boolean
}

export function TokenGate({ onSubmit, error, busy }: TokenGateProps) {
  const [token, setToken] = useState('')
  const [visible, setVisible] = useState(false)

  return (
    <main className="flex min-h-screen items-center justify-center bg-creme px-4 py-10">
      <section className={`${card} w-full max-w-lg`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-vinho">
          Ateliê Doce Sonho
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#3d2c2c]">
          Painel de encomendas
        </h1>
        <p className={`${hint} mt-3 text-sm`}>
          Mude produtos, preços, sabores e fotos do catálogo sem precisar mexer
          no código.
        </p>

        <form
          className="mt-7 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (token.trim()) onSubmit(token.trim())
          }}
        >
          <label className={fieldLabel}>
            Token do GitHub
            <input
              type={visible ? 'text' : 'password'}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="github_pat_..."
              autoComplete="off"
              spellCheck={false}
              required
              className={field}
            />
            <span className={`${hint} font-normal`}>
              Fica guardado só neste navegador. Nunca vai para o repositório.
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm text-[#3d2c2c]">
            <input
              type="checkbox"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
              className="h-5 w-5 accent-vinho"
            />
            Mostrar token
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-[#fbecec] px-4 py-3 text-sm text-[#a32727]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !token.trim()}
            className={primaryButton}
          >
            <LockKeyhole size={16} />
            {busy ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <details className="mt-7 border-t border-[#e9ded6] pt-4">
          <summary className="min-h-11 cursor-pointer font-semibold text-vinho">
            Como criar o token (só uma vez)
          </summary>
          <ol className="ml-5 mt-3 grid list-decimal gap-2 text-sm leading-relaxed text-[#3d2c2c]">
            <li>Entre no GitHub com a conta dona do site.</li>
            <li>
              Foto do perfil → <strong>Settings</strong> →{' '}
              <strong>Developer settings</strong>.
            </li>
            <li>
              <strong>Personal access tokens → Tokens (fine-grained)</strong> →{' '}
              <strong>Generate new token</strong>.
            </li>
            <li>
              Nome: <em>Painel Ateliê</em>. Em <em>Repository access</em>,
              marque somente <strong>ateliedocesonho.github.io</strong>.
            </li>
            <li>
              Em <em>Repository permissions</em>, defina{' '}
              <strong>Contents = Read and write</strong>.
            </li>
            <li>Gere o token e cole aqui.</li>
          </ol>
          <p className={`${hint} mt-3`}>
            O painel cria a branch de dados automaticamente no primeiro acesso.
          </p>
        </details>

        <button
          type="button"
          onClick={() => (window.location.hash = '#/')}
          className={`${button} mt-5 w-full`}
        >
          Voltar para a loja
        </button>
      </section>
    </main>
  )
}
