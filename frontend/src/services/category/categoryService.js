import { api } from "../api";

export const categoryService = {
  // Obtener todas las categorías
  getCategorias: async () => {
    try {
      const response = await api.get("/categoria/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener las categorías"
      );
    }
  },

  // Obtener una categoría específica por ID
  getCategoriaById: async (id) => {
    try {
      const response = await api.get(`/categoria/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener la categoría"
      );
    }
  },

  // Crear nueva categoría
  createCategoria: async (categoriaData) => {
    try {
      const response = await api.post("/categoria/", categoriaData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear la categoría"
      );
    }
  },

  // Actualizar categoría
  updateCategoria: async (id, updatedData) => {
    try {
      const response = await api.patch(`/categoria/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar la categoría"
      );
    }
  },
};
