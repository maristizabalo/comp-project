import { useEffect } from "react";
import { Form, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { rolService } from "../../../../services/admin/rol";
import RoleForm from "../../../../components/admin/rol/RoleForm";
import { useFetch } from "../../../../hooks/use-fetch";
import { useSelector } from "react-redux";

const RolesPermissionsEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const permissions = useSelector((state) => state.admin.permissions.permissions);
  const permissionsForm = useSelector((state) => state.admin.permissions.permissionsForm);


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


  const permisosOptions = permissions.map((p) => ({
    label: p.nombre,
    value: p.id,
  }));

  const permisosFormularioOptions = permissionsForm.map((p) => ({
    label: `${p.nombre} (${p.tipo})`,
    value: p.id,
  }));

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
