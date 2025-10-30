import { usePopup } from "./Popup";

export const FormBottom = ({handleSubmit}) => {
  const { closePopup } = usePopup();

  return (
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
  )
}

export const FormInput = ({label, value, name, type, onChange}) => {
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

}