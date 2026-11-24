import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, ChevronDown, Clock3 } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface DateTimePickerProps {
  minimumDate: string
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

const timeOptions = Array.from({ length: 31 }, (_, index) => {
  const hour = String(7 + Math.floor(index / 2)).padStart(2, '0')
  const minute = index % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

const timeItems = timeOptions.map((value) => ({ value, label: value }))

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

export function DateTimePicker({
  minimumDate,
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  const [dateOpen, setDateOpen] = useState(false)
  const minimum = fromDateKey(minimumDate)
  const selectedDate = date ? fromDateKey(date) : undefined

  const dateLabel = selectedDate
    ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
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
        <Popover open={dateOpen} onOpenChange={setDateOpen} modal="trap-focus">
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-[#eaded4] bg-white px-4 text-left transition-colors hover:border-[#cba8a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cba8a0]"
              />
            }
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
              className={`shrink-0 text-[#897774] transition-transform ${dateOpen ? 'rotate-180' : ''}`}
            />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--anchor-width)] p-3 sm:p-4"
          >
            <PopoverClose className="sr-only">Fechar calendário</PopoverClose>
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selectedDate}
              onSelect={(nextDate) => {
                if (!nextDate) return
                onDateChange(toDateKey(nextDate))
                setDateOpen(false)
              }}
              disabled={{ before: minimum }}
              startMonth={minimum}
              defaultMonth={selectedDate ?? minimum}
              className="w-full [--cell-size:2.75rem]"
            />
          </PopoverContent>
        </Popover>
      </section>

      <section aria-labelledby="pickup-time-title">
        <h3
          id="pickup-time-title"
          className="mb-2 text-xs font-semibold text-[#654f4a]"
        >
          Horário de preferência
        </h3>
        <Select
          items={timeItems}
          value={time || null}
          onValueChange={(nextTime) => onTimeChange(nextTime ?? '')}
        >
          <SelectTrigger aria-labelledby="pickup-time-title">
            <span className="flex min-w-0 items-center gap-3">
              <Clock3 size={19} className="shrink-0 text-[#9c4b50]" />
              <SelectValue placeholder="Escolha um horário" />
            </span>
          </SelectTrigger>
          <SelectContent>
            {timeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </div>
  )
}
