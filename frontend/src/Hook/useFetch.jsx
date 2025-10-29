import { useState, useEffect, useCallback } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const fetchData = useCallback(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, reloadCounter]);

  // Función para recargar datos
  const refetch = () => {
    setReloadCounter((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
}
