import { lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useDispatch, useSelector } from "react-redux";
import { PERMISOS_ADMIN } from "../../utils/constants";
import { fetchRoles } from "../../store/admin/roleSlice";
import { fetchPermissions, fetchPermissionsForm } from "../../store/admin/permissionSlice";

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

const Private = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.permisos?.includes(PERMISOS_ADMIN.ADMIN_ROL_Y_PERMISO)) {
      dispatch(fetchRoles());
      dispatch(fetchPermissions());
      dispatch(fetchPermissionsForm());
    }
  }, [user, dispatch]);


  return (
    <AppLayout>
      <Routes>
        <Route path="/inicio" element={<Inicio />} />

        {/* Rutas para admin usuarios */}
        <Route path="/usuarios" element={<UserList />} />
        <Route path="/usuarios/crear" element={<UserCreate />} />
        <Route path="/usuarios/editar/:id" element={<UserEdit />} />

        {/* Rutas para admin roles y permisos */}
        <Route path="/roles" element={<RolesPermissionsPage />} />
        <Route path="/roles/crear" element={<RolesPermissionsCreate />} />
        <Route path="/roles/editar/:id" element={<RolesPermissionsEdit />} />

        {/* Rutas para admin areas */}
        <Route path="/areas" element={<AreaList />} />
        <Route path="/areas/crear" element={<AreaCreate />} />
        <Route path="/areas/editar/:id" element={<AreaEdit />} />

        {/* <Route path="/modulos" element={<Modulos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/formulario" element={<Formularios />} />
        <Route path="/administracion" element={<Administracion />} /> */}
      </Routes>
    </AppLayout>
  );
};

export default Private;
