import { api } from "../api";

export const moduleService = {
  // Obtener todos los módulos
  getCategorias: async () => {
    try {
      const response = await api.get("/categoria/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener los módulos"
      );
    }
  },

  // Obtener un módulo específico por ID
  getCategoriaById: async (id) => {
    try {
      const response = await api.get(`/categoria/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener el módulo"
      );
    }
  },

  // Crear nuevo módulo
  createCategoria: async (Data) => {
    try {
      const response = await api.post("/categoria/", Data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear el módulo"
      );
    }
  },

  // Actualizar módulo
  updateCategoria: async (id, updatedData) => {
    try {
      const response = await api.patch(`/categoria/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar el módulo"
      );
    }
  },
};
