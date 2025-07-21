import { api } from "../api";

export const areaService = {
  // Obtener todas las áreas
  getAreas: async () => {
    try {
      const response = await api.get("/area/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener las áreas"
      );
    }
  },

  // Obtener un área específica por ID
  getAreaById: async (id) => {
    try {
      const response = await api.get(`/area/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener el área"
      );
    }
  },

  // Crear nueva área
  createArea: async (areaData) => {
    try {
      const response = await api.post("/area/", areaData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear el área"
      );
    }
  },

  // Actualizar un área
  updateArea: async (id, updatedData) => {
    try {
      const response = await api.patch(`/area/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar el área"
      );
    }
  },
};
