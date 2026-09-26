import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from 'lucide-react'

interface DateTimePickerProps {
  minimumDate: string
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})
const timeOptions = Array.from({ length: 31 }, (_, index) => {
  const hour = String(7 + Math.floor(index / 2)).padStart(2, '0')
  const minute = index % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function createMonth(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const dayCount = new Date(year, month + 1, 0).getDate()

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ]
}

interface PickerModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

function PickerModal({ title, onClose, children }: PickerModalProps) {
  const dialogRef = useRef<HTMLElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    dialogRef.current
      ?.querySelector<HTMLElement>('button:not([disabled])')
      ?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
        ),
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#281817]/60 px-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-in flex max-h-[88svh] w-full max-w-md flex-col overflow-hidden rounded-t-[26px] bg-[#fbf8f3] shadow-2xl sm:rounded-[24px]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#eee3da] px-5 py-4 sm:px-6">
          <h2 id={titleId} className="serif text-xl text-[#541720]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#806e69]"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-5">{children}</div>
      </section>
    </div>,
    document.body,
  )
}

export function DateTimePicker({
  minimumDate,
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const [openPicker, setOpenPicker] = useState<'date' | 'time' | null>(null)
  const calendarId = useId()
  const timesId = useId()
  const closePicker = useCallback(() => setOpenPicker(null), [])
  const today = fromDateKey(minimumDate)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = fromDateKey(date || minimumDate)
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  })
  const days = useMemo(
    () => createMonth(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth],
  )
  const selectedDate = date ? fromDateKey(date) : null
  const canGoToPreviousMonth =
    visibleMonth.getFullYear() > today.getFullYear() ||
    (visibleMonth.getFullYear() === today.getFullYear() &&
      visibleMonth.getMonth() > today.getMonth())

  function selectDay(day: number) {
    onDateChange(
      toDateKey(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
      ),
    )
    closePicker()
  }

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Toque para escolher uma data'

  return (
    <div className="space-y-4">
      <section aria-labelledby="pickup-date-title">
        <h3
          id="pickup-date-title"
          className="mb-2 text-xs font-semibold text-[#654f4a]"
        >
          Data da retirada
        </h3>
        <button
          type="button"
          aria-expanded={openPicker === 'date'}
          aria-controls={calendarId}
          onClick={() => setOpenPicker(openPicker === 'date' ? null : 'date')}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-[#eaded4] bg-white px-4 text-left transition hover:border-[#cba8a0]"
        >
          <span className="flex min-w-0 items-center gap-3">
            <CalendarDays size={19} className="shrink-0 text-[#9c4b50]" />
            <span
              className={`truncate text-sm font-semibold capitalize ${selectedDate ? 'text-[#543c38]' : 'text-[#927e78]'}`}
            >
              {dateLabel}
            </span>
          </span>
          <ChevronDown
            size={17}
            className={`shrink-0 text-[#897774] transition ${openPicker === 'date' ? 'rotate-180' : ''}`}
          />
        </button>

        {openPicker === 'date' && (
          <PickerModal title="Data da retirada" onClose={closePicker}>
            <div
              id={calendarId}
              className="mt-2 rounded-2xl border border-[#eaded4] bg-white p-3.5 shadow-lg sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() - 1,
                          1,
                        ),
                    )
                  }
                  disabled={!canGoToPreviousMonth}
                  aria-label="Mês anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#725c56] hover:bg-[#fbf3ef] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={19} />
                </button>
                <p className="text-sm font-bold capitalize text-[#541720]">
                  {monthFormatter.format(visibleMonth)}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() + 1,
                          1,
                        ),
                    )
                  }
                  aria-label="Próximo mês"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#725c56] hover:bg-[#fbf3ef]"
                >
                  <ChevronRight size={19} />
                </button>
              </div>

              <div
                className="grid grid-cols-7 gap-y-1"
                role="grid"
                aria-label="Calendário"
              >
                {weekdays.map((weekday, index) => (
                  <span
                    key={`${weekday}-${index}`}
                    aria-hidden="true"
                    className="flex h-8 items-center justify-center text-[10px] font-bold uppercase text-[#a48f88]"
                  >
                    {weekday}
                  </span>
                ))}
                {days.map((day, index) => {
                  if (day === null) return <span key={`empty-${index}`} />
                  const dayDate = new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth(),
                    day,
                  )
                  const dayKey = toDateKey(dayDate)
                  const isSelected = dayKey === date
                  const isDisabled = dayKey < minimumDate

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      role="gridcell"
                      aria-label={dayDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      aria-selected={isSelected}
                      disabled={isDisabled}
                      onClick={() => selectDay(day)}
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition sm:h-11 sm:w-11 ${isSelected ? 'bg-[#781f2b] text-white' : isDisabled ? 'cursor-not-allowed text-[#d4c9c3]' : 'text-[#543c38] hover:bg-[#f7ece7]'}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </PickerModal>
        )}
      </section>

      <section aria-labelledby="pickup-time-title">
        <h3
          id="pickup-time-title"
          className="mb-2 text-xs font-semibold text-[#654f4a]"
        >
          Horário de preferência
        </h3>
        <button
          type="button"
          aria-expanded={openPicker === 'time'}
          aria-controls={timesId}
          onClick={() => setOpenPicker(openPicker === 'time' ? null : 'time')}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-[#eaded4] bg-white px-4 text-left transition hover:border-[#cba8a0]"
        >
          <span className="flex items-center gap-3">
            <Clock3 size={19} className="shrink-0 text-[#9c4b50]" />
            <span
              className={`text-sm font-semibold ${time ? 'text-[#543c38]' : 'text-[#927e78]'}`}
            >
              {time || 'Toque para escolher um horário'}
            </span>
          </span>
          <ChevronDown
            size={17}
            className={`shrink-0 text-[#897774] transition ${openPicker === 'time' ? 'rotate-180' : ''}`}
          />
        </button>

        {openPicker === 'time' && (
          <PickerModal title="Horário de preferência" onClose={closePicker}>
            <div
              id={timesId}
              role="group"
              aria-label="Escolha um horário"
              className="mt-2 grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-2xl border border-[#eaded4] bg-white p-3 shadow-lg"
            >
              {timeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={time === option}
                  onClick={() => {
                    onTimeChange(option)
                    closePicker()
                  }}
                  className={`min-h-10 rounded-xl border text-xs font-semibold transition ${time === option ? 'border-[#781f2b] bg-[#781f2b] text-white' : 'border-[#eaded4] bg-[#fffdfa] text-[#654f4a] hover:border-[#cba8a0] hover:bg-[#fbf3ef]'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </PickerModal>
        )}
      </section>
    </div>
  )
}
