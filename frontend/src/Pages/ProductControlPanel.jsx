import { useState, useEffect } from 'react';
import { Search, Wine, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useFetch } from '../Hook/useFetch';
import { usePost } from '../Hook/usePost';
import Logo from '../assets/BeDrinks-logo.png'

export default function ProductFilter() {
  const [products, setProducts] = useState()
  const [loading, setLoading] = useState(true)

  const [visibleColumns, setVisibleColumns] = useState({
    code: true,
    name: true,
    winery: true,
    type: true,
    denomination: true,
    vintage: true,
    format: true,
    price: true
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const [expandedFilters, setExpandedFilters] = useState({
    category_id: true,
    denomination_id: false,
    winery_id: false,
    vintage_id: false,
    supplier_id: false
  });

  const [filters, setFilters] = useState({
    category_id: [],
    denomination_id: [],
    winery_id: [],
    vintage_id: [],
    supplier_id: []
  });

  /* ======= Obtener Datos ======== */

  const { data: countryData } = useFetch(
    `backend/filters.php?action=countries`
  );
  const { data: denominationData } = useFetch(
    `backend/filters.php?action=denominations`
  );
  const { data: supplierData } = useFetch(
    `backend/filters.php?action=suppliers`
  );
  const { data: categoryData } = useFetch(
    `backend/filters.php?action=category`
  );
  const { data: winerieData } = useFetch(
    `backend/filters.php?action=wineries`
  );
  const { data: vintageData } = useFetch(
    `backend/filters.php?action=vintage`
  );


  const [filterOptions, setFilterOptions] = useState({
    types: [],
    denominations: [],
    wineries: [],
    vintages: [],
    suppliers: []
  });

  useEffect(() => {
    if (denominationData && denominationData.length > 0) {
      setFilterOptions(prev => ({
        ...prev,
        denominations: denominationData.map(denomination => ({id: denomination.id, name: denomination.name}))
      }));
    }
  }, [denominationData])

  useEffect(() => {
    if (supplierData && supplierData.length > 0) {
      setFilterOptions(prev => ({
        ...prev,
        suppliers: supplierData.map(supplier => ({id: supplier.id, name: supplier.name}))
      }));
    }
  }, [supplierData])

  useEffect(() => {
    if (winerieData && winerieData.length > 0 ) {
      setFilterOptions(prev => ({
        ...prev,
        wineries: winerieData.map(winerie => ({id: winerie.id, name: winerie.name}))
      }))
    }
  }, [winerieData])

  useEffect(() => {
    if (vintageData && vintageData.length > 0 ) {
      setFilterOptions(prev => ({
        ...prev,
        vintages: vintageData.map(vintage => ({id: vintage.id, name: vintage.name}))
      }))
    }
  }, [vintageData])

  useEffect(() => {
    if (categoryData && categoryData.length > 0 ) {
      setFilterOptions(prev => ({
        ...prev,
        types: categoryData.map(category => ({id: category.id, name: category.name}))
      }))
    }
  }, [categoryData])

  const clearFilters = () => {
    setFilters({
      category_id: [],
      denomination_id: [],
      winery_id: [],
      vintage_id: [],
      supplier_id: []
    });
  };

  // Funcion CheckboxChange
  /**
   * 
   * @param {*} filterName 
   * @param {*} value 
   * 
   * @description Busca si el @param value exsite en filters y lo elimina en caso contrario lo añade
   * 
   * @returns {void} No devuelve nada pero actualiza el estado filters
   */

  const handleCheckboxChange = (filterName, value) => {
    setFilters(prev => {
      const currentValues = prev[filterName];
      const isChecked = currentValues.includes(value);
      
      return {
        ...prev,
        [filterName]: isChecked
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  /* Cambia el estado de 'expandedFilters' */

  const toggleFilterExpanded = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  /* ======= Aplicar filtros ===== */

  /**
    * 
    * @async
    * @function applyFilters
    * @returns {Promise<void>} No retorna nada, pero actualiza el estado del componente.
    *
    * @throws {Error} Si la respuesta HTTP no es correcta.
   */

  const applyFilters = async () => {
    const formData = new FormData();
  
    for (const key in filters) {
      const value = filters[key];
      if (Array.isArray(value)) {
        value.forEach(v => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, value);
      }
    }
  
    try {
      const res = await fetch("backend/filters.php?action=products", {
        method: "POST",
        body: formData 
      });
  
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Respuesta del backend:", data);
      
      setProducts(data.products);
      setLoading(false);
  
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
    }
  };
  
  // llama a applyFilters() cada vez que cambia el estado filters

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const getOptionName = (category, id) => {
    const option = filterOptions[category]?.find(opt => opt.id === id);
    return option?.name || '-';
  };

  const totalActiveFilters = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);

  const FilterSection = ({ title, filterKey, options, optionsKey }) => (

    <div className="border-b border-gray-200 last:border-b-0">

      <button
        onClick={() => toggleFilterExpanded(filterKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >

        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">{title}</span>
          {filters[filterKey].length > 0 && (
            <span className="bg-main-color-50  text-xs px-2 py-1 rounded-full">
              {filters[filterKey].length}
            </span>
          )}
        </div>

        {expandedFilters[filterKey] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}

      </button>
      
      {expandedFilters[filterKey] && (
        <div className="px-4 pb-4 space-y-2 custom-checkbox">
          {options.map(option => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters[filterKey].includes(option.id)}
                onChange={() => handleCheckboxChange(filterKey, option.id)}
                className="w-4 h-4 text-main-color border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              /> 
              <span className='checkbox-btn'></span>
              <span className="text-gray-700">{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-3/4 mt-16 mx-auto p-6">
        {/* Header */}
        <div className="mb-10 pb-4 border-b-2 border-gray-200">
          <div className="flex flex-col gap-3 mb-2">
            <div id='logo' className='mb-8'>
              <img src={Logo} alt="Bedrinks" />
            </div>
            <h1 className="text-4xl text-gray-600 border-t-2 pt-4">Panel de Productos</h1>
          </div>
        </div>

      <div className="">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">

                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Filtros
                  </h2>
                  {totalActiveFilters > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Limpiar
                    </button>
                  )}
                </div>

                {totalActiveFilters > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {totalActiveFilters} filtro{totalActiveFilters > 1 ? 's' : ''} activo{totalActiveFilters > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <FilterSection
                  title="Tipo de Vino"
                  filterKey="category_id"
                  options={filterOptions.types}
                  optionsKey="types"
                />
                <FilterSection
                  title="Denominación"
                  filterKey="denomination_id"
                  options={filterOptions.denominations}
                  optionsKey="denominations"
                />
                <FilterSection
                  title="Bodega"
                  filterKey="winery_id"
                  options={filterOptions.wineries}
                  optionsKey="wineries"
                />
                <FilterSection
                  title="Añada"
                  filterKey="vintage_id"
                  options={filterOptions.vintages}
                  optionsKey="vintages"
                />
                <FilterSection
                  title="Proveedor"
                  filterKey="supplier_id"
                  options={filterOptions.suppliers}
                  optionsKey="suppliers"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  Productos
                  <span className="text-main-color ml-2">{products && products.length > 0 ? products.length : 0}</span>
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-orange-400"></div>
                  <p className="mt-4 text-gray-600">Cargando productos...</p>
                </div>
              ) : products && products.length === 0 ? (
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
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bodega</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">D.O.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Añada</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products && products.length > 0 ? (
                        products.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-500">{product.code}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{getOptionName('wineries', product.winery_id)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-main-color-50">
                                {getOptionName('types', product.category_id)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{getOptionName('denominations', product.denomination_id)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{getOptionName('vintages', product.vintage_id)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.format}</td>
                          </tr>
                        ))
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}