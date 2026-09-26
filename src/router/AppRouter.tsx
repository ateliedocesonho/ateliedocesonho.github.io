import { Route, Routes } from 'react-router-dom'
import { CatalogNotFoundPage } from '../pages/CatalogNotFoundPage'
import { CatalogPage } from '../pages/CatalogPage'
import { HomePage } from '../pages/HomePage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/encomendas"
        element={<CatalogPage catalogId="encomendas" />}
      />
      <Route path="/catalogos/:catalogId" element={<CatalogPage />} />
      <Route path="*" element={<CatalogNotFoundPage />} />
    </Routes>
  )
}
