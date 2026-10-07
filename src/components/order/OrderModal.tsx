import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MapPin,
  Send,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { formatDate, formatPrice } from '../../lib/format'
import type { OrderLine, Product, StoreSettings } from '../../types/catalog'
import { Toast } from '../Toast'
import { ChoicePicker } from './ChoicePicker'
import { DateTimePicker } from './DateTimePicker'
import { FlavorPicker } from './FlavorPicker'

interface OrderModalProps {
  initialProduct: Product
  initialFlavors?: string[]
  lines: OrderLine[]
  onLinesChange: (lines: OrderLine[]) => void
  onAddToCart: () => void
  cartView?: boolean
  store: StoreSettings
  onClose: () => void
}

const stepTitles = [
  'O que vamos preparar?',
  'Quando você precisa?',
  'Revise sua encomenda',
]

export function OrderModal({
  initialProduct,
  initialFlavors,
  lines,
  onLinesChange,
  onAddToCart,
  cartView = false,
  store,
  onClose,
}: OrderModalProps) {
  const [step, setStep] = useState(1)
  const [openPicker, setOpenPicker] = useState<'option' | null>(null)
  const product = initialProduct
  const [optionName, setOptionName] = useState(
    initialProduct.options[0]?.name ?? '',
  )
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(
    initialFlavors ??
      (initialProduct.flavors?.[0] ? [initialProduct.flavors[0]] : []),
  )
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [toast, setToast] = useState<{
    message: string
    variant: 'error' | 'success'
  } | null>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const setOptionPickerOpen = useCallback((open: boolean) => {
    setOpenPicker(open ? 'option' : null)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 3800)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const option =
    product.options.find((item) => item.name === optionName) ??
    product.options[0]
  const minimumDate = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 10)

  const optionChoices = product.options.map((item) => ({
    id: item.name,
    label: item.name,
    description: formatPrice(item.price),
  }))

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    document.body.style.overflow = 'hidden'
    dialogRef.current
      ?.querySelector<HTMLElement>('button:not([disabled])')
      ?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
        ),
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement?.focus()
    }
  }, [onClose])

  function getCurrentLine(): OrderLine | null {
    if (product.soldOut) {
      setToast({
        message: 'Este produto está esgotado. Escolha outro para continuar.',
        variant: 'error',
      })
      return null
    }
    if (!option) {
      setToast({
        message: 'Escolha uma opção para este produto.',
        variant: 'error',
      })
      return null
    }
    if (product.flavors?.length && selectedFlavors.length === 0) {
      setToast({
        message: 'Escolha pelo menos um sabor para este produto.',
        variant: 'error',
      })
      return null
    }
    if (
      option.maxFlavors &&
      selectedFlavors.length > option.maxFlavors
    ) {
      setToast({
        message: `Escolha no máximo ${option.maxFlavors} sabores para esta opção.`,
        variant: 'error',
      })
      return null
    }

    return { product, option, flavors: selectedFlavors, quantity: 1 }
  }

  function addLine(lineToAdd: OrderLine) {
    const matchingLine = lines.findIndex(
        (line) =>
          line.product.id === lineToAdd.product.id &&
          line.option.name === lineToAdd.option.name &&
          line.flavors.join('|') === lineToAdd.flavors.join('|'),
    )
    const nextLines = matchingLine === -1
      ? [...lines, lineToAdd]
      : lines.map((line, index) => index === matchingLine
          ? { ...line, quantity: line.quantity + lineToAdd.quantity }
          : line)
    onLinesChange(nextLines)
  }

  function addCurrentToCart() {
    const selectedLine = getCurrentLine()
    if (!selectedLine) return
    addLine(selectedLine)
    onAddToCart()
    onClose()
  }

  function removeLine(indexToRemove: number) {
    onLinesChange(lines.filter((_, index) => index !== indexToRemove))
  }

  function lineTotal(line: OrderLine) {
    if (line.option.price === null) return 'a confirmar'
    return formatPrice(line.option.price * line.quantity)
  }

  const total = lines.reduce<number | null>((sum, line) => {
    if (sum === null || line.option.price === null) return null
    return sum + line.option.price * line.quantity
  }, 0)

  function continueStep() {
    if (step === 1 && cartView && lines.length === 0) {
      setToast({ message: 'Seu carrinho está vazio.', variant: 'error' })
      return
    }
    if (step === 1 && !cartView) {
      const selectedLine = getCurrentLine()
      if (!selectedLine) return
      addLine(selectedLine)
    }
    if (step === 2 && (!date || !time)) {
      setToast({
        message: 'Escolha a data e o horário que prefere.',
        variant: 'error',
      })
      return
    }
    if (step === 2 && date < minimumDate) {
      setToast({
        message: 'A data precisa ser hoje ou uma data futura.',
        variant: 'error',
      })
      return
    }
    setToast(null)
    setStep((currentStep) => currentStep + 1)
  }

  function sendOrder() {
    const orderText = [
      `Oi, ${store.name}! Vim pelo site e gostaria de solicitar uma encomenda 😊`,
      '',
      '🍰 *Meu pedido*',
      ...lines.map(
        (line) =>
          `• ${line.quantity} × ${line.product.title} — ${line.option.name}${line.flavors.length ? ` — Sabores: ${line.flavors.join(', ')}` : ''} — ${lineTotal(line)}`,
      ),
      `*Total estimado: ${total === null ? 'a confirmar pelo ateliê' : formatPrice(total)}*`,
      '',
      `📅 *Retirada desejada:* ${formatDate(date)} às ${time}`,
      '',
      `Sei que a reserva é confirmada com ${store.depositPercent}% de sinal. Por favor, confirme a disponibilidade da data e as instruções de pagamento. Obrigada!`,
    ]

    window.open(
      `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(orderText.join('\n'))}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#281817]/55 px-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        ref={dialogRef}
        className="modal-in flex max-h-[94svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[26px] bg-[#fbf8f3] shadow-2xl sm:rounded-[24px]"
      >
        <header className="shrink-0 border-b border-[#eee3da] px-5 pb-4 pt-4 sm:px-7 sm:pt-5">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#ddcfc6] sm:hidden" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a84d53]">
                Sua encomenda · etapa {step} de 3
              </p>
              <h2
                id="order-title"
                className="serif mt-1 text-[25px] text-[#541720]"
              >
                {cartView && step === 1 ? 'Seu carrinho' : stepTitles[step - 1]}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#806e69]"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className={`h-1 flex-1 rounded-full ${
                  number <= step ? 'bg-[#781f2b]' : 'bg-[#e7dbd2]'
                }`}
              />
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7">
          {step === 1 && (
            <div className="space-y-4">
              {!cartView && (
                <>
                  <p className="rounded-xl bg-[#f2e9e0] px-3.5 py-3 text-sm font-semibold text-[#541720]">
                    {product.title}
                  </p>

                  <ChoicePicker
                    label="Tamanho ou apresentação"
                    value={optionName}
                    choices={optionChoices}
                    open={openPicker === 'option'}
                    onOpenChange={setOptionPickerOpen}
                    onChange={(nextOption) => {
                      setOptionName(nextOption)
                      const nextMaxFlavors = product.options.find(
                        (item) => item.name === nextOption,
                      )?.maxFlavors
                      if (nextMaxFlavors) {
                        setSelectedFlavors((current) =>
                          current.slice(0, nextMaxFlavors),
                        )
                      }
                      setToast(null)
                    }}
                  />

                  {product.flavors && (
                    <FlavorPicker
                      flavors={product.flavors}
                      value={selectedFlavors}
                      selectionMode={product.flavorSelection ?? 'single'}
                      maxFlavors={option?.maxFlavors}
                      disabled={product.soldOut}
                      onChange={(nextFlavors) => {
                        setSelectedFlavors(nextFlavors)
                        setToast(null)
                      }}
                    />
                  )}

                  {product.soldOut && (
                    <p className="rounded-xl bg-[#fae8e6] px-3.5 py-3 text-xs font-semibold text-[#9a3035]">
                      Este produto está esgotado no momento.
                    </p>
                  )}
                </>
              )}

              {cartView && lines.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-[#eaded4] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#541720]">
                      {cartView ? 'Itens do carrinho' : 'No carrinho'}
                    </p>
                    <span className="rounded-full bg-[#f8efec] px-2.5 py-1 text-[11px] font-semibold text-[#781f2b]">
                      {lines.reduce((count, line) => count + line.quantity, 0)}{' '}
                      {lines.reduce((count, line) => count + line.quantity, 0) ===
                      1
                        ? 'item'
                        : 'itens'}
                    </span>
                  </div>
                  <div className="divide-y divide-[#f0e7e1]">
                    {lines.map((line, index) => (
                      <div
                        key={`${line.product.id}-${line.option.name}-${line.flavors.join('|')}`}
                        className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug text-[#541720]">
                            {line.quantity > 1 && `${line.quantity} × `}
                            {line.product.title}
                          </span>
                          <span className="mt-1 block text-xs text-[#806e69]">
                            {line.option.name}
                            {line.flavors.length > 0 &&
                              ` · ${line.flavors.join(', ')}`}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-[#781f2b]">
                          {lineTotal(line)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          aria-label={`Remover ${line.product.title} do carrinho`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#a7807c] transition hover:bg-[#fae8e6] hover:text-[#9a3035]"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#eee3da] pt-3 text-sm">
                    <span className="font-semibold text-[#654f4a]">Subtotal estimado</span>
                    <b className="text-[#541720]">
                      {total === null ? 'a confirmar' : formatPrice(total)}
                    </b>
                  </div>
                </div>
              )}

              {cartView && lines.length > 0 && (
                <div className="-mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onLinesChange([])}
                    className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[#927e78] transition hover:bg-[#fae8e6] hover:text-[#9a3035]"
                  >
                    <Trash2 size={13} /> Limpar carrinho
                  </button>
                </div>
              )}

              {!cartView && (
                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#927e78]">
                  <Sparkles
                    size={13}
                    className="mt-0.5 shrink-0 text-[#a84d53]"
                  />
                  Você pode adicionar vários produtos. Os sabores são escolhidos
                  separadamente para cada item.
                </p>
              )}
              {cartView && lines.length === 0 && (
                <p className="rounded-xl bg-white p-4 text-sm text-[#806e69]">
                  Seu carrinho está vazio.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-[#806e69]">
                Selecione a data e o horário que prefere. O ateliê confirma a
                disponibilidade pelo WhatsApp.
              </p>
              <DateTimePicker
                minimumDate={minimumDate}
                date={date}
                time={time}
                onDateChange={setDate}
                onTimeChange={setTime}
              />
              <div className="rounded-xl border border-[#eaded4] bg-white p-3.5">
                <p className="flex items-center gap-2 text-xs font-semibold text-[#654f4a]">
                  <MapPin size={14} className="text-[#9c4b50]" /> Retirada no
                  local
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#927e78]">
                  Também pode solicitar um Uber Flash por sua conta. Combine com
                  o ateliê após a confirmação. O transporte fica por conta do
                  cliente e o ateliê não se responsabiliza por incidentes no
                  envio.
                </p>
              </div>
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#927e78]">
                <Clock3 size={13} className="mt-0.5 shrink-0 text-[#a84d53]" />
                Sempre que possível, faça o pedido com {
                  store.advanceNoticeDays
                }{' '}
                dias de antecedência.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#eaded4] bg-white p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#a48f88]">
                  Revise seu pedido
                </p>
                {lines.map((line) => (
                  <div
                    key={`${line.product.id}-${line.option.name}-${line.flavors.join('|')}`}
                    className="mt-2 flex justify-between gap-2 text-xs text-[#654f4a]"
                  >
                    <span>
                      {line.quantity} × {line.product.title} ·{' '}
                      {line.option.name}
                      {line.flavors.length > 0 &&
                        ` · Sabores: ${line.flavors.join(', ')}`}
                    </span>
                    <b className="shrink-0 text-[#781f2b]">{lineTotal(line)}</b>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t border-[#eee3da] pt-2 text-xs">
                  <span className="font-semibold text-[#654f4a]">
                    Estimativa
                  </span>
                  <b className="text-[#781f2b]">
                    {total === null ? 'a confirmar' : formatPrice(total)}
                  </b>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#806e69]">
                  <Clock3 size={12} /> {formatDate(date)} às {time}
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-[#eee3da] bg-[#fbf8f3] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3.5 sm:px-7 sm:pb-5">
          <div className="flex gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setToast(null)
                  setStep((currentStep) => currentStep - 1)
                }}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d8ce] bg-white text-sm font-semibold text-[#725c56]"
              >
                <ArrowLeft size={15} /> Voltar
              </button>
            )}
            {step === 1 && cartView && lines.length === 0 ? (
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#781f2b] text-sm font-semibold text-white shadow-sm"
              >
                Continuar comprando
              </button>
            ) : step === 1 ? (
              <>
                {!cartView && (
                  <button
                    type="button"
                    disabled={product.soldOut}
                    onClick={addCurrentToCart}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#ba7e7f] bg-white text-sm font-semibold text-[#781f2b] disabled:opacity-50"
                  >
                    <ShoppingCart size={15} /> Adicionar ao carrinho
                  </button>
                )}
                <button
                  type="button"
                  onClick={continueStep}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#781f2b] text-sm font-semibold text-white shadow-sm"
                >
                  Finalizar pedido <ArrowRight size={16} />
                </button>
              </>
            ) : step < 3 ? (
              <button
                type="button"
                onClick={continueStep}
                className="flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-[#781f2b] text-sm font-semibold text-white shadow-sm"
              >
                Revisar encomenda
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={sendOrder}
                className="flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-[#15803d] text-sm font-semibold text-white shadow-sm"
              >
                <Send size={15} /> Enviar pelo WhatsApp
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] text-[#a18d87]">
            Sem pagamento agora · você confirma os detalhes pelo WhatsApp
          </p>
        </footer>
      </section>
    </div>
  )
}
