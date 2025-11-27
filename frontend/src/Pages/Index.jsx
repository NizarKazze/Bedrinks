import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Download, FileText, Plus } from 'lucide-react';
import { ProposalContext } from '../Components/Context/ProposalProvider';
import { useContext } from "react";

const SistemaPropuestas = ({sele}) => {

  const {
    selectedClient,
    setSelectedClient,
    selectedProducts: productos,
    setSelectedProducts: setProductos
  } = useContext(ProposalContext);

  const [datosEmpresa, setDatosEmpresa] = useState({
    nombre: 'Mi Empresa S.L.',
    direccion: 'Calle Principal, 123',
    telefono: '+34 123 456 789',
    email: 'contacto@miempresa.com'
  });

  const [datosCliente, setDatosCliente] = useState({
    nombre: 'Cliente Ejemplo',
    empresa: 'Empresa Cliente S.A.',
    email: 'cliente@ejemplo.com'
  });

  const eliminarProducto = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const eliminarTodo = () => {
    if (window.confirm('¿Estás seguro de eliminar todos los productos?')) {
      setProductos([]);
    }
  };

  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + (p.cantidad * p.precioUnitario), 0);
  };

  const descargarPDF = () => {
    window.print();
  };

  // Función para dividir productos en páginas (aproximadamente 8 productos por página)
  const dividirEnPaginas = () => {
    const productosPorPagina = 8;
    const paginas = [];
    for (let i = 0; i < productos.length; i += productosPorPagina) {
      paginas.push(productos.slice(i, i + productosPorPagina));
    }
    return paginas.length > 0 ? paginas : [[]];
  };

  const paginas = dividirEnPaginas();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Barra de herramientas */}
      <div className="max-w-4xl mx-auto mb-6 bg-white rounded-lg shadow-md p-4 print:hidden">
        <div className="flex gap-3 justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={descargarPDF}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={18} />
              Descargar PDF
            </button>
            <button
              onClick={eliminarTodo}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={productos.length === 0}
            >
              <Trash2 size={18} />
              Eliminar Todo
            </button>
          </div>
          <div className="text-gray-600 font-medium">
            {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Preview de páginas A4 */}
      <div className="space-y-6">
        {paginas.map((productosEnPagina, indexPagina) => (
          <div
            key={indexPagina}
            className="w-[210mm] h-[297mm] mx-auto bg-white shadow-lg p-12 relative"
            style={{ 
              pageBreakAfter: indexPagina < paginas.length - 1 ? 'always' : 'auto'
            }}
          >
            {/* Encabezado */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    PROPUESTA COMERCIAL
                  </h1>
                  <div className="text-gray-600 text-sm">
                    <p className="font-semibold">{datosEmpresa.nombre}</p>
                    <p>{datosEmpresa.direccion}</p>
                    <p>{datosEmpresa.telefono} | {datosEmpresa.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">{new Date().toLocaleDateString('es-ES')}</p>
                  <p className="text-sm text-gray-500 mt-2">Propuesta #</p>
                  <p className="font-semibold">2024-001</p>
                </div>
              </div>
            </div>

            {/* Datos del cliente - Solo en primera página */}
            {indexPagina === 0 && (
              <div className="mb-6 border-l-4 border-orange-500 pl-4 py-2">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">CLIENTE</h2>
                <p className="font-semibold">{datosCliente.nombre}</p>
                <p className="text-sm text-gray-600">{datosCliente.empresa}</p>
                <p className="text-sm text-gray-600">{datosCliente.email}</p>
              </div>
            )}

            {/* Tabla de productos */}
            <div className="mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold text-gray-700">Producto</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Descripción</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Cant.</th>
                    <th className="text-right p-3 font-semibold text-gray-700">P. Unit.</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Total</th>
                    <th className="text-center p-3 font-semibold text-gray-700 print:hidden">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosEnPagina.length > 0 ? (
                    productosEnPagina.map((producto) => (
                      <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{producto.name}</td>
                        <td className="p-3 text-gray-600">{producto.description}</td>
                        <td className="p-3 text-right text-gray-700">{producto.price}€</td>
                        <td className="p-3 text-center print:hidden">
                          <button
                            onClick={() => eliminarProducto(producto.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400">
                        No hay productos en esta propuesta
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie de página */}
            <div className="absolute bottom-12 left-12 right-12 text-center text-xs text-gray-500 border-t pt-4">
              <p>Esta propuesta tiene una validez de 30 días desde la fecha de emisión</p>
              <p className="mt-1">Página {indexPagina + 1} de {paginas.length}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SistemaPropuestas;