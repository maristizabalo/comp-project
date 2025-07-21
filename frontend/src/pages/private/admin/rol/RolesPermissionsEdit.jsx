import { useEffect } from "react";
import { Form, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { rolService } from "../../../../services/admin/rol";
import RoleForm from "../../../../components/admin/rol/RoleForm";
import { useFetch } from "../../../../hooks/use-fetch";

const RolesPermissionsEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: role,
    loading,
    fetchData: fetchRoleById,
  } = useFetch();

  const {
    loading: loadingSubmit,
    fetchData: updateRole,
  } = useFetch();

  useEffect(() => {
    fetchRoleById(rolService.getRoleById, id);
  }, [fetchRoleById, id]);

  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        nombre: role.nombre,
        descripcion: role.descripcion,
        permisos: role.permisos,
        permisosFormulario: role.permisosFormulario,
      });
    }
  }, [role, form]);

  const onFinish = async (values) => {
    try {
      await updateRole(rolService.updateRol, id, values);
      message.success("Rol actualizado correctamente.");
      navigate("/roles");
    } catch (error) {
      message.error(error.message);
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

  if (loading || !role) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto max-w-4xl">
      <RoleForm
        form={form}
        initialValues={{
          nombre: role.nombre,
          descripcion: role.descripcion,
          permisos: role.permisos,
          permisosFormulario: role.permisosFormulario,
        }}
        permisosOptions={permisosOptions}
        permisosFormularioOptions={permisosFormularioOptions}
        onFinish={onFinish}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default RolesPermissionsEdit;
