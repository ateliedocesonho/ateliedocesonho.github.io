import store from '../data/store.json'

export function getWhatsAppUrl(
  message = 'Olá! Vim pelo site do Ateliê Doce Sonho.',
) {
  const query = new URLSearchParams({ text: message })
  return `https://wa.me/${store.whatsappNumber}?${query.toString()}`
}
