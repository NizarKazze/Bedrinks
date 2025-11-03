import React, { useState } from 'react';
import { useFetch } from '../Hook/useFetch';
import { usePost } from '../Hook/usePost';
import { Plus, Trash2, Edit2, Save, X, Wine, MapPin, Award, Package, Building, Tag, Search } from 'lucide-react';
import Logo from '../assets/BeDrinks-logo.png'
import { usePopup, PopupProvider } from '../Components/Popup';

import { InsertCountryForm, UpdateCountryForm } from '../Components/Country';
import { InsertRegionForm } from '../Components/Regions';

const BtnCategorySelect = ({ tab, activeTab, setActiveTab}) => {
  const Icon = tab.icon;
  return (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 border-2 ${
        activeTab === tab.id
          ? 'Btn-category-select text-white shadow-lg'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{tab.label}</span>
    </button>
  );
};

export const Item = ({ item, level = 0, updateForm, deleteItem}) => (
  <div className='item-container mr-2'>

    <div 
      style={{ marginLeft: `${level * 24}px` }} 
      className=" item-list rounded-lg p-4 flex items-center justify-between border-2 border-gray-200 hover:shadow-md transition-all duration-200"
    >
    
      <div className="flex items-center gap-3">
        {level > 0 && (
          <div className="w-1 h-8 bg-main-color rounded-full"></div>
        )}
        <span className="text-gray-800 font-medium text-lg">{item.name}</span>
      </div>
      
      <div className="btn-edit-container flex gap-2 opacity-0">
        <button className="p-2 bg-main-color text-white rounded-lg">
          <Edit2 className="w-4 h-4" onClick={updateForm}/>
        </button>
        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
          <Trash2 className="w-4 h-4" onClick={deleteItem} />
        </button>
      </div>

    </div>

    {/* ========= Subcategory ========== */}

    {item.children && item.children.length > 0 && (
      <div className="mt-3">
        {level === 0 && (
          <h3 
            style={{ marginLeft: `${(level + 1) * 24}px` }} 
            className="text-sm font-semibold text-main-color uppercase mb-2"
          >
            Subtipos de {item.name}
          </h3>
        )}
        <div className="space-y-4">
          {item.children.map((child) => (
            <Item key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      </div>
    )}
  </div>
);

const ControlPanelApp = () => {
  const [activeTab, setActiveTab] = useState('countries');
  const { openPopup } = usePopup();

  const { data, loading, error, refetch } = useFetch(
    `backend/filters.php?action=${activeTab}`
  );

  const OpenInsertCountryForm = () => {
    openPopup(
      <InsertCountryForm onSuccess={() => refetch()}/>,
      `Añadir ${tabs.find(t => t.id === activeTab).label}`
    );
  };

  const UpdateInsertCountryForm = (countryId) => {
    openPopup(
      <UpdateCountryForm countryId={countryId} onSuccess={() => refetch()}/>,
      `Actualizar ${tabs.find(t => t.id === activeTab).label}`
    );
  };

  const { send: deleteCountrySend } = usePost("backend/filters.php?action=delete_country");

  const OpenInsertRegionForm = () => {
    openPopup(
      <InsertRegionForm />,
      `Añadir ${tabs.find(t => t.id === activeTab).label}`
    );
  };

  const deleteCountry = (id) => {
    // Primer intento sin force
    deleteCountrySend({ id })
      .then((response) => {
        // Si hay warning, preguntar al usuario
        if (response.warning) {
          const confirmed = window.confirm(
            `${response.warning}\n\n¿Deseas eliminar el país y todas sus regiones vinculadas?`
          );
          
          if (confirmed) {
            // Segundo intento con force=true
            deleteCountrySend({ id, force: true })
              .then(() => {
                refetch();
                alert('País eliminado exitosamente');
              })
              .catch(err => console.error("Error al eliminar:", err));
          }
        } else if (response.error) {
          alert('Error: ' + response.error);
        } else {
          // Eliminación exitosa
          refetch();
          alert('País eliminado exitosamente');
        }
      })
      .catch(err => console.error("Error al eliminar:", err));
  };

  const tabs = [
    { id: 'countries', label: 'Países', icon: MapPin, insertForm: OpenInsertCountryForm, updateForm: UpdateInsertCountryForm, deleteItem: deleteCountry },
    { id: 'regions', label: 'Regiones', icon: MapPin, insertForm: OpenInsertRegionForm },
    { id: 'denominations', label: 'Denominaciones', icon: Award },
    { id: 'suppliers', label: 'Proveedores', icon: Package },
    { id: 'wineries', label: 'Bodegas', icon: Building },
    { id: 'category', label: 'Categorías', icon: Tag }
  ];


  return (
    <div className="content mt-16" id='control-panel'>
      <div className="mx-auto w-3/4">

        {/* Header */}
        <div className="mb-10 pb-4 border-b-2 border-gray-200">
          <div className="flex flex-col gap-3 mb-2">
            <div id='logo' className='mb-8'>
              <img src={Logo} alt="Bedrinks" />
            </div>
            <h1 className="text-4xl text-gray-600 border-t-2 pt-4">Panel de Control</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Selectors */}
          <div id='category-selectors'>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Categorías</h2>
            <div className="space-y-4">
              {tabs.map((tab) => (
                <BtnCategorySelect
                  key={tab.id}
                  tab={tab}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">

              <div className="bg-gray-50 p-6 border-b-2 border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Lista de {tabs.find(t => t.id === activeTab).label}
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value=""
                    placeholder="Buscar Elementos..."
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <button
                    className="px-6 py-3 bg-main-color text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Search />
                  </button>
                  <button
                  onClick={tabs.find(t => t.id === activeTab).insertForm}
                    className="px-6 py-3 bg-main-color text-white rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6 bg-white">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-center py-16 text-gray-400">Cargando...</p>
                ) : !data || data.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Wine className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No hay elementos en esta categoría</p>
                    <p className="text-sm mt-2">Agrega el primero usando el formulario de arriba</p>
                  </div>
                ) : (
                  data.map((item) => (
                    <Item 
                      key={item.id} 
                      item={item} 
                      updateForm={() => tabs.find(t => t.id === activeTab).updateForm(item.id)} 
                      deleteItem={() => tabs.find(t => t.id === activeTab)?.deleteItem?.(item.id)}
                    />
                  ))
                )}

                </div>

                {data && data.length > 0 && (
                  <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center text-gray-600">
                    Total: <span className="font-bold text-main-color">{data.length}</span> elementos
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ControlPanel() {
  return (
    <PopupProvider>
      <ControlPanelApp />
    </PopupProvider>
  );
}