import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent } from 'react'

export interface Choice {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

interface ChoicePickerProps {
  label: string
  value: string
  choices: Choice[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (id: string) => void
}

export function ChoicePicker({
  label,
  value,
  choices,
  open,
  onOpenChange,
  onChange,
}: ChoicePickerProps) {
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const selected = choices.find((choice) => choice.id === value)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onOpenChange, open])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape' && open) {
      event.stopPropagation()
      onOpenChange(false)
    }
    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault()
      onOpenChange(true)
      window.requestAnimationFrame(() => {
        document
          .getElementById(listId)
          ?.querySelector<HTMLButtonElement>('[role="option"]')
          ?.focus()
      })
    }
  }

  function returnFocusToTrigger() {
    onOpenChange(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      returnFocusToTrigger()
    }
  }

  return (
    <div ref={pickerRef} className="relative">
      <span className="mb-1.5 block text-xs font-semibold text-[#654f4a]">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => onOpenChange(!open)}
        onKeyDown={handleKeyDown}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#eaded4] bg-white px-3.5 py-2.5 text-left transition hover:border-[#cba8a0]"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[#392827]">
            {selected?.label ?? 'Selecione uma opção'}
          </span>
          {selected?.description && (
            <span className="mt-0.5 block truncate text-xs text-[#897774]">
              {selected.description}
            </span>
          )}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-[#897774] transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={handleListKeyDown}
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-[36svh] overflow-y-auto rounded-xl border border-[#eaded4] bg-white p-1.5 shadow-xl"
        >
          {choices.map((choice) => {
            const isSelected = choice.id === value

            return (
              <button
                key={choice.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={choice.disabled}
                onClick={() => {
                  onChange(choice.id)
                  onOpenChange(false)
                  window.requestAnimationFrame(() =>
                    triggerRef.current?.focus(),
                  )
                }}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left transition hover:bg-[#fbf3ef] aria-selected:bg-[#f7ece7] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#543c38]">
                    {choice.label}
                    {choice.disabled && (
                      <span className="ml-2 rounded-full bg-[#f7dfde] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#a3343b]">
                        Esgotado
                      </span>
                    )}
                  </span>
                  {choice.description && (
                    <span className="mt-0.5 block truncate text-[11px] text-[#897774]">
                      {choice.description}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Check size={16} className="shrink-0 text-[#781f2b]" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
