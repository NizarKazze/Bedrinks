import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';

const PopupContext = createContext();

// Hook personalizado para usar el popup
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup debe usarse dentro de PopupProvider');
  }
  return context;
};

// Provider del popup
export const PopupProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [title, setTitle] = useState('');

  const openPopup = (component, popupTitle = '') => {
    setContent(component);
    setTitle(popupTitle);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null);
      setTitle('');
    }, 300);
  };

  return (
    <PopupContext.Provider value={{ openPopup, closePopup, isOpen }}>
      {children}
      {isOpen && (
        <Popup title={title} onClose={closePopup}>
          {content}
        </Popup>
      )}
    </PopupContext.Provider>
  );
};

const Popup = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* ======= Overlay ======== */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* ======= Content ======= */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">

        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>

      </div>
    </div>
  );
};

const FormularioEjemplo = ({ onSubmit }) => {
  const { closePopup } = usePopup();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (formData.nombre && formData.email && formData.mensaje) {
      if (onSubmit) {
        onSubmit(formData);
      }
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
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          rows="4"
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
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

// Otro componente de ejemplo
const InfoComponent = ({ mensaje }) => {
  const { closePopup } = usePopup();
  
  return (
    <div className="space-y-4">
      <p className="text-gray-700">{mensaje}</p>
      <div className="flex justify-end">
        <button
          onClick={closePopup}
          className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

// Componente principal de demostración
const App = () => {
  const { openPopup } = usePopup();

  const handleFormSubmit = (data) => {
    console.log('Datos del formulario:', data);
    alert(`¡Formulario enviado!\n\nNombre: ${data.nombre}\nEmail: ${data.email}`);
  };

  const abrirFormulario = () => {
    openPopup(
      <FormularioEjemplo onSubmit={handleFormSubmit} />,
      'Formulario de Contacto'
    );
  };

  const abrirInfo = () => {
    openPopup(
      <InfoComponent mensaje="Este es un popup con información. Puedes pasar cualquier componente React como contenido." />,
      'Información'
    );
  };

  const abrirComponentePersonalizado = () => {
    const ComponenteCustom = () => (
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <h3 className="text-xl font-bold text-gray-800">¡Componente Personalizado!</h3>
        <p className="text-gray-600">
          Puedes crear y pasar cualquier componente al popup.
        </p>
      </div>
    );

    openPopup(<ComponenteCustom />, 'Componente Custom');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Sistema de Popup Reutilizable
        </h1>
        <p className="text-gray-600 mb-8">
          Haz clic en cualquier botón para abrir un popup con diferentes componentes
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={abrirFormulario}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="text-4xl mb-2">📝</div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              Abrir Formulario
            </h3>
            <p className="text-sm text-gray-600">
              Popup con un formulario de contacto
            </p>
          </button>

          <button
            onClick={abrirInfo}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-green-200 hover:border-green-400"
          >
            <div className="text-4xl mb-2">ℹ️</div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              Abrir Información
            </h3>
            <p className="text-sm text-gray-600">
              Popup con componente de información
            </p>
          </button>

          <button
            onClick={abrirComponentePersonalizado}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 hover:border-purple-400"
          >
            <div className="text-4xl mb-2">✨</div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              Componente Custom
            </h3>
            <p className="text-sm text-gray-600">
              Popup con componente personalizado
            </p>
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ¿Cómo usar?
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>1. Envuelve tu app con el PopupProvider</p>
            <p>2. Usa el hook usePopup() en tus componentes</p>
            <p>3. Llama a openPopup(componente, título) para abrir el popup</p>
            <p>4. Llama a closePopup() para cerrarlo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportar el App envuelto en el Provider
export default function AppWithPopup() {
  return (
    <PopupProvider>
      <App />
    </PopupProvider>
  );
}