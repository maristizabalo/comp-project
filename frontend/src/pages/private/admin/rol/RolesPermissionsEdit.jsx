import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, message } from "antd";
import { rolService } from "../../../../services/admin/rol";
import RoleForm from "../../../../components/admin/rol/RoleForm";

const RolesPermissionsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchRole = async () => {
    setLoading(true);
    try {
      const role = await rolService.getRoleById(id);
      form.setFieldsValue({
        nombre: role.nombre,
        descripcion: role.descripcion,
        permisos: role.permisos,
        permisosFormulario: role.permisosFormulario,
      });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [id]);

  const handleFinish = async (values) => {
    setLoadingSubmit(true);
    try {
      await rolService.updateRol(id, values);
      message.success("Rol actualizado correctamente.");
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
      <h1 className="text-xl font-bold">Editar Rol</h1>

      <RoleForm
        form={form}
        initialValues={{}}
        permisosOptions={permisosOptions}
        permisosFormularioOptions={permisosFormularioOptions}
        onFinish={handleFinish}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default RolesPermissionsEdit;
