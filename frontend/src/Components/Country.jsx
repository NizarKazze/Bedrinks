import React, { useEffect, useState } from "react";
import { useFetch } from "../Hook/useFetch";
import { usePost } from "../Hook/usePost";
import { usePopup } from "./Popup";

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

export const InsertCountryForm = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { data, loading, error, send } = usePost("backend/filters.php?action=insert-country");
  const { closePopup } = usePopup();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (formData.name && formData.description) {
      send(formData)
      if (onSuccess) onSuccess();
      closePopup();
    } else {
      alert('Por favor completa todos los campos');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={closePopup}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-main-color rounded-md  transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export const UpdateCountryForm = ({countryId, onSuccess}) => {
  const { data: countryData, loading, error, send: fetchCountry } = usePost(
    `backend/filters.php?action=country_by_id`
  );

  const { send: updateCountry } = usePost(
    "backend/filters.php?action=update_country"
  );

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
  });

  const { closePopup } = usePopup();

  useEffect(() => {
    if (countryData) {
      setFormData({
        id: countryData.id || countryId,
        name: countryData.name || "",
        description: countryData.description || "",
      });
    }
  }, [countryData, countryId]);

  useEffect(() => {
    if (countryId) {
      fetchCountry({ id: countryId });
    }
  }, [countryId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (formData.name && formData.description) {
      await updateCountry(formData);
      if (onSuccess) onSuccess();
      closePopup();
    } else {
      alert("Por favor completa todos los campos");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={closePopup}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-main-color rounded-md  transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export const deleteCountry = (id) => {
  // Aquí ejecutas tu hook usePost o fetch
  const { send } = usePost("backend/filters.php?action=delete_country");
  send({ id })  // envías id al backend
    .then(() => refetch())
    .catch(err => console.error("Error al eliminar:", err));
};




export default CountryList;