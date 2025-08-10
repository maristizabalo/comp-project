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

  //Obtener formulario por id
  getFormularioById: async (formularioId) => {
    try {
      const response = await api.get(`/construccion-formulario/${formularioId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear el formulario"
      );
    }
  },

  // Crear una nueva respuesta de formulario
  createRespuestaFormulario: async (payload) => {
    try {
      const response = await api.post("/respuesta/", payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al enviar la respuesta del formulario"
      );
    }
  },

  getRespuestasTabla: async (formularioId, { page = 1, pageSize = 10 } = {}) => {
    try {
      const res = await api.get(`/respuesta/${formularioId}/tabla/`, {
        params: { page, page_size: pageSize },
      });
      return res.data;
    } catch (e) {
      throw new Error(e.response?.data?.message || "Error al obtener las respuestas");
    }
  },

  // NUEVO: trae los valores de una respuesta (tipados para hidratar el formulario)
  getRespuestaDetalle: async (respuestaId) => {
    try {
      const res = await api.get(`/respuesta/${respuestaId}/detalle/`);
      return res.data; // { id, formulario: <id>, valores: { [campo_nombre]: <valor tipado> } }
    } catch (e) {
      throw new Error(e.response?.data?.message || "Error al obtener el detalle de la respuesta");
    }
  },
};
