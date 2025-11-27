import { createContext, useState, useEffect } from "react";

export const ProposalContext = createContext();

export function ProposalProvider({ children }) {
  // Recuperar datos del localStorage al cargar
  const [selectedClient, setSelectedClient] = useState(() => {
    const savedClient = localStorage.getItem("selectedClient");
    return savedClient ? JSON.parse(savedClient) : null;
  });

  const [selectedProducts, setSelectedProducts] = useState(() => {
    const savedProducts = localStorage.getItem("selectedProducts");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // Guardar selectedClient en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("selectedClient", JSON.stringify(selectedClient));
  }, [selectedClient]);

  // Guardar selectedProducts en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  return (
    <ProposalContext.Provider value={{
      selectedClient,
      setSelectedClient,
      selectedProducts,
      setSelectedProducts
    }}>
      {children}
    </ProposalContext.Provider>
  );
}
