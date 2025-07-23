import { api } from "../api";

export const tiposCampoService = {
  getTiposCampo: async () => {
    try {
      const response = await api.get("/construccion-formulario/tipos/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener los tipos de campo"
      );
    }
  },
};
