export interface PriceOption {
  name: string
  price: number | null
}

export interface ProductPhoto {
  src: string
  alt: string
}

export interface Product {
  id: string
  category: string
  title: string
  description: string
  tag: string
  images: ProductPhoto[]
  options: PriceOption[]
  flavors?: string[]
  flavorSelection?: 'single' | 'multiple'
  soldOut?: boolean
}

export interface ProductCatalog {
  id: string
  title: string
  subtitle: string
  products: Product[]
}

export interface StoreSettings {
  name: string
  whatsappNumber: string
  instagramUrl: string
  instagramHandle: string
  advanceNoticeDays: number
  depositPercent: number
  acceptsCard: boolean
  pickupPolicy: string
  deliveryPolicy: string
  cancellationNoticeDays: number
  transportPolicy: string
}

export interface OrderLine {
  product: Product
  option: PriceOption
  flavors: string[]
  quantity: number
}

export interface HomeLink {
  id: string
  label: string
  description: string
  href: string
  icon: string
  style: 'primary' | 'secondary'
}
