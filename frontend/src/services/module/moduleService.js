import { api } from "../api";

export const moduleService = {
  // Obtener todas las categorias
  getCategorias: async () => {
    try {
      const response = await api.get("/categoria/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener los categorías"
      );
    }
  },

  // Obtener un categoría específico por ID
  getCategoriaById: async (id) => {
    try {
      const response = await api.get(`/categoria/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener el categoría"
      );
    }
  },

  // Crear nueva categoría
  createCategoria: async (Data) => {
    try {
      const response = await api.post("/categoria/", Data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear el categoría"
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
        error.response?.data?.message || "Error al actualizar el categoría"
      );
    }
  },
};
