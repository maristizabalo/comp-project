import { lazy, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useDispatch, useSelector } from "react-redux";
import { PERMISOS_ADMIN } from "../../utils/constants";
import { fetchRoles } from "../../store/admin/roleSlice";
import { fetchPermissions, fetchPermissionsForm } from "../../store/admin/permissionSlice";
import { fetchTiposCampo } from "../../store/form/tiposCamposSlice";

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

const CategoryList = lazy(() => import("./category/CategoryList"));
const CategoryCreate = lazy(() => import("./category/CategoryCreate"));
const CategoryEdit = lazy(() => import("./category/CategoryEdit"));

const FormList = lazy(() => import("./form/FormList"));
const FormCreate = lazy(() => import("./form/FormCreate"));
const FormEntry = lazy(() => import("./form/FormEntry"));
const FormResponses = lazy(() => import("./form/FormResponses"));

const Unauthorized = lazy(() => import("../../components/layout/Unauthorized"));

const routePermissions = {
  "/inicio": null,

  "/usuarios": "ADMIN_USUARIO",
  "/usuarios/crear": "ADMIN_USUARIO",
  "/usuarios/editar/:id": "ADMIN_USUARIO",

  "/roles": "ADMIN_ROL_Y_PERMISO",
  "/roles/crear": "ADMIN_ROL_Y_PERMISO",
  "/roles/editar/:id": "ADMIN_ROL_Y_PERMISO",

  "/areas": "ADMIN_AREA",
  "/areas/crear": "ADMIN_AREA",
  "/areas/editar/:id": "ADMIN_AREA",

  "/categorias": "ADMIN_CATEGORIA",
  "/categorias/crear": "ADMIN_CATEGORIA",
  "/categorias/editar/:id": "ADMIN_CATEGORIA",

  "/formularios": "ADMIN_FORMULARIO",
  "/formularios/crear": "ADMIN_FORMULARIO",

  "/respuestas": "ADMIN_FORMULARIO",
};

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

  "/categorias": <CategoryList />,
  "/categorias/crear": <CategoryCreate />,
  "/categorias/editar/:id": <CategoryEdit />,
  
  "/formularios": <FormList />,
  "/formularios/crear": <FormCreate />,
  "/formularios/diligenciar/:id": <FormEntry />,
  "/formularios/respuestas/:id": <FormResponses />,
  "/formularios/:formularioId/respuestas/:respuestaId": <FormEntry  />,
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

    if (userPermissions.includes(PERMISOS_ADMIN.ADMIN_FORMULARIO)) {
      dispatch(fetchTiposCampo());
    }
  }, [userPermissions, dispatch]);

  const permissionById = Object.entries(PERMISOS_ADMIN).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});

  const userPermissionsStrings = userPermissions.map((p) => permissionById[p]);

  const isAllowed = (requiredPermission) => {
    return !requiredPermission || userPermissionsStrings.includes(requiredPermission);
  };

  return (
    <AppLayout>
      <Routes>
        {Object.entries(routeComponents).map(([path, component]) => {
          const requiredPermission = routePermissions[path];
          return (
            <Route
              key={path}
              path={path}
              element={isAllowed(requiredPermission) ? component : <Unauthorized />}
            />
          );
        })}
        <Route path="*" element={<Navigate to="/inicio" />} />
      </Routes>
    </AppLayout>
  );
};

export default Private;
