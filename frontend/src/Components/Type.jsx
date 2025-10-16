import React, { useState } from "react";
import { useFetch } from "../Hook/useFetch";

// Componente individual para cada SubTipo
const SubTypeItem = ({ id, name, description }) => (
  <div className="sub-type-item w-full p-2 mb-4 border-b" id={`sub-type-${id}`}>
    <p><strong>Nombre:</strong> {name}</p>
    <p><strong>Descripción:</strong> {description}</p>
  </div>
);

// Lista de subtipos de un tipo específico
const SubTypeList = ({ id_type }) => {
  const { data, loading, error } = useFetch(
    `backend/filters.php?action=subtype&id_type=${id_type}`
  );

  if (loading) return <p>Cargando subtipos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="sub-type-list w-full flex flex-col p-4 bg-gray-100 rounded">
      <h4 className="font-semibold mb-2">Subtipos:</h4>
      {data && data.length > 0 ? (
        data.map((subtype) => <SubTypeItem key={subtype.id} {...subtype} />)
      ) : (
        <p>No se encontraron subtipos.</p>
      )}
    </div>
  );
};

// Componente individual de Tipo
const TypeItem = ({ id, name, description }) => {
  const [showSubTypes, setShowSubTypes] = useState(false);

  return (
    <div className="type-item w-full p-4 mb-4 border rounded">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setShowSubTypes(!showSubTypes)}
      >
        <div>
          <p><strong>Nombre:</strong> {name}</p>
          <p><strong>Descripción:</strong> {description}</p>
        </div>
        <span className="text-xl">{showSubTypes ? "▲" : "▼"}</span>
      </div>

      {showSubTypes && <SubTypeList id_type={id} />}
    </div>
  );
};

// Lista principal de Tipos
const TypeList = () => {
  const { data, loading, error } = useFetch("backend/filters.php?action=type");

  if (loading) return <p>Cargando tipos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="type-list w-full flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Tipos de Producto</h2>

      <div className="type-list-content">
        {data && data.length > 0 ? (
          data.map((type) => <TypeItem key={type.id} {...type} />)
        ) : (
          <p>No se encontraron tipos.</p>
        )}
      </div>

      <div id="Btn-add-product" className="w-full mt-4">
        <button className="w-full p-4 bg-blue-600 text-white rounded hover:bg-blue-700">
          Añadir Tipo
        </button>
      </div>
    </div>
  );
};

export default TypeList;
