import * as XLSX from 'xlsx';

// Función para exportar a Excel
export const exportToExcel = (productsToExport) => {
  // Preparar los datos para exportar
  const dataToExport = productsToExport.map(product => {
    const margenEuros = product.price - product.coste;
    const margenPorc = product.coste > 0 ? (margenEuros / product.coste) * 100 : 0;
    const precioPVPIVA = product.price * (1 + (product.iva / 100));
    
    return {
      'Estado': product.estado,
      'Código': product.code,
      'Nombre': product.name,
      'Bodega': getOptionName("wineries", product.winery_id),
      'Tipo': getOptionName("types", product.category_id),
      'D.O.': getOptionName("denominations", product.denomination_id),
      'Añada': getOptionName("vintages", product.vintage_id),
      'Formato': product.format,
      'UVA': Array.isArray(product.grape) 
        ? product.grape.map(g => g.name).join(", ") 
        : "",
      'Rating': product.rating,
      'Precio': product.price,
      'Coste': product.coste,
      'MGN€': margenEuros.toFixed(2),
      'MGN%': margenPorc.toFixed(2),
      'IVA': product.iva,
      'TARIFA': precioPVPIVA.toFixed(2)
    };
  });

  // Crear el libro de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  // Ajustar anchos de columna
  const columnWidths = [
    { wch: 10 }, // Estado
    { wch: 12 }, // Código
    { wch: 30 }, // Nombre
    { wch: 20 }, // Bodega
    { wch: 15 }, // Tipo
    { wch: 15 }, // D.O.
    { wch: 10 }, // Añada
    { wch: 12 }, // Formato
    { wch: 25 }, // UVA
    { wch: 8 },  // Rating
    { wch: 10 }, // Precio
    { wch: 10 }, // Coste
    { wch: 10 }, // MGN€
    { wch: 10 }, // MGN%
    { wch: 8 },  // IVA
    { wch: 12 }  // TARIFA
  ];
  worksheet['!cols'] = columnWidths;

  // Generar el archivo
  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `productos_${fecha}.xlsx`);
};
