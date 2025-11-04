import React, { useEffect, useState } from "react";
import { useFetch } from "../Hook/useFetch";
import { usePost } from "../Hook/usePost";
import { usePopup } from "./Popup";

import { FormBottom } from "./FormComponents";
import { FormInput } from "./FormComponents";

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

/* ============= Insert Fetch Form =============== */

export const InsertCountryForm = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { send } = usePost("backend/filters.php?action=insert-country");
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

      <FormInput label={"Nombre"} type={"text"} name={"name"} value={formData.name} onChange={handleChange}></FormInput>
      <FormInput label={"Descripción"} type={"text"} name={"description"} value={formData.description} onChange={handleChange}></FormInput>

      <FormBottom handleSubmit={handleSubmit} ></FormBottom>

    </div>
  );
}

/* ============= Update Fetch Form =============== */

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

      <FormInput label={"Nombre"} type={"text"} name={"name"} value={formData.name} onChange={handleChange}></FormInput>
      <FormInput label={"Descripción"} type={"text"} name={"description"} value={formData.description} onChange={handleChange}></FormInput>

      <FormBottom handleSubmit={handleSubmit} ></FormBottom>


    </div>
  );
}

export const deleteCountry = (id) => {
  const { send } = usePost("backend/filters.php?action=delete_country");
  send({ id })
    .then(() => refetch())
    .catch(err => console.error("Error al eliminar:", err));
};




export default CountryList;