import { api } from "../api";

export const rolService = {
    
  // Obtener todos los roles
  getRoles: async () => {
    try {
      const response = await api.get("/rol/");
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Error al obtener los roles"
      );
    }
  },

  // Crear un nuevo rol
  createRol: async (rolData) => {
    try {
      const response = await api.post("/rol/", rolData);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Error al crear el rol"
      );
    }
  },

  // Actualizar un rol
  updateRol: async (id, updatedData) => {
    try {
      const response = await api.put(`/rol/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Error al actualizar el rol"
      );
    }
  },
};
