import React, { useEffect, useState } from "react";
import { useFetch } from "../Hook/useFetch";

const CountryItem = (props) => (
  <div className="product-item w-full p-2 mb-4" id={`country-${props.id}`}>
    <p><strong>Nombre:</strong> {props.name}</p>
    <p><strong>Descripción:</strong> {props.description}</p>
  </div>
);

const CountryList = () => {
  const { data, loading, error } = useFetch('backend/filters.php?action=countries');
  console.log(data);

  if (loading) return <p>Loading countries...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="country-list w-1/3 flex flex-col p-4 h-8/12">
        <div className="country-list-content">
            {data && data.length > 0 ? (
                data.map((country) => <CountryItem key={country.id} {...country} />)
            ) : (
                <p>No countries found.</p>
            )}
        </div>
        <div id="Btn-add-product" className="w-full h-4/12">
            <button className="w-full p-6">Añadir País</button>
        </div>
    </div>
  );
};



export default CountryList;