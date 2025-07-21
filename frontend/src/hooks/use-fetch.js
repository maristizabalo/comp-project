import { useState, useCallback } from "react";

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async (apiCallback, ...params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCallback(...params);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Ocurrió un error inesperado";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, fetchData };
};
