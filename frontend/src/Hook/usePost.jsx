import { useState } from "react";

export function usePost(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Enviar datos por POST (insert/update/delete)
   * @param {Object} body - Objeto con los datos a enviar
   */
  
  const send = async (body = {}) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const json = await res.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, send };
}
