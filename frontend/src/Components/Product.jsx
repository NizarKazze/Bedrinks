import React, { useEffect, useState } from "react";
import { useFetch } from "../Hook/useFetch";
import { useNavigate } from 'react-router-dom';

const ProductItem = ({ id, code, name, description, price, winery_id, type_id }) => (
  <div className="product-item w-full p-2 mb-4" id={`product-${id}`}>
    <h3>{name}</h3>
    <p><strong>Code:</strong> {code}</p>
    <p><strong>Type:</strong> {type_id}</p>
    <p><strong>Winery:</strong> {winery_id}</p>
    <p><strong>Price:</strong> €{price}</p>
    <p>{description}</p>
  </div>
);

const ProductList = ({ filters = {} }) => {
  const params = new URLSearchParams({ action: "products", ...filters });
  const url = `/backend/filters.php?${params.toString()}`;
  const { data, loading, error } = useFetch('backend/filters.php?action=products');
  const navigate = useNavigate(); 

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  const addProduct = () => {
     navigate('/new-product'); 
  };

  return (
    <div className="product-list w-1/3 flex flex-col p-4 h-8/12">
        <div className="product-list-content">
            {data && data.length > 0 ? (
                data.map((product) => <ProductItem key={product.id} {...product} />)
            ) : (
                <p>No products found.</p>
            )}
        </div>
        <div id="Btn-add-product" className="w-full h-4/12">
            <button className="w-full p-6" onClick={addProduct}>Añadir Producto</button>
        </div>
    </div>
  );
};



export default ProductList;
