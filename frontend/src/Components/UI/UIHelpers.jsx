import {  Wine } from 'lucide-react';

export const LoadingComponent = () => {
  return (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-orange-400"></div>
      <p className="mt-4 text-gray-600">Cargando productos...</p>
    </div>
  )
}

export const ProductsNotFound = ({clearFilters}) => {
  return (
    <div className="text-center py-16">
      <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">No se encontraron productos</p>
      <button
        onClick={clearFilters}
        className="mt-4 text-main-color text-sm underline"
      >
        Limpiar filtros
      </button>
  </div>
  )

}