import { useEffect, useState } from "react";
import { Form, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { rolService } from "../../../../services/admin/rol";
import RoleForm from "../../../../components/admin/rol/RoleForm";

const RolesPermissionsEdit = () => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const role = await rolService.getRoleById(id);
        setInitialValues({
          nombre: role.nombre,
          descripcion: role.descripcion,
          permisos: role.permisos,
          permisosFormulario: role.permisosFormulario,
        });
      } catch (error) {
        message.error("Error al cargar el rol");
      }
    };
    fetchRole();
  }, [id]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values) => {
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

  if (!initialValues) {
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
        initialValues={initialValues}
        permisosOptions={permisosOptions}
        permisosFormularioOptions={permisosFormularioOptions}
        onFinish={onFinish}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default RolesPermissionsEdit;
