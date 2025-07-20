import { useNavigate } from "react-router-dom";
import { Form, message } from "antd";
import { rolService } from "../../../../services/admin/rol";
import RoleForm from "../../../../components/admin/rol/RoleForm";
import { useState } from "react";

const RolesPermissionsCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleFinish = async (values) => {
    setLoadingSubmit(true);
    try {
      await rolService.createRol(values);
      message.success("Rol creado correctamente.");
      navigate("/roles");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const permisosOptions = [
    { label: "Permiso 1", value: 1 },
    { label: "Permiso 2", value: 2 },
    { label: "Permiso 3", value: 3 },
  ];

  const permisosFormularioOptions = [
    { label: "Formulario 1", value: 1 },
    { label: "Formulario 2", value: 2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Crear Rol</h1>

      <RoleForm
        form={form}
        permisosOptions={permisosOptions}
        permisosFormularioOptions={permisosFormularioOptions}
        onFinish={handleFinish}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default RolesPermissionsCreate;
