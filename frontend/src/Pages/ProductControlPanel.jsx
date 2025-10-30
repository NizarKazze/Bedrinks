import { useState, useEffect } from 'react';
import { Search, Wine, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductFilter() {

  const [filters, setFilters] = useState({
    type_id: [],
    denomination_id: [],
    winery_id: [],
    vintage_id: [],
    supplier_id: []
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    type_id: true,
    denomination_id: false,
    winery_id: false,
    vintage_id: false,
    supplier_id: false
  });

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
  
  const [filterOptions] = useState({
    types: [
      { id: 1, name: 'Tinto' },
      { id: 2, name: 'Blanco' },
      { id: 3, name: 'Rosado' },
      { id: 4, name: 'Espumoso' }
    ],
    denominations: [
      { id: 1, name: 'Rioja' },
      { id: 2, name: 'Ribera del Duero' },
      { id: 3, name: 'Priorat' },
      { id: 4, name: 'Rías Baixas' }
    ],
    wineries: [
      { id: 1, name: 'Bodegas Muga' },
      { id: 2, name: 'Vega Sicilia' },
      { id: 3, name: 'Marqués de Riscal' },
      { id: 4, name: 'Alvaro Palacios' }
    ],
    vintages: [
      { id: 1, name: '2023' },
      { id: 2, name: '2022' },
      { id: 3, name: '2021' },
      { id: 4, name: '2020' }
    ],
    suppliers: [
      { id: 1, name: 'Distribuidor A' },
      { id: 2, name: 'Distribuidor B' },
      { id: 3, name: 'Importador C' }
    ]
  });

  const mockProducts = [
    { id: 1, code: 'VIN001', name: 'Reserva Especial', winery_id: 1, type_id: 1, denomination_id: 1, vintage_id: 3, price: 45.50, format: '750ml', reference: 'REF-001' },
    { id: 2, code: 'VIN002', name: 'Único', winery_id: 2, type_id: 1, denomination_id: 2, vintage_id: 4, price: 320.00, format: '750ml', reference: 'REF-002' },
    { id: 3, code: 'VIN003', name: 'Albariño Premium', winery_id: 1, type_id: 2, denomination_id: 4, vintage_id: 1, price: 18.90, format: '750ml', reference: 'REF-003' },
    { id: 4, code: 'VIN004', name: 'Gran Reserva', winery_id: 3, type_id: 1, denomination_id: 1, vintage_id: 4, price: 65.00, format: '750ml', reference: 'REF-004' },
    { id: 5, code: 'VIN005', name: 'Finca Dofí', winery_id: 4, type_id: 1, denomination_id: 3, vintage_id: 2, price: 95.00, format: '750ml', reference: 'REF-005' },
    { id: 6, code: 'VIN006', name: 'Blanco Especial', winery_id: 2, type_id: 2, denomination_id: 4, vintage_id: 1, price: 28.50, format: '750ml', reference: 'REF-006' },
    { id: 7, code: 'VIN007', name: 'Rosado Fresco', winery_id: 1, type_id: 3, denomination_id: 1, vintage_id: 1, price: 15.90, format: '750ml', reference: 'REF-007' },
    { id: 8, code: 'VIN008', name: 'Cava Brut Nature', winery_id: 3, type_id: 4, denomination_id: 1, vintage_id: 2, price: 22.00, format: '750ml', reference: 'REF-008' }
  ];

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

  const clearFilters = () => {
    setFilters({
      type_id: [],
      denomination_id: [],
      winery_id: [],
      vintage_id: [],
      supplier_id: []
    });
  };

  const toggleFilterExpanded = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const applyFilters = () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...mockProducts];
      
      // Aplicar filtros activos (si hay valores seleccionados, filtrar por ellos)
      Object.keys(filters).forEach(key => {
        if (filters[key].length > 0) {
          filtered = filtered.filter(product => 
            filters[key].includes(product[key])
          );
        }
      });
      
      setProducts(filtered);
      setLoading(false);
    }, 300);
  };

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
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
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
        <div className="px-4 pb-4 space-y-2">
          {options.map(option => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters[filterKey].includes(option.id)}
                onChange={() => handleCheckboxChange(filterKey, option.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Wine className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
              <p className="text-gray-600 text-sm mt-1">Gestión y filtrado de inventario</p>
            </div>
          </div>
        </div>

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
                  filterKey="type_id"
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
                  <span className="text-blue-600 ml-2">({products.length})</span>
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Cargando productos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No se encontraron productos</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm underline"
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">{product.code}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{getOptionName('wineries', product.winery_id)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {getOptionName('types', product.type_id)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{getOptionName('denominations', product.denomination_id)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{getOptionName('vintages', product.vintage_id)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.format}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{product.price.toFixed(2)}€</td>
                        </tr>
                      ))}
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