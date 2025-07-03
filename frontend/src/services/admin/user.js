import { api } from "../api";

export const usersService = {
  // Obtener todos los usuarios
  getUsuarios: async () => {
    try {
      const response = await api.get("/usuario/");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener los usuarios"
      );
    }
  },

  // Crear nuevo usuario
  createUsuario: async (usuarioData) => {
    try {
      const response = await api.post("/usuario/", usuarioData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear el usuario"
      );
    }
  },

  // Actualizar usuario
  updateUsuario: async (id, updatedData) => {
    try {
      const response = await api.put(`/usuario/${id}/`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar el usuario"
      );
    }
  },

  // Desactivar usuario
  deactivateUsuario: async (id) => {
    try {
      const response = await api.patch(`/usuario/${id}/`, {
        activo: false,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al desactivar el usuario"
      );
    }
  },
};