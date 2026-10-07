import { Heart } from 'lucide-react'

interface FlavorPickerProps {
  flavors: string[]
  value: string[]
  selectionMode: 'single' | 'multiple'
  maxFlavors?: number
  disabled?: boolean
  onChange: (flavors: string[]) => void
}

export function FlavorPicker({
  flavors,
  value,
  selectionMode,
  maxFlavors,
  disabled = false,
  onChange,
}: FlavorPickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#781f2b]">
        <Heart size={14} fill="currentColor" />
        {selectionMode === 'multiple'
          ? maxFlavors
            ? `Escolha até ${maxFlavors} sabores`
            : 'Escolha um ou mais sabores'
          : 'Escolha um sabor'}
      </legend>
      {selectionMode === 'multiple' && (
        <p className="mb-2 text-[11px] leading-relaxed text-[#897774]">
          {maxFlavors
            ? `Selecione no máximo ${maxFlavors} sabores. A quantidade de cada sabor é combinada com o ateliê pelo WhatsApp.`
            : 'Você pode marcar vários. A quantidade de cada sabor é combinada com o ateliê pelo WhatsApp.'}
        </p>
      )}
      <div
        role={selectionMode === 'multiple' ? 'group' : 'radiogroup'}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {flavors.map((flavor) => {
          const selected = value.includes(flavor)
          const limitReached = Boolean(
            selectionMode === 'multiple' &&
              maxFlavors &&
              value.length >= maxFlavors &&
              !selected,
          )

          return (
            <button
              key={flavor}
              type="button"
              role={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
              aria-checked={selected}
              disabled={disabled || limitReached}
              onClick={() => {
                if (selectionMode === 'single') {
                  onChange([flavor])
                  return
                }

                const selectedFlavors = new Set(value)
                if (selected) {
                  selectedFlavors.delete(flavor)
                } else {
                  if (maxFlavors && value.length >= maxFlavors) return
                  selectedFlavors.add(flavor)
                }

                onChange(flavors.filter((item) => selectedFlavors.has(item)))
              }}
              className={`min-h-10 rounded-xl border px-2.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? 'border-[#781f2b] bg-[#781f2b] text-white shadow-sm'
                  : 'border-[#e1c5bc] bg-white text-[#6a3037] hover:border-[#781f2b] hover:bg-[#fbf1ec]'
              }`}
            >
              {flavor}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
