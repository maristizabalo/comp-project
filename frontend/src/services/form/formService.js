import { api } from "../api";

export const formService = {
  // Obtener todos los formularios
  getFormularios: async () => {
    try {
      const response = await api.get("/formulario/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener los formularios"
      );
    }
  },
};
