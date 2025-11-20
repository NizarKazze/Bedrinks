import { useState, useEffect, useMemo } from 'react';
import { Search, Wine, X, ChevronDown, ChevronUp, ChartNoAxesColumnDecreasing, ArrowUpDown, ChevronLeft, ChevronRight, Menu, Pencil, PencilOff, Save, Funnel, Trash2, User, Calendar, FileText, Plus, History, Package} from 'lucide-react';
import { useFetch } from '../Hook/useFetch';
import { usePost } from '../Hook/usePost';
import Logo from '../assets/BeDrinks-logo.png'

import { LoadingComponent } from '../Components/UI/UIHelpers';
import { ProductTableHeader } from '../Components/UI/ProductTableUI';
import { ProductsNotFound } from '../Components/UI/UIHelpers';

import { CustomTableHeader } from '../Components/UI/ProposalTableUI';

export default function ProductFilter() {
  const [products, setProducts] = useState()
  const [loading, setLoading] = useState(true)
  const [orderBy, setOrderBy] = useState('name')
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Propuesta

  const [selectedClient, setSelectedClient] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [historyClient, setHistoryClient] = useState(null);


  // Filtro 

  const [filters, setFilters] = useState({
    category_id: [],
    denomination_id: [],
    winery_id: [],
    vintage_id: [],
    supplier_id: []
  });

  const [filterOptions, setFilterOptions] = useState({
    types: [],
    denominations: [],
    wineries: [],
    vintages: [],
    suppliers: []
  });

  const [clients, setClients] = useState([]);

  // View controller
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    code: true,
    name: true,
    winery: true,
    category: true,
    denomination: true,
    vintage: false,
    format: true,
    price: true,
    blend: false,
    rating: true,
    coste: true,
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);

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
  const { data: clientData, error } = useFetch(
    "backend/propuesta.php?action=get-all-clients"
  );
  
  /**
   * Actualizar estados al recibir los datos del backend
   */

  useEffect(() => {
    if (clientData) {
      setClients(clientData);
    }
  }, [clientData]);

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






  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  };

  const { data: proposalData, send: sendProposal } = usePost("backend/propuesta.php?action=create-proposal");

  const create_proposal = async () => {
    const response = await sendProposal({
      client_id: selectedClient.id,
      products: selectedProducts.map(product => ({
        product_id: product.id,
        quantity: product.quantity,
        price: product.price
      }))
    });

    console.log(response);
  };

const addProduct = (product) => {
  setSelectedProducts((prev) => [
    ...prev,
    { ...product, quantity: 1 }
  ]);
};

