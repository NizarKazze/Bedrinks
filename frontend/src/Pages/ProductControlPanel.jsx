import { useState, useEffect } from 'react';
import { Search, Wine, X, ChevronDown, ChevronUp, EyeOff, ArrowUpDown } from 'lucide-react';
import { useFetch } from '../Hook/useFetch';
import { usePost } from '../Hook/usePost';
import Logo from '../assets/BeDrinks-logo.png'

const LoadingComponent = () => {
  return (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-orange-400"></div>
      <p className="mt-4 text-gray-600">Cargando productos...</p>
    </div>
  )
}

const ProductTableHeader = ({ item, label, hasInput, isHidden, setFilters, fetchSearch, addFilter }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = async (e) => {
    const value = e.target.value;
    setSearchValue(value);

    const trimmed = value.trim();

    if (trimmed === "") {
      setFilters(prev => ({ ...prev, [`${item}_id`]: [] }));
    } else {
      const results = await fetchSearch(item, trimmed);
      addFilter(`${item}_id`, results, true);
    }
  };

  return (
    <th className={isHidden(item) ? "hidden" : ""}>
      {label}
      {hasInput && (
        <input
          type="text"
          className="mt-1 block w-full"
          placeholder="Buscar..."
          value={searchValue}
          onChange={handleChange}
        />
      )}
    </th>
  );
};


export default function ProductFilter() {
  const [products, setProducts] = useState()
  const [loading, setLoading] = useState(true)
  const [orderBy, setOrderBy] = useState('name')

  const [visibleColumns, setVisibleColumns] = useState({
    code: true,
    name: true,
    winery: true,
    category: true,
    denomination: true,
    vintage: true,
    format: true,
    price: true
  });

  const [Columns, setColumns] = useState({
    code: 'code',
    name: 'name',
    winery: 'winery',
    category: 'category',
    denomination: 'denomination',
    vintage: 'vintage',
    format: 'format',
    price: 'price'
  });
  
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const toggleShowColumn = (columnName) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  const showColumnComponent = () => {
    return (
      <div className="px-4 pb-4 space-y-2 absolute bg-gray-50 mt-4">
        {Object.entries(visibleColumns).map(([column, isVisible]) => (
          <label
            key={column}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={isVisible}
              onChange={() => toggleShowColumn(column)}
              className="w-4 h-4 text-main-color border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="checkbox-btn"></span>
            <span className="text-gray-700">{column}</span>
          </label>
        ))}
      </div>
    );
  };

  const isHidden = (columnName) => !visibleColumns[columnName];

    const [showOrderSelector, setshowOrderSelector] = useState(false);


  const ShowOrderBy = () => {
    return (
      <div className="px-4 pb-4 space-y-2 absolute bg-gray-50 mt-4 shadow rounded">
        {Object.entries(Columns).map(([column]) => (
          <label
            key={column}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
          >
            <input
              type="radio"
              name="order_by"
              value={column}
              checked={orderBy === column}
              onChange={() => setOrderBy(column)}
              className="w-4 h-4 text-main-color border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700 capitalize">{column}</span>
          </label>
        ))}
      </div>
    );
  };


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
   * @description Busca si el @param value exsite en filters y lo elimina, en caso contrario lo añade
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

    formData.append("order_by", orderBy);
    formData.append("order_dir", "ASC");
  
    try {
      const res = await fetch("backend/filters.php?action=products", {
        method: "POST",
        body: formData 
      });
  
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
  
      const data = await res.json();
      console.log(formData)
            
      setProducts(data.products);
      setLoading(false);
  
    } catch (err) {
      console.error("Error al aplicar filtros:", err);
    }
  };
  
  // llama a applyFilters() cada vez que cambia el estado filters

  useEffect(() => {
    applyFilters();
  }, [filters, orderBy]);

  const getOptionName = (category, id) => {
    const option = filterOptions[category]?.find(opt => opt.id === id);
    return option?.name || '-';
  };

  const totalActiveFilters = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);

  const fetchSearch = async (table, search) => {
    try {
      const params = new URLSearchParams({ table, search });
      const res = await fetch(`backend/filters.php?action=search_by&${params.toString()}`);
      const data = await res.json();
      return data; 
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  };
  

  const addFilter = (key, items, replace = false) => {
    setFilters(prev => {
      const existingIds = new Set(prev[key]);
  
      if (replace) {
        // Si replace es true, solo guardamos los nuevos ids
        const newIds = items.map(item => item.id);
        return {
          ...prev,
          [key]: newIds
        };
      } else {
        // Añadir sin duplicados
        const newIds = items
          .map(item => item.id)
          .filter(id => !existingIds.has(id));
        return {
          ...prev,
          [key]: [...prev[key], ...newIds]
        };
      }
    });
  };
  

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

              <div id='search-container' className='p-4 border-b border-gray-200 flex justify-between'>
                <div id='search-product'>
                  <input type="text" placeholder='Buscar productos...' className=''/>
                </div>
                <div className='flex gap-2'>
                  <div >
                    <button className='flex gap-2 bg-gray-100 p-4 rounded-lg' onClick={() => setShowColumnSelector(prev => !prev)}>
                    <EyeOff /> Ocultar columnas
                    </button>

                    {showColumnSelector && showColumnComponent()}
                  </div>
                  <div className=''>
                    <button className='flex gap-2 bg-gray-100 p-4 rounded-lg' onClick={() => setshowOrderSelector(prev => !prev)}>
                    <ArrowUpDown />
                    </button>

                    {showOrderSelector && ShowOrderBy()}
                  </div>
                </div>

              </div>

              {loading ? (

                <LoadingComponent></LoadingComponent>
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
                      <ProductTableHeader
                        item="code"
                        label="Código"
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                      <ProductTableHeader
                        item="name"
                        label="Nombre"
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                      <ProductTableHeader
                        item="winery"
                        label="Bodega"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                      <ProductTableHeader
                        item="category"
                        label="Tipo"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                      <ProductTableHeader
                        item="denomination"
                        label="D.O."
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                      <ProductTableHeader
                        item="vintage"
                        label="Añada"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                      <ProductTableHeader
                        item="format"
                        label="Formato"
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                      />
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {products && products.length > 0 ? (
                      products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className={`px-4 py-3 text-sm text-gray-500 ${isHidden("code") ? "hidden" : ""}`}>{product.code}</td>
                          <td className={`px-4 py-3 text-sm text-gray-900 ${isHidden("name") ? "hidden" : ""}`}>{product.name}</td>
                          <td className={`px-4 py-3 text-sm text-gray-500 ${isHidden("winery") ? "hidden" : ""}`}>{getOptionName('wineries', product.winery_id)}</td>
                          <td className={`px-4 py-3 text-sm ${isHidden("category") ? "hidden" : ""}`}>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-main-color-50">
                              {getOptionName('types', product.category_id)}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm text-gray-500 ${isHidden("denomination") ? "hidden" : ""}`}>{getOptionName('denominations', product.denomination_id)}</td>
                          <td className={`px-4 py-3 text-sm text-gray-500 ${isHidden("vintage") ? "hidden" : ""}`}>{getOptionName('vintages', product.vintage_id)}</td>
                          <td className={`px-4 py-3 text-sm text-gray-500 ${isHidden("format") ? "hidden" : ""}`}>{product.format}</td>
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