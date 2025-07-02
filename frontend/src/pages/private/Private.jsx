import { Route, Routes } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout"
import Inicio from "./Inicio";

const Private = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/inicio" element={<Inicio />} />
        {/* <Route path="/modulos" element={<Modulos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/formulario" element={<Formularios />} />
        <Route path="/administracion" element={<Administracion />} /> */}
      </Routes>
    </AppLayout>
  );
};

export default Private;
