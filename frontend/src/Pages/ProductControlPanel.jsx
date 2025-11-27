import { useState, useEffect, useMemo } from 'react';
import { Search, Download, X, ChevronDown, ChevronUp, ChartNoAxesColumnDecreasing, Tag, 
  ArrowUpDown, ChevronLeft, Pencil, PencilOff, Save, Funnel, Trash2, User, 
  FileText, History, Package, TriangleAlert, Star} from 'lucide-react';
import { useFetch } from '../Hook/useFetch';
import { usePost } from '../Hook/usePost';
import * as XLSX from 'xlsx';

import { LoadingComponent } from '../Components/UI/UIHelpers';
import { ProductTableHeader, ShowPromotions } from '../Components/UI/ProductTableUI';
import { ProductsNotFound } from '../Components/UI/UIHelpers';

import { CustomTableHeader } from '../Components/UI/ProposalTableUI';
import SlidebarNavigation from '../Components/UI/SlidebarNav';
import { ProductHead, ProductViewController  } from '../Components/UI/ProductTableUI';
import exportToExcel from '../Components/ExportToExcel';
import { useContext } from "react";
import { ProposalContext } from '../Components/Context/ProposalProvider';
import { useNavigate } from "react-router-dom";


export default function ProductFilter() {
  const [products, setProducts] = useState()
  const [loading, setLoading] = useState(true)
  const [orderBy, setOrderBy] = useState('name')
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  const irAProposalPreview = () => {
      navigate("/proposal-preview");
  };

  // Propuesta

  const {
    selectedClient,
    setSelectedClient,
    selectedProducts,
    setSelectedProducts
  } = useContext(ProposalContext);

  const [historyClient, setHistoryClient] = useState(null);
  
  const [promoOpenId, setPromoOpenId] = useState(null);

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

  const [expandedFilters, setExpandedFilters] = useState({
    category_id: true,
    denomination_id: false,
    winery_id: false,
    vintage_id: false,
    supplier_id: false
  });

  const [clients, setClients] = useState([]);

  // View controller
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(true);
  const [showOrderSelector, setshowOrderSelector] = useState(false);


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
    margen_euro: true,
    margen_porcentaje: true,
    iva: true,
    tarifa: true,
    status: true,
    grape: true

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

  const clientId = selectedClient?.id ?? null;
  const { data: HistoryData } = useFetch(
    `backend/propuesta.php?action=get-history-by-client&client_id=${clientId}`
  );
  
  /**
   * Actualizar estados al recibir los datos del backend
   */

  useEffect(() => {
    if (HistoryData) {
      setHistoryClient(HistoryData);
    }
  }, [HistoryData, selectedClient]);

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

  // ============ Controladores de vistas

  const toggleProposalExpanded = () => {
    setIsCreatingProposal(prev => !prev);
  };
  

  // ============== Funcionamiento propuestas ================

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
    setSelectedProducts([])
    console.log(response);
  };

  
  const removeProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((item) => item.id !== id));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products);
    } else {
      setSelectedProducts([]);
    }
  };


  // ================ Edición inline producto

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };
  

  // =========== Product Controler ===========

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
      client.name.toLowerCase().includes(search.toLowerCase())
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

  
  const CategoryOptions = ({ categories, level = 0 }) => {
    return categories.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {'\u00A0'.repeat(level * 3)}{level > 0 ? '— ' : '━ '}{category.name}
      </option>,
      ...(category.children && category.children.length > 0 
        ? CategoryOptions({ categories: category.children, level: level + 1 })
        : [])
    ]);
  };



  const getFullCategoryPath = (categories, id) => {
    const findCategoryById = (list, targetId, path = []) => {
      for (const item of list) {
        if (item.id === targetId) {
          return [...path, item.name];
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
        : firstName === 'Destilados'
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

  const renderStars = (rating) => {
    const normalized = Math.min(Math.max(parseInt(rating) || 0, 1), 3); 
    return [...Array(normalized)].map((_, i) => (
      <Star key={i} className="w-4 h-4 text-yellow-500 inline-block" fill="currentColor" />
    ));
  };
  
  

  return (
    <div className="min-h-screen flex">

      <SlidebarNavigation toggleProposalExpanded={toggleProposalExpanded}></SlidebarNavigation>

      <div className="w-full mx-auto px-8 mt-6 ">

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
          <div className={` lg:col-span-3 min-w-0 transition-all duration-300 ${isFilterPanelCollapsed ? 'lg:col-span-4' : ''} `}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
            {/* Encabezado tabla productos */}
            <div id='product-head' className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
              
              <ProductHead products={products}></ProductHead>
              <ProductViewController 
                setVisibleColumns={setVisibleColumns} 
                clearFilters={clearFilters} 
                applyCategoryFilter={applyCategoryFilter} 
                setIsFilterPanelCollapsed={setIsFilterPanelCollapsed} 
                isFilterPanelCollapsed={isFilterPanelCollapsed} 
                totalActiveFilters={totalActiveFilters}
              ></ProductViewController>

            </div>


              <div id='search-container' className='p-4 border-b border-gray-200 flex justify-end'>
                <div className='flex gap-2'>
                  <button
                    onClick={() => exportToExcel(products, getOptionName)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download />
                    Descargar Excel
                  </button>
                  <div >
                    <button className='flex gap-2 bg-gray-100 p-2 items-center rounded-lg text-sm' onClick={() => setShowColumnSelector(prev => !prev)}>
                    <ChartNoAxesColumnDecreasing /> columnas
                    </button>

                    {showColumnSelector && showColumnComponent()}
                  </div>
                  <div className=''>
                    <button className='flex gap-2 bg-gray-100 p-2 rounded-lg' onClick={() => setshowOrderSelector(prev => !prev)}>
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
                <div className="overflow-x-auto w-full product-table overflow-y-auto">
                  <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>

                      {/* Checkbox; SelectAll */}
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
                      
                      <th className="text-sm">Acciones</th>

                      {[
                        { item: "status", label: "Estado", hasInput: false },
                        { item: "code", label: "Código", hasInput: true },
                        { item: "name", label: "Nombre", hasInput: true },
                        { item: "winery", label: "Bodega", hasInput: true },
                        { item: "category", label: "Tipo", hasInput: true },
                        { item: "denomination", label: "D.O.", hasInput: true },
                        { item: "vintage", label: "Añada", hasInput: true },
                        { item: "format", label: "Formato", hasInput: true },
                        { item: "grape", label: "UVA", hasInput: true },
                        { item: "rating", label: "Rating", hasInput: true },
                        { item: "price", label: "Precio", hasInput: true },
                        { item: "coste", label: "Coste", hasInput: true },
                        { item: "margen_euro", label: "MGN€", hasInput: true },
                        { item: "margen_porcentaje", label: "MGN%", hasInput: true },
                        { item: "iva", label: "IVA", hasInput: true },
                        { item: "tarifa", label: "TARIFA", hasInput: false },
                      ].map(({ item, label, hasInput }) => (
                        <ProductTableHeader
                          key={item}
                          item={item}
                          label={label}
                          hasInput={hasInput}
                          isHidden={isHidden}
                          setFilters={setFilters}
                          fetchSearch={fetchSearch}
                          addFilter={addFilter}
                          setProducts={setProducts}
                        />
                      ))}

                    </tr>
                  </thead>


                  <tbody className="bg-white divide-y divide-gray-200">

                    {products.map((product) => {

                      const isEditing = editingId === product.id;

                      const handleCheckboxChangeProducts = (product) => {
                        const exists = selectedProducts.find((p) => p.id === product.id);
                      
                        if (exists) {
                          setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
                        } else {
                          setSelectedProducts([
                            ...selectedProducts,
                            { ...product, quantity: 1, checked: true },
                          ]);
                        }
                      };
                      
                      {/* Calculos producto */}
                      const margenEuros = product.price - product.coste;
                      const margenPorc = product.coste > 0 ? (margenEuros / product.coste) * 100 : 0;
                      const precioPVPIVA = product.price * (1 + (product.iva / 100));
                      const isChecked = selectedProducts.find((p) => p.id === product.id)?.checked || false;

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-gray-50 ${
                            selectedProducts.find((p) => p.id === product.id && p.checked)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              value={product.id}
                              checked={isChecked}
                              onChange={() => handleCheckboxChangeProducts(product)}
                            />
                          </td>

                          <td className="px-10 py-3 relative">
                            {isEditing ? (

                              <div id='Btn-actions' className='flex gap-2'>
                                <button onClick={saveEdit} className="bg-green-200 p-1 rounded-lg" onKeyDown={handleKeyDown}>
                                  <Save className='w-5'/>
                                </button>
                                <button onClick={cancelEdit} className="bg-red-200 p-1 rounded-lg">
                                  <PencilOff className='w-5'/>
                                </button>
                              </div>

                            ) : (
                              <div className="flex gap-1 relative">

                                {/* Btn iniciar edición*/}
                                <button 
                                  onClick={() => startEdit(product)} 
                                  className="bg-main-color-50 p-2 rounded-lg flex items-center gap-1"
                                >
                                  <Pencil className='w-4 h-5'/>
                                </button>

                                {/* Btn mostrar promociones */}
                                {product.promotions && product.promotions.length > 0 && (
                                  <div>
                                    <button 
                                      onClick={() => setPromoOpenId(promoOpenId === product.id ? null : product.id)} 
                                      className="p-2 rounded-lg flex items-center gap-1"
                                    >
                                      <Tag className='w-6 h-6'/>
                                    </button>
                                    <div className='absolute top-0 right-0 bg-red-400 rounded-full px-1 text-white'>{product.promotions.length}</div>
                                  </div>
                                )}

                                {/* Desplegable con tabla de promociones */}
                                {promoOpenId === product.id && (
                                  <ShowPromotions product={product}></ShowPromotions>
                                )}
                              </div>
                            )}
                          </td>


                          {/* Campos directos */}

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap capitalize  ${isHidden("status") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                name="estado"
                                value={editData.estado}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                              />
                            ) : (
                              <div className='bg-green-100 text-center p-2 rounded-lg'>{product.estado}</div>
                              
                            )}
                          </td>

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("code") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                name="code"
                                value={editData.code}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
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
                                onKeyDown={handleKeyDown}
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
                                className='block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-sm'
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault(); // evita que cierre o haga scroll
                                    saveEdit();
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
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
                              className="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {

                                  saveEdit();
                                } else if (e.key === "Escape") {
                                  cancelEdit();
                                }
                              }}
                            >
                              <option value="">Seleccionar categoría...</option>
                              {categoryData && <CategoryOptions categories={categoryData} />}
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
                                className='block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-sm'
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault(); // evita que cierre o haga scroll
                                    saveEdit();
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
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

                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("vintage") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <select
                                name="vintage_id"
                                value={editData.vintage_id || ""}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault(); // evita que cierre o haga scroll
                                    saveEdit();
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
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



                          <td
                            className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${
                              isHidden("grape") ? "hidden" : ""
                            }`}
                          >
                            {isEditing ? (
                              <input
                                name="grape"
                                value={
                                  Array.isArray(editData.grape)
                                    ? editData.grape.map(g => g.name).join(", ")
                                    : ""
                                }
                                onChange={handleChange}
                              />
                            ) : (
                              <div className="flex flex-wrap gap-2 whitespace-nowrap">
                                {Array.isArray(product.grape) &&
                                  product.grape.map(g => (
                                    <span
                                      key={g.id}
                                      className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs"
                                    >
                                      {g.name}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </td>

                          <td
                            className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${
                              isHidden("rating") ? "hidden" : ""
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                name="rating"
                                min="1"
                                max="3"
                                value={editData.rating || ""}
                                onChange={handleChange}
                                className="w-16"
                                onKeyDown={handleKeyDown}
                              />
                            ) : (
                              <div className="flex gap-1">
                                {renderStars(product.rating)}
                              </div>
                            )}
                          </td>


                          <td className={`px-10 py-3 text-sm text-gray-900 whitespace-nowrap ${isHidden("price") ? "hidden" : ""}`}>
                            {isEditing ? (
                              <input
                                type="number"
                                name="price"
                                value={editData.price || ""}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
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
                                onKeyDown={handleKeyDown}
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

      {isCreatingProposal && (
  <div className="min-h-screen mt-6 w-2/4">
    <div className="max-w-7xl mx-auto rounded-lg border mr-6">

      <div id='proposal-title' className='flex items-center my-6 gap-2 px-4'>
        <FileText />
        <h1 className="text-lg md:text-2xl text-gray-800">Sistema de Propuestas</h1>
      </div>

      <div className="gap-6">
        <div className="lg:col-span-1 space-y-6 mb-8">
          <div className="bg-white rounded-lg p-4">
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
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
            />

            {/* Lista de clientes filtrados */}
            <div className="space-y-2 max-h-96 overflow-y-auto">

              {/* Si el input está vacío, no mostramos nada */}
              {search.trim() !== '' && (
                <>
                  {filteredClients.length > 0 ? (
                    filteredClients.slice(0, 3).map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full text-left p-2  border-b-2 transition-all ${
                          selectedClient?.id === client.id
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <p className="font-medium">{client.name}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No se encontraron clientes</p>
                  )}
                </>
              )}

            </div>
          </div>
        </div>

        {/* Panel derecho: Vista previa de la propuesta */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6">
            {/* Detalles del cliente */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className='w-full'>
                  <div className='w-full flex justify-between items-center mb-4'>
                    <h2 className="text-lg text-gray-800">Detalles de la Propuesta</h2>

                    {selectedClient && (
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <History className="w-4 h-4" />
                        {historyClient.length > 0 && (
                          <p>Historial ({historyClient.length})</p>
                        )}
                      </button>
                    )}
                    
                  </div>

                  {selectedClient ? (
                    <div className="w-full bg-gray-50 p-4 rounded-lg  flex justify-between">
                      <div>
                        <div className='flex gap-1 items-center mb-1'>
                          <User className='w-5'></User><p className="font-semibold text-lg text-gray-800">{selectedClient.name}</p>

                        </div>
                        <p className="text-sm text-gray-600">{selectedClient.created_at}</p>
                      </div>

                      <div>
                        <p className="text-gray-600 mt-2">{selectedClient.email}</p>
                        <p className="text-gray-600">{selectedClient.phone}</p>
                        <p className="text-gray-600">{selectedClient.address}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300 flex gap-1 items-center">
                      <TriangleAlert strokeWidth={1} className='w-5' />
                      <p className="text-gray-500">Selecciona un cliente para comenzar</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Historial de propuestas */}
              {showHistory && selectedClient && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Historial de Propuestas</h3>
                  {!historyClient || historyClient.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay propuestas anteriores</p>
                  ) : (
                    <div className="space-y-2">
                      {historyClient.map(proposal => (
                        <div key={proposal.proposal_id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">Propuesta #{proposal.proposal_id}</p>
                              <p className="text-xs text-gray-600">{proposal.created_at}</p>
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
            <div id='selected-products-table' className=''>
              {selectedProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg items-center flex flex-col">
                  <Package className='w-32 h-24 text-gray-500 mb-2' strokeWidth={1}/>
                  <p className="text-gray-500">No hay productos seleccionados</p>
                  <p className="text-sm text-gray-400">Añade productos desde el catálogo</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-6 max-h-[50vh]">
                    <table className="bg-white border rounded-lg overflow-hidden w-full">
                      <CustomTableHeader labels={["Código", "Producto", "Precio"]} />
                      <tbody>
                        {selectedProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm">{product.code}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{product.name}</td>
                            <td className="py-3 px-4 font-medium">${product.price}</td>
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
                      className="w-2/4 bg-gray-200 hover:scale-1 py-2 rounded-lg transition-all "
                    >
                      Guardar Propuesta
                    </button>
<button onClick={irAProposalPreview}>Ir a Proposal Preview</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}