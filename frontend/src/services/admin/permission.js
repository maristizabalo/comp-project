import { api } from "../api";

export const permissionService = {
  // Obtener todos los permisos
  getPermissions: async () => {
    try {
      const response = await api.get("/permiso/");
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Error al obtener los permisos"
      );
    }
  },

  // Obtener un permiso por ID
  getPermissionById: async (id) => {
    try {
      const response = await api.get(`/permiso/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Error al obtener el permiso"
      );
    }
  },
};
