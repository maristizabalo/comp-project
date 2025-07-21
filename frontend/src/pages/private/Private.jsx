import { lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useDispatch, useSelector } from "react-redux";
import { PERMISOS_ADMIN } from "../../utils/constants";
import { fetchRoles } from "../../store/admin/roleSlice";
import { fetchPermissions, fetchPermissionsForm } from "../../store/admin/permissionSlice";
import { filterRoutesByPermissions } from "../../utils/filterRoutesByPermissions";
import { appRoutes } from "../../utils/routesConfig";

const Inicio = lazy(() => import("./Inicio"));
const UserList = lazy(() => import("./admin/user/UserList"));
const UserCreate = lazy(() => import("./admin/user/UserCreate"));
const UserEdit = lazy(() => import("./admin/user/UserEdit"));

const RolesPermissionsPage = lazy(() => import("./admin/rol/RolesPermissionsPage"));
const RolesPermissionsEdit = lazy(() => import("./admin/rol/RolesPermissionsEdit"));
const RolesPermissionsCreate = lazy(() => import("./admin/rol/RolesPermissionsCreate"));

const AreaList = lazy(() => import("./admin/area/AreaList"));
const AreaCreate = lazy(() => import("./admin/area/AreaCreate"));
const AreaEdit = lazy(() => import("./admin/area/AreaEdit"));

const Unauthorized = lazy(() => import("../../components/layout/Unauthorized"));

const routeComponents = {
  "/inicio": <Inicio />,
  "/usuarios": <UserList />,
  "/usuarios/crear": <UserCreate />,
  "/usuarios/editar/:id": <UserEdit />,
  "/roles": <RolesPermissionsPage />,
  "/roles/crear": <RolesPermissionsCreate />,
  "/roles/editar/:id": <RolesPermissionsEdit />,
  "/areas": <AreaList />,
  "/areas/crear": <AreaCreate />,
  "/areas/editar/:id": <AreaEdit />,
};

const Private = () => {
  const dispatch = useDispatch();
  const userPermissions = useSelector((state) => state.auth.user?.permisos || []);

  useEffect(() => {
    if (userPermissions.includes(PERMISOS_ADMIN.ADMIN_ROL_Y_PERMISO)) {
      dispatch(fetchRoles());
      dispatch(fetchPermissions());
      dispatch(fetchPermissionsForm());
    }
  }, [userPermissions, dispatch]);

  const filteredRoutes = filterRoutesByPermissions(appRoutes, userPermissions);

  const flattenRoutes = (routes) =>
    routes.flatMap((route) => (route.children ? route.children : route));

  const finalRoutes = flattenRoutes(filteredRoutes);

  const permissionById = Object.entries(PERMISOS_ADMIN).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
  const userPermissionsStrings = userPermissions.map((p) => permissionById[p]);

  return (
    <AppLayout>
      <Routes>
        {Object.keys(routeComponents).map((path) => {
          const route = finalRoutes.find((r) => r.key === path);
          const requiredPermission = route?.permission;
          const isAllowed =
            !requiredPermission || userPermissionsStrings.includes(requiredPermission);
          return (
            <Route
              key={path}
              path={path}
              element={isAllowed ? routeComponents[path] : <Unauthorized />}
            />
          );
        })}
      </Routes>
    </AppLayout>
  );
};

export default Private;
