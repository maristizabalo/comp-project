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


  // Crear un nuevo formulario
  createFormulario: async (formularioData) => {
    try {
      const response = await api.post("/construccion-formulario/", formularioData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear el formulario"
      );
    }
  },


};