const updateQuantity = (id, newQuantity) => {
  setSelectedProducts((prev) =>
    prev.map((p) =>
      p.id === id ? { ...p, quantity: Number(newQuantity) } : p
    )
  );
};



  const getClientProposals = () => {
    if (!selectedClient) return [];
    return proposals.filter(p => p.clientId === selectedClient.id);
  };

  // Estados para colapsar paneles
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(true);


    const removeProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((item) => item !== id));
  };
  

  const handleSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleAddProducts = () => {
    console.log("Productos seleccionados:", selectedProducts);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditData(product);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

const saveEdit = async () => {
  try {
    const res = await fetch("/backend/filters.php?action=update_product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    // Si el backend responde con éxito HTTP
    if (!res.ok) throw new Error("Error al actualizar el producto");

    // Actualizamos el estado de productos directamente
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === editData.id ? { ...product, ...editData } : product
      )
    );

    setEditingId(null);
    setEditData({});
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
  }
};






  const [Columns, setColumns] = useState({
    code: 'code',
    name: 'name',
    winery: 'winery',
    category: 'category',
    denomination: 'denomination',
    vintage: 'vintage',
    format: 'format',
    price: 'price',
    blend: 'blend'
  });
  

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



  const applyCategoryFilter = (parentID) => {
    if (!categoryData) return;

    const allCategoryIds = getAllCategoryChildren(categoryData, parentID);

    setFilters(prevFilters => ({
      ...prevFilters,
      category_id: allCategoryIds
    }));
  };








  const clearFilters = () => {
    setFilters({
      category_id: [],
      denomination_id: [],
      winery_id: [],
      vintage_id: [],
      supplier_id: []
    });
  };

  const getAllCategoryChildren = (categories, parentID) => {
    let result = [];

    for (const cat of categories) {
      if (cat.id === parentID) {
        result.push(cat.id);

        if (cat.children && cat.children.length > 0) {
          for (const child of cat.children) {
            result = result.concat(getAllCategoryChildren(cat.children, child.id))
          }
        }
      } else if (cat.children && cat.children.length > 0) {
        result= result.concat(getAllCategoryChildren(cat.children, parentID))
      }
    } 

    return result;
  }

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
  
      // Si estamos filtrando categorías, añadimos también sus hijos
      if (filterName === "category_id" && categoryData) {
        const allIds = getAllCategoryChildren(categoryData, value);
        if (isChecked) {
          return {
            ...prev,
            [filterName]: currentValues.filter(v => !allIds.includes(v))
          };
        } else {

          return {
            ...prev,
            [filterName]: Array.from(new Set([...currentValues, ...allIds]))
          };
        }
      }
  
      return {
        ...prev,
        [filterName]: isChecked
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };
  
  const [search, setSearch] = useState("");
  const filteredClients = useMemo(() => {
    if (!search) return clients;
    return clients.filter(client =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.company.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, clients]);

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

  const getFullCategoryPath = (categories, id) => {
    const findCategoryById = (list, targetId, path = []) => {
      for (const item of list) {
        if (item.id === targetId) {
          return [...path, item.name]; // encontramos la categoría
        }
        if (item.children && item.children.length > 0) {
          const found = findCategoryById(item.children, targetId, [...path, item.name]);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findCategoryById(categories, id);
  };

const getOptionName = (category, id) => {
  if (category === 'types' && categoryData) {
    const fullPath = getFullCategoryPath(categoryData, id);
    if (fullPath && fullPath.length > 0) {
      const firstName = fullPath[0];

      const colorScale = firstName === 'Vino'
        ? ['bg-orange-300', 'bg-orange-200', 'bg-orange-100', 'bg-orange-100']
        : firstName === 'Whisky'
        ? ['bg-blue-300', 'bg-blue-200', 'bg-blue-100', 'bg-blue-100']
        : ['bg-blue-300', 'bg-blue-200', 'bg-blue-200', 'bg-blue-100'];

      return fullPath.map((name, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2 py-1 mr-1 mb-1 text-xs font-semibold rounded-full text-gray-800 ${
            colorScale[index] || colorScale[colorScale.length - 1]
          }`}
        >
          {name} {/* Se muestra el nombre */}
        </span>
      ));
    }
    return '-';
  } else {
    const option = filterOptions[category]?.find(opt => opt.id === id);
    return option?.name || '-';
  }
};



  const totalActiveFilters = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);

  const fetchSearch = async (table, search) => {
    try {
      const productFields = ['product', 'name', 'code', 'description', 'reference', 'barcode'];
      const searchTable = productFields.includes(table) ? 'product' : table;
  
      const params = new URLSearchParams({ table: searchTable, search });
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
    <div className="min-h-screen flex">

      {/* Sidebar Izquierdo Colapsable */}
      <div className={`transition-all duration-300 border-r-2 border-gray-200 flex flex-col bg-white ${isSidebarCollapsed ? 'w-16' : 'w-1/4'}`}>
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
          {!isSidebarCollapsed && (
            <div id='logo' className='w-48'>
              <img src={Logo} alt="" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <a href="/main-control-panel" className="p-3 hover:bg-gray-100 rounded-lg" title="Panel Principal">
              <Menu className="w-5 h-5" />
            </a>
            <a href="/product-control-panel" className="p-3 hover:bg-gray-100 rounded-lg" title="Gestión de productos">
              <Wine className="w-5 h-5" />
            </a>
            <a href="#" className="p-3 hover:bg-gray-100 rounded-lg" title="Crear Propuesta">
              <Search className="w-5 h-5" />
            </a>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            <a href="/main-control-panel" className='mb-4 mt-4'>Panel Principal</a>
            <a href="/product-control-panel" className='mb-4'>Gestión de productos</a>
            <a href="#">Crear Propuesta</a>
          </div>
        )}
      </div>

      <div className="w-full mx-auto px-16 mt-10">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Filtros Colapsable */}
          {!isFilterPanelCollapsed && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">

                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Filtros
                    </h2>
                    <div className="flex items-center gap-2">
                      {totalActiveFilters > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Limpiar
                        </button>
                      )}
                      <button
                        onClick={() => setIsFilterPanelCollapsed(true)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Minimizar filtros"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
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
            
          )}

          {/* Tabla de Productos */}
          <div className={`lg:col-span-3 min-w-0 transition-all duration-300 ${isFilterPanelCollapsed ? 'lg:col-span-4' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  Productos
                  <span className="text-main-color ml-2">{products && products.length > 0 ? products.length : 0}</span>
                </h2>
                
                <div className='flex gap-2'>
                    <button className='bg-orange-300 p-2 rounded-lg' onClick={() => applyCategoryFilter(1)}>Vinos</button>
                    <button className='bg-orange-300 p-2 rounded-lg'> Destilados</button>

                  {isFilterPanelCollapsed && (
                    <button
                      onClick={() => setIsFilterPanelCollapsed(false)}
                      className="flex items-center gap-2  px-4 py-2 rounded-lg transition-colors"
                      title="Mostrar filtros"
                    >
                      <span className="text-sm text-gray-700 font-medium"><Funnel></Funnel></span>
                      {totalActiveFilters > 0 && (
                        <span className="bg-main-color text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {totalActiveFilters}
                        </span>
                      )}
                    </button>
                  )}
                </div>

              </div>

              <div id='search-container' className='p-4 border-b border-gray-200 flex justify-end'>
                <div className='flex gap-2'>
                  <div >
                    <button className='flex gap-2 bg-gray-100 p-4 rounded-lg' onClick={() => setShowColumnSelector(prev => !prev)}>
                    <ChartNoAxesColumnDecreasing /> columnas
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
                  <ProductsNotFound clearFilters={clearFilters}></ProductsNotFound>

                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {/* Checkbox de seleccionar todos */}
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedProducts.length > 0 &&
                            selectedProducts.length === products.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="px-10 py-3">Acciones</th>

                      <ProductTableHeader
                        item="code"
                        label="Código"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="name"
                        label="Nombre"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="winery"
                        label="Bodega"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="category"
                        label="Tipo"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="denomination"
                        label="D.O."
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="vintage"
                        label="Añada"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="format"
                        label="Formato"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />



                      <ProductTableHeader
                        item="blend"
                        label="Blend"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="rating"
                        label="Rating"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                        
                      />

                      <ProductTableHeader
                        item="price"
                        label="Precio"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />

                      <ProductTableHeader
                        item="coste"
                        label="Coste"
                        hasInput={true}
                        isHidden={isHidden}
                        setFilters={setFilters}
                        fetchSearch={fetchSearch}
                        addFilter={addFilter}
                        setProducts={setProducts}
                      />
                    </tr>
                  </thead>


                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const isEditing = editingId === product.id;

                        const handleCheckboxChangeProducts = () => {
                          const isSelected = selectedProducts.some((p) => p.id === product.id);

                          if (isSelected) {

                            setSelectedProducts(
                              selectedProducts.filter((p) => p.id !== product.id)
                            );

                          } else {

                            setSelectedProducts([
                              ...selectedProducts,
                              { 
                                ...product,
                                quantity: 1,
                              }
                            ]);

                          }
                        };


                      const margenEuros = product.price - product.coste;
                      const margenPorc = product.coste > 0 ? (margenEuros / product.coste) * 100 : 0;
                      const precioPVPIVA = product.price * (1 + (product.iva / 100));
                  

                      return (
                        <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${ selectedProducts.includes(product.id) ? "bg-blue-50" : "" }`}>

                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              value={product.id}
                              checked={selectedProducts.includes(product.id)}
                              onChange={handleCheckboxChangeProducts}
                            />
                          </td>

                          <td className="px-10 py-3">
                            {isEditing ? (
                              <div id='Btn-actions' className='flex gap-2'>
                                <button onClick={saveEdit} className="bg-green-200 p-1 rounded-lg"><Save /></button>
                                <button onClick={cancelEdit} className="bg-red-200 p-1 rounded-lg"><PencilOff /></button>
                              </div>

                            ) : (
                              <button onClick={() => startEdit(product)} className="bg-main-color-50 p-2 rounded-lg">
                                <Pencil className='w-4 h-5'/>
                              </button>
                            )}
                          </td>

                          {/* Campos directos */}
                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("code") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                name="code"
                                value={editData.code}
                                onChange={handleChange}
                              />
                            ) : (
                              product.code
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("name") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                name="name"
                                value={editData.name}
                                onChange={handleChange}
                              />
                            ) : (
                              product.name
                            )}
                          </td>

                          {/* Campos relacionales */}
                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("winery") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <select
                                name="winery_id"
                                value={editData.winery_id || ""}
                                onChange={handleChange}
                              >
                                <option value="">Seleccionar</option>
                                {filterOptions.wineries.map((w) => (
                                  <option key={w.id} value={w.id}>
                                    {w.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getOptionName("wineries", product.winery_id)
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("category") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <select
                                name="category_id"
                                value={editData.category_id || ""}
                                onChange={handleChange}
                              >
                                <option value="">Seleccionar</option>
                                {filterOptions.types.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getOptionName("types", product.category_id)
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("denomination") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <select
                                name="denomination_id"
                                value={editData.denomination_id || ""}
                                onChange={handleChange}
                              >
                                <option value="">Seleccionar</option>
                                {filterOptions.denominations.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getOptionName("denominations", product.denomination_id)
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("vintages") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <select
                                name="vintage_id"
                                value={editData.vintage_id || ""}
                                onChange={handleChange}
                              >
                                <option value="">Seleccionar</option>
                                {filterOptions.vintages.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getOptionName("vintages", product.vintage_id)
                            )}
                          </td>

                          {/* Otros campos directos */}
                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("format") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                name="format"
                                value={editData.format || ""}
                                onChange={handleChange}
                              />
                            ) : (
                              product.format
                            )}
                          </td>



                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("blend") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                name="blend"
                                value={editData.blend || ""}
                                onChange={handleChange}
                              />
                            ) : (
                              product.blend
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("rating") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                type="number"
                                name="rating"
                                value={editData.rating || ""}
                                onChange={handleChange}
                              />
                            ) : (
                              product.rating
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("price") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                type="number"
                                name="price"
                                value={editData.price || ""}
                                onChange={handleChange}
                              />
                            ) : (
                              product.price
                            )}
                          </td>
                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("coste") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                type="number"
                                name="coste"
                                value={editData.coste || ""}
                                onChange={handleChange}
                              />
                            ) : (
                              product.coste
                            )}
                          </td>

                                  {/* NUEVAS COLUMNAS CALCULADAS */}
                          <td className="px-10 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {margenEuros.toFixed(2)} €
                          </td>
                          <td className="px-10 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {margenPorc.toFixed(2)} %
                          </td>
                          <td className="px-10 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {product.iva} %
                          </td>
                          <td className="px-10 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {precioPVPIVA.toFixed(2)} €
                          </td>


                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
                  
      
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">

        <div id='proposal-title' className='flex items-center mb-8 gap-2'>
          <FileText></FileText>
          <h1 className="text-3xl text-gray-800">Sistema de Propuestas</h1>
        </div>

        <div className="gap-6">
        <div className="lg:col-span-1 space-y-6 mb-8">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Seleccionar Cliente
        </h2>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />

        {/* Lista de clientes filtrados */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedClient?.id === client.id
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200'
                }`}
              >
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-600">{client.company}</p>
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No se encontraron clientes</p>
          )}
        </div>
      </div>
    </div>
          {/* Panel derecho: Vista previa de la propuesta */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-8">
              {/* Detalles del cliente */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div >

                    <div className='w-full flex justify-between items-center mb-4'>
                      <h2 className="text-2xl text-gray-800">Detalles de la Propuesta</h2>

                      {selectedClient && (
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <History className="w-4 h-4" />
                          Historial ({getClientProposals().length})
                        </button>
                      )}
                    </div>

                    <div id='proposal-state' className='bg-yellow-100 inline-block py-1 px-2 rounded-lg mb-4'>
                      pending
                    </div>

                    {selectedClient ? (
                      <div className="w-full bg-orange-50 p-4 rounded-lg border-l-4 border-orange-300">
                        <p className="font-semibold text-lg text-gray-800">{selectedClient.name}</p>
                        <p className="text-gray-600">{selectedClient.company}</p>
                        <p className="text-sm text-gray-600 mt-2">{selectedClient.email}</p>
                        <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                        <p className="text-gray-500">Selecciona un cliente para comenzar</p>
                      </div>
                    )}
                  </div>
                  

                </div>

                {/* Historial de propuestas */}
                {showHistory && selectedClient && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Historial de Propuestas</h3>
                    {getClientProposals().length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay propuestas anteriores</p>
                    ) : (
                      <div className="space-y-2">
                        {getClientProposals().map(proposal => (
                          <div key={proposal.id} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">Propuesta #{proposal.id}</p>
                                <p className="text-xs text-gray-600">{proposal.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold mb-2">${proposal.total}</p>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  {proposal.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Productos seleccionados */}
              <div>
                <h2 className="text-2xl mb-4 flex items-center gap-2">
                  <Package />
                  Productos Seleccionados
                </h2>
                
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No hay productos seleccionados</p>
                    <p className="text-sm text-gray-400 mt-2">Añade productos desde el catálogo</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto mb-6">
                      <table className="bg-white border rounded-lg overflow-hidden">
                        <CustomTableHeader labels={["Código", "Producto", "Precio", "Cantidad", "Subtotal", "Acción"]} />
                        <tbody>
                          {selectedProducts.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 text-sm">{product.code}</td>
                              <td className="py-3 px-4 whitespace-nowrap">{product.name}</td>
                              <td className="py-3 px-4 font-medium">${product.price}</td>
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  min="1"
                                  value={1}
                                  className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-3 px-4 font-semibold ">
                                ${product.price}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => removeProduct(product.id)}
                                  className="text-red-500 hover:text-red-700 font-medium transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t pt-6 flex justify-end">                      
                      <button
                        onClick={create_proposal}
                        className="w-2/4 bg-main-color hover:bg-orange-400 text-white py-2 rounded-lg transition-all "
                      >
                        Guardar Propuesta
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>
  );
}