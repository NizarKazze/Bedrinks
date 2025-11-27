import { useState, useEffect } from 'react';
import { Tag, Funnel } from 'lucide-react';

export const ProductTableHeader = ({ item, label, hasInput, isHidden, setFilters, fetchSearch, addFilter, setProducts }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = async (e) => {
    const value = e.target.value.trim();
    setSearchValue(value);

    if (value === "") {
      if (["winery", "category", "denomination", "vintage", "supplier"].includes(item)) {
        setFilters(prev => ({ ...prev, [`${item}_id`]: [] }));
      } else {
        const res = await fetch("backend/filters.php?action=products");
        const data = await res.json();
        setProducts(data.products || []);
      }
      return;
    }

    const isFilterField = ["winery", "category", "denomination", "vintage", "supplier"].includes(item);

    if (isFilterField) {
      const results = await fetchSearch(item, value);
      addFilter(`${item}_id`, results, true);
    } else {
      const results = await fetchSearch("product", value);
      setProducts(results.products || results || []);
    }
  };

  return (
    <th className={`px-10 pt-2 align-top ${isHidden(item) ? "hidden" : ""}`}>
      <div className='flex flex-col justify-start text-sm'>
        {label}
        {hasInput && (
          <input
            type="text"
            className="my-2 p-1 rounded-lg block w-full"
            placeholder="Buscar..."
            value={searchValue}
            onChange={handleChange}
          />
        )}
      </div>
    </th>
  );
};

export const ShowPromotions = ({product}) => {
  return(
    <div className="absolute top-0 left-full ml-2 bg-white border rounded shadow p-4 z-10 max-w-[50vw]">
    <table className="table-auto border-collapse border border-gray-200 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-5 py-2 whitespace-nowrap">PROMO</th>
          <th className="border px-5 py-2 whitespace-nowrap">DTO %</th>
          <th className="border px-5 py-2 whitespace-nowrap">NETO</th>
          <th className="border px-5 py-2 whitespace-nowrap">MGN €</th>
          <th className="border px-5 py-2 whitespace-nowrap">MGN %</th>
        </tr>
      </thead>
      <tbody>
        {product.promotions.map((promo) => {
          const price = product.price;
          const cost = product.coste || 0;

          let dtoPercent = 0;
          let neto = price;
          let mgnEuro = price - cost;
          let mgnPercent = cost > 0 ? (mgnEuro / cost) * 100 : 0;

          if (promo.type === 'discount_percentage') {
            dtoPercent = promo.discount_percent;
            neto = price * (1 - dtoPercent / 100);
            mgnEuro = neto - cost;
            mgnPercent = cost > 0 ? (mgnEuro / cost) * 100 : 0;
          }

          if (promo.type === 'discount_fixed') {
            dtoPercent = (promo.discount_amount / price) * 100;
            neto = price - promo.discount_amount;
            mgnEuro = neto - cost;
            mgnPercent = cost > 0 ? (mgnEuro / cost) * 100 : 0;
          }

          if (promo.type === 'buy_x_get_y') {
            const totalQty = promo.buy_quantity + promo.free_quantity;
            dtoPercent = (promo.free_quantity / totalQty) * 100;
            neto = price;
            mgnEuro = neto - cost;
            mgnPercent = cost > 0 ? (mgnEuro / cost) * 100 : 0;
          }

          return (
            <tr key={promo.id}>
              <td className="border px-2 py-1 text-center">
                {promo.type === 'buy_x_get_y' ? `${promo.buy_quantity}+${promo.free_quantity}` :
                promo.type === 'discount_percentage' ? `${Number(dtoPercent || 0).toFixed(2)}%` :
                `-${Number(promo.discount_amount || 0).toFixed(2)}€`}
              </td>
              <td className="border px-2 py-1 text-center">{Number(dtoPercent || 0).toFixed(2)}%</td>
              <td className="border px-2 py-1 text-center">{Number(neto || 0).toFixed(2)}</td>
              <td className="border px-2 py-1 text-center">{Number(mgnEuro || 0).toFixed(2)}</td>
              <td className="border px-2 py-1 text-center">{Number(mgnPercent || 0).toFixed(1)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  )
}

export const ProductHead = ({products}) => {
  return (
    <h2 className="font-semibold text-gray-900 flex-shrink-0">
      Productos
      <span className="text-main-color ml-2">{products?.length || 0}</span>
    </h2>
  )
}

export const ProductViewController = ({setVisibleColumns, clearFilters, applyCategoryFilter, 
  setIsFilterPanelCollapsed, isFilterPanelCollapsed, totalActiveFilters}) => {

  const viewTarif = () => {
    setVisibleColumns(prev => ({
      ...prev,
      winery: false,
      format: false,
      denomination: false,
      rating: false,
      category: false
    }));
  };

  const showAllColumns = () => {
    setVisibleColumns(prev => {
      const allTrue = {};
      for (const key in prev) {
        allTrue[key] = true;
      }
      return allTrue;
    });
  };

  return (
    <div className="flex flex-wrap gap-2  justify-end min-w-0">
      <button className="bg-orange-300 p-2 rounded-lg text-sm flex-shrink-0" onClick={() => viewTarif()}>Tarifas</button>
      <button className="bg-orange-300 p-2 rounded-lg text-sm flex-shrink-0" onClick={() => applyCategoryFilter(1)}>Vinos</button>
      <button className="bg-orange-300 p-2 rounded-lg text-sm flex-shrink-0" onClick={() => applyCategoryFilter(13)}>Destilados</button>
      <button className="bg-gray-100 p-2 rounded-lg text-sm flex-shrink-0" onClick={() => { clearFilters(); showAllColumns(); }}>Resetear Vista</button>

      {isFilterPanelCollapsed && (
        <button
          onClick={() => setIsFilterPanelCollapsed(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          title="Mostrar filtros"
        >
          <span className="text-sm text-gray-700 font-medium"><Funnel /></span>

          {totalActiveFilters > 0 && (
            <span className="bg-main-color text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalActiveFilters}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
