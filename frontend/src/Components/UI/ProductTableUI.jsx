import { useState, useEffect } from 'react';

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