export const LoadingComponent = () => {
  return (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-orange-400"></div>
      <p className="mt-4 text-gray-600">Cargando productos...</p>
    </div>
  )
}