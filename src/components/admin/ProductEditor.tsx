import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react'
import type { ProductDraft } from '../../types/admin'
import { button, dangerButton, field, fieldLabel, hint, iconButton } from './ui'
import { PhotoEditor } from './PhotoEditor'
import { priceLabel } from '../../lib/adminData'
import { CatalogImage } from '../catalog/CatalogImage'

interface ProductEditorProps {
  product: ProductDraft
  index: number
  total: number
  open: boolean
  photoOptions: string[]
  onToggle: () => void
  onMove: (direction: -1 | 1) => void
  onDuplicate: () => void
  onDelete: () => void
  onPatch: (updater: (product: ProductDraft) => ProductDraft) => void
}

export function ProductEditor({
  product,
  index,
  total,
  open,
  photoOptions,
  onToggle,
  onMove,
  onDuplicate,
  onDelete,
  onPatch,
}: ProductEditorProps) {
  const firstPhoto = product.images[0]?.src
  const soldOutText = product.soldOut ? ' · ESGOTADO' : ''

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e9ded6] bg-white">
      <div className="flex flex-wrap items-center gap-3 p-4">
        {firstPhoto ? (
          <CatalogImage
            src={firstPhoto}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl bg-[#f3ede8] object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-xl bg-[#f3ede8]" />
        )}

        <div className="min-w-48 flex-1">
          <span className="mb-1 inline-block rounded-full bg-[#f4e4e6] px-2.5 py-0.5 text-[0.68rem] font-bold text-vinho">
            {product.tag || 'Sem etiqueta'}
          </span>
          <h3 className="font-display text-lg leading-tight text-[#3d2c2c]">
            {product.title || 'Produto sem nome'}
          </h3>
          <p className={`${hint} mt-0.5`}>
            {product.category || 'Sem categoria'} ·{' '}
            {product.options.length
              ? product.options
                  .map((option) => priceLabel(option.price))
                  .join(' · ')
              : 'Sem preço'}
            {soldOutText}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className={iconButton}
            aria-label="Subir produto"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className={iconButton}
            aria-label="Descer produto"
          >
            <ChevronDown size={18} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className={iconButton}
            aria-label="Duplicar produto"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={dangerButton}
            aria-label="Excluir produto"
          >
            <Trash2 size={16} />
          </button>
          <button type="button" onClick={onToggle} className={button}>
            {open ? 'Fechar' : 'Editar'}
          </button>
        </div>
      </div>

      {open && (
        <div className="grid gap-6 border-t border-dashed border-[#e9ded6] p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${fieldLabel} sm:col-span-2`}>
              Endereço do produto (id)
              <input
                type="text"
                value={product.id}
                spellCheck={false}
                onChange={(event) =>
                  onPatch((current) => ({ ...current, id: event.target.value }))
                }
                className={field}
              />
              <span className={`${hint} font-normal`}>
                Só letras minúsculas, números e hífens. Evite mudar em produtos
                já publicados.
              </span>
            </label>
            <label className={fieldLabel}>
              Categoria
              <input
                type="text"
                value={product.category}
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className={field}
              />
            </label>
            <label className={fieldLabel}>
              Nome do produto
              <input
                type="text"
                value={product.title}
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className={field}
              />
            </label>
            <label className={`${fieldLabel} sm:col-span-2`}>
              Descrição
              <textarea
                rows={3}
                value={product.description || ''}
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className={field}
              />
            </label>
            <label className={`${fieldLabel} sm:col-span-2`}>
              Etiqueta curta
              <input
                type="text"
                value={product.tag || ''}
                placeholder="Ex.: Feitos à mão"
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    tag: event.target.value,
                  }))
                }
                className={field}
              />
            </label>
          </div>

          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg text-[#3d2c2c]">
                  Apresentações e preços
                </h4>
                <p className={hint}>
                  Uma linha por opção que o cliente escolhe.
                </p>
              </div>
              <button
                type="button"
                className={button}
                onClick={() =>
                  onPatch((current) => ({
                    ...current,
                    options: [...current.options, { name: '', price: 0 }],
                  }))
                }
              >
                + Preço
              </button>
            </div>

            {product.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="grid gap-3 rounded-2xl border border-[#e9ded6] bg-[#fbf7f2] p-4 sm:grid-cols-[1.4fr_0.8fr_0.7fr_auto] sm:items-end"
              >
                <label className={fieldLabel}>
                  Apresentação
                  <input
                    type="text"
                    value={option.name}
                    placeholder="Ex.: 35 unidades"
                    onChange={(event) =>
                      onPatch((current) => ({
                        ...current,
                        options: current.options.map((item, itemIndex) =>
                          itemIndex === optionIndex
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      }))
                    }
                    className={field}
                  />
                </label>
                <label className={fieldLabel}>
                  Preço (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.price ?? ''}
                    disabled={option.price === null}
                    onChange={(event) =>
                      onPatch((current) => ({
                        ...current,
                        options: current.options.map((item, itemIndex) =>
                          itemIndex === optionIndex
                            ? {
                                ...item,
                                price:
                                  event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                              }
                            : item,
                        ),
                      }))
                    }
                    className={field}
                  />
                </label>
                <label className={fieldLabel}>
                  Máx. sabores
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={option.maxFlavors ?? ''}
                    placeholder="opcional"
                    onChange={(event) =>
                      onPatch((current) => ({
                        ...current,
                        options: current.options.map((item, itemIndex) => {
                          if (itemIndex !== optionIndex) return item
                          const next = { ...item }
                          if (event.target.value === '') delete next.maxFlavors
                          else next.maxFlavors = Number(event.target.value)
                          return next
                        }),
                      }))
                    }
                    className={field}
                  />
                </label>
                <div className="flex items-end gap-2 sm:col-span-4 sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-[#3d2c2c]">
                    <input
                      type="checkbox"
                      checked={option.price === null}
                      onChange={(event) =>
                        onPatch((current) => ({
                          ...current,
                          options: current.options.map((item, itemIndex) =>
                            itemIndex === optionIndex
                              ? {
                                  ...item,
                                  price: event.target.checked ? null : 0,
                                }
                              : item,
                          ),
                        }))
                      }
                      className="h-5 w-5 accent-vinho"
                    />
                    Sob consulta
                  </label>
                  <button
                    type="button"
                    aria-label={`Remover apresentação ${optionIndex + 1}`}
                    className={dangerButton}
                    onClick={() =>
                      onPatch((current) => ({
                        ...current,
                        options: current.options.filter(
                          (_, itemIndex) => itemIndex !== optionIndex,
                        ),
                      }))
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg text-[#3d2c2c]">Sabores</h4>
                <p className={hint}>
                  Deixe vazio se o produto não tiver escolha de sabor.
                </p>
              </div>
              <button
                type="button"
                className={button}
                onClick={() =>
                  onPatch((current) => ({
                    ...current,
                    flavors: [...(current.flavors || []), ''],
                  }))
                }
              >
                + Sabor
              </button>
            </div>
            <label className={`${fieldLabel} max-w-sm`}>
              Como o cliente escolhe?
              <select
                value={product.flavorSelection || 'single'}
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    flavorSelection: event.target.value as
                      'single' | 'multiple',
                  }))
                }
                className={field}
              >
                <option value="single">Um sabor</option>
                <option value="multiple">Vários sabores</option>
              </select>
            </label>
            {(product.flavors || []).map((flavor, flavorIndex) => (
              <div key={flavorIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={flavor}
                  placeholder={`Sabor ${flavorIndex + 1}`}
                  onChange={(event) =>
                    onPatch((current) => ({
                      ...current,
                      flavors: (current.flavors || []).map((item, itemIndex) =>
                        itemIndex === flavorIndex ? event.target.value : item,
                      ),
                    }))
                  }
                  className={field}
                />
                <button
                  type="button"
                  aria-label={`Remover sabor ${flavorIndex + 1}`}
                  className={dangerButton}
                  onClick={() =>
                    onPatch((current) => ({
                      ...current,
                      flavors: (current.flavors || []).filter(
                        (_, itemIndex) => itemIndex !== flavorIndex,
                      ),
                    }))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </section>

          <PhotoEditor
            photos={product.images}
            options={photoOptions}
            productTitle={product.title}
            onChange={(images) =>
              onPatch((current) => ({ ...current, images }))
            }
          />

          <label className="flex items-center gap-3 text-sm text-[#3d2c2c]">
            <input
              type="checkbox"
              checked={Boolean(product.soldOut)}
              onChange={(event) =>
                onPatch((current) => ({
                  ...current,
                  soldOut: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-vinho"
            />
            Produto esgotado (bloqueia novas encomendas)
          </label>

          <button
            type="button"
            onClick={onDelete}
            className={`${button} justify-self-start text-[#a32727]`}
          >
            Excluir este produto
          </button>
        </div>
      )}
    </article>
  )
}
