import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { formatDate, formatPrice } from '../../lib/format'
import type { OrderLine, Product, StoreSettings } from '../../types/catalog'
import { Toast } from '../Toast'
import { ChoicePicker, type Choice } from './ChoicePicker'
import { DateTimePicker } from './DateTimePicker'
import { FlavorPicker } from './FlavorPicker'
import { QuantityPicker } from './QuantityPicker'

interface OrderModalProps {
  products: Product[]
  initialProduct: Product
  initialFlavors?: string[]
  store: StoreSettings
  onClose: () => void
}

const stepTitles = [
  'O que vamos preparar?',
  'Quando você precisa?',
  'Revise sua encomenda',
]

export function OrderModal({
  products,
  initialProduct,
  initialFlavors,
  store,
  onClose,
}: OrderModalProps) {
  const [step, setStep] = useState(1)
  const [openPicker, setOpenPicker] = useState<'product' | 'option' | null>(
    null,
  )
  const [lines, setLines] = useState<OrderLine[]>([])
  const [productId, setProductId] = useState(initialProduct.id)
  const [optionName, setOptionName] = useState(
    initialProduct.options[0]?.name ?? '',
  )
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(
    initialFlavors ??
      (initialProduct.flavors?.[0] ? [initialProduct.flavors[0]] : []),
  )
  const [quantity, setQuantity] = useState(1)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [toast, setToast] = useState<{
    message: string
    variant: 'error' | 'success'
  } | null>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const setProductPickerOpen = useCallback((open: boolean) => {
    setOpenPicker(open ? 'product' : null)
  }, [])
  const setOptionPickerOpen = useCallback((open: boolean) => {
    setOpenPicker(open ? 'option' : null)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 3800)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? initialProduct,
    [initialProduct, productId, products],
  )
  const option =
    product.options.find((item) => item.name === optionName) ??
    product.options[0]
  const minimumDate = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 10)

  const productChoices: Choice[] = products.map((item) => ({
    id: item.id,
    label: item.title,
    description: item.soldOut
      ? 'Esgotado no momento'
      : `A partir de ${formatPrice(item.options[0]?.price ?? null)}`,
    disabled: item.soldOut,
  }))
  const optionChoices: Choice[] = product.options.map((item) => ({
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

  function changeProduct(nextId: string) {
    const nextProduct = products.find((item) => item.id === nextId)
    if (!nextProduct) return

    setProductId(nextId)
    setOptionName(nextProduct.options[0]?.name ?? '')
    setSelectedFlavors(nextProduct.flavors?.[0] ? [nextProduct.flavors[0]] : [])
    setToast(null)
  }

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

    return { product, option, flavors: selectedFlavors, quantity }
  }

  function addLine() {
    const lineToAdd = getCurrentLine()
    if (!lineToAdd) return

    setLines((currentLines) => {
      const matchingLine = currentLines.findIndex(
        (line) =>
          line.product.id === lineToAdd.product.id &&
          line.option.name === lineToAdd.option.name &&
          line.flavors.join('|') === lineToAdd.flavors.join('|'),
      )

      if (matchingLine === -1) {
        return [...currentLines, lineToAdd]
      }

      return currentLines.map((line, index) =>
        index === matchingLine
          ? { ...line, quantity: line.quantity + lineToAdd.quantity }
          : line,
      )
    })
    setToast({
      message: `${lineToAdd.quantity} item(ns) adicionado(s) à encomenda.`,
      variant: 'success',
    })
  }

  function removeLine(indexToRemove: number) {
    setLines((currentLines) =>
      currentLines.filter((_, index) => index !== indexToRemove),
    )
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
    if (step === 1 && lines.length === 0) {
      const selectedLine = getCurrentLine()
      if (!selectedLine) return
      setLines([selectedLine])
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
                {stepTitles[step - 1]}
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
              <ChoicePicker
                label="Escolha o doce"
                value={productId}
                choices={productChoices}
                open={openPicker === 'product'}
                onOpenChange={setProductPickerOpen}
                onChange={changeProduct}
              />

              <ChoicePicker
                label="Tamanho ou apresentação"
                value={optionName}
                choices={optionChoices}
                open={openPicker === 'option'}
                onOpenChange={setOptionPickerOpen}
                onChange={(nextOption) => {
                  setOptionName(nextOption)
                  setToast(null)
                }}
              />

              {product.flavors && (
                <FlavorPicker
                  flavors={product.flavors}
                  value={selectedFlavors}
                  selectionMode={product.flavorSelection ?? 'single'}
                  disabled={product.soldOut}
                  onChange={(nextFlavors) => {
                    setSelectedFlavors(nextFlavors)
                    setToast(null)
                  }}
                />
              )}

              <QuantityPicker
                value={quantity}
                onChange={(nextQuantity) => {
                  setQuantity(nextQuantity)
                  setToast(null)
                }}
              />

              {product.soldOut && (
                <p className="rounded-xl bg-[#fae8e6] px-3.5 py-3 text-xs font-semibold text-[#9a3035]">
                  Este produto está esgotado no momento. Escolha outro doce da
                  lista para continuar.
                </p>
              )}

              <button
                type="button"
                disabled={product.soldOut}
                onClick={addLine}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#ba7e7f] py-3 text-sm font-bold text-[#781f2b] transition hover:bg-[#f8efec] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={17} /> Adicionar à encomenda
                <span className="font-medium text-[#9b8480]">
                  · {formatPrice(option?.price ?? null)}
                </span>
              </button>
              {lines.length > 0 && (
                <div className="space-y-2 rounded-xl bg-[#f2e9e0] p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8b6f68]">
                    Na sua encomenda · {lines.length} item(ns)
                  </p>
                  {lines.map((line, index) => (
                    <div
                      key={`${line.product.id}-${line.option.name}-${line.flavors.join('|')}`}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="min-w-0 truncate text-[#654f4a]">
                        {line.quantity} × {line.product.title} ·{' '}
                        {line.option.name}
                        {line.flavors.length > 0 &&
                          ` · Sabores: ${line.flavors.join(', ')}`}
                      </span>
                      <span className="shrink-0 font-semibold text-[#781f2b]">
                        {lineTotal(line)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        aria-label={`Remover ${line.product.title}`}
                        className="shrink-0 p-1 text-[#a7807c]"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-[#ddcec4] pt-2 text-right text-xs font-bold text-[#541720]">
                    Estimativa:{' '}
                    {total === null ? 'a confirmar' : formatPrice(total)}
                  </div>
                </div>
              )}

              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#927e78]">
                <Sparkles
                  size={13}
                  className="mt-0.5 shrink-0 text-[#a84d53]"
                />
                Você pode adicionar vários produtos. Os sabores são escolhidos
                separadamente para cada item.
              </p>
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
            {step < 3 ? (
              <button
                type="button"
                onClick={continueStep}
                className="flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-[#781f2b] text-sm font-semibold text-white shadow-sm"
              >
                {step === 1
                  ? lines.length === 0
                    ? 'Continuar com este produto'
                    : 'Escolher retirada'
                  : 'Revisar encomenda'}
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
