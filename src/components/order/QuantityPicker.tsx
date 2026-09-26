import { Minus, Plus } from 'lucide-react'

interface QuantityPickerProps {
  value: number
  onChange: (quantity: number) => void
}

export function QuantityPicker({ value, onChange }: QuantityPickerProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#eaded4] bg-white px-3.5 py-2.5">
      <span className="text-xs font-semibold text-[#654f4a]">Quantidade</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label="Diminuir quantidade"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ede7] text-[#781f2b]"
        >
          <Minus size={15} />
        </button>
        <span
          aria-live="polite"
          className="min-w-4 text-center text-sm font-semibold"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(50, value + 1))}
          aria-label="Aumentar quantidade"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5ede7] text-[#781f2b]"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}
