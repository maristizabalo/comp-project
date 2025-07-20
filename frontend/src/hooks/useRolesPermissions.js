import { useEffect, useState } from "react";
import { rolService } from "../services/admin/rol";

export const useRolesPermissions = () => {
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    const data = await rolService.getRoles();
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    reloadRoles: fetchRoles,
  };
};
