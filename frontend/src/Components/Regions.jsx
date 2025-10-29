import React, { useEffect, useState } from "react";

import { useFetch } from "../Hook/useFetch";
import { usePost } from "../Hook/usePost";
import { usePopup } from "./Popup";
import { Item } from "../Pages/MainControlPanel";

export const InsertRegionForm = ({onSuccess}) => {
    const [activeCountry, setactiveCountry] = useState(null);
    const [formData, setFormData] = useState({
    name: '',
    description: '',
    country_id: activeCountry,
  });

  const { send } = usePost("backend/filters.php?action=insert_region");
  const { data, loading, error, refetch } = useFetch(
    `backend/filters.php?action=countries`
  );

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
        <div className="popup-content grid grid-cols-2 gap-4">

            <div className="left-slidebar">
                <div className="mb-4">
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
            </div>

            <div className="right-slidebar">
                <h4 className="mb-2">Seleccionar país</h4>
                <div className="item-list gap-4">
                    {data && data.map((item) => (
                            <button
                            key={item.id}
                            
                            onClick={() => {
                                setactiveCountry(item.id);
                                setFormData(prev => ({ ...prev, country_id: item.id }));
                              }}
                              
                            className={`w-full flex items-center gap-3 p-3 mb-2 rounded-lg transition-all duration-200 border-2 ${
                                activeCountry === item.id
                                ? 'Btn-category-select text-white shadow-lg'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium">{item.name}</span>
                          </button>
                    ))}
                </div>
            </div>
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