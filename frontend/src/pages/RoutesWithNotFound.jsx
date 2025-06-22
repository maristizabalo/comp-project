import { Route, Routes } from "react-router-dom";
import { WarningOutlined } from '@ant-design/icons';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <WarningOutlined size="100px" className="text-red-600" />
      <h1 className="text-4xl font-bold mt-4">Página No Encontrada</h1>
      <p className="text-lg mt-2">Lo sentimos, la ruta que estás buscando no existe.</p>
      <p className="text-lg mt-2">Por favor, verifica la URL o regresa a la página principal.</p>
    </div>
  );
};

const RoutesWithNotFound = ({children}) => {
  return (
    <Routes>
      {children}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesWithNotFound;