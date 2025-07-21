import { useNavigate } from "react-router-dom";
import { Form, message } from "antd";
import { rolService } from "../../../../services/admin/rol";
import RoleForm from "../../../../components/admin/rol/RoleForm";
import { useFetch } from "../../../../hooks/use-fetch";
import { useSelector } from "react-redux";

const RolesPermissionsCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const permissions = useSelector((state) => state.admin.permissions.permissions);
  const permissionsForm = useSelector((state) => state.admin.permissions.permissionsForm);

  const { loading: loadingSubmit, fetchData } = useFetch();

  const onFinish = async (values) => {
    try {
      await fetchData(rolService.createRol, values);
      message.success("Rol creado correctamente.");
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

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto max-w-4xl">
      <RoleForm
        form={form}
        permisosOptions={permisosOptions}
        permisosFormularioOptions={permisosFormularioOptions}
        onFinish={onFinish}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default RolesPermissionsCreate;
