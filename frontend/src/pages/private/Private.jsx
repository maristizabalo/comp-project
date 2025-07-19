import { Route, Routes } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import Inicio from "./Inicio";
import UserList from "./admin/user/UserList";
import UserCreate from "./admin/user/UserCreate";
import UserEdit from "./admin/user/UserEdit";

const Private = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/inicio" element={<Inicio />} />

        {/* Rutas para admin usuarios */}
        <Route path="/usuarios" element={<UserList />} />
        <Route path="/usuarios/crear" element={<UserCreate />} />
        <Route path="/usuarios/editar/:id" element={<UserEdit />} />


        {/* <Route path="/modulos" element={<Modulos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/formulario" element={<Formularios />} />
        <Route path="/administracion" element={<Administracion />} /> */}
      </Routes>
    </AppLayout>
  );
};

export default Private;
