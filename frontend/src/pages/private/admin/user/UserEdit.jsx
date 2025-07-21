import { useEffect, useState } from "react";
import { Form, message, Spin } from "antd";
import { usersService } from "../../../../services/admin/user";
import { rolService } from "../../../../services/admin/rol";
import { useParams, useNavigate } from "react-router-dom";
import UserForm from "../../../../components/admin/user/UserForm";
import { useFetch } from "../../../../hooks/use-fetch";

const UserEdit = () => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Usando tu custom hook
  const {
    loading: loadingUser,
    fetchData: fetchUser,
  } = useFetch();

  const {
    loading: loadingRoles,
    fetchData: fetchRoles,
    data: rolesOptions,
  } = useFetch();

  const {
    loading: loadingSubmit,
    fetchData: fetchUpdateUser,
  } = useFetch();

  // Cargar usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchUser(usersService.getUsuarioById, id);
        const parsedRoles = Array.isArray(user.roles)
          ? user.roles.map((r) => r.rol.id)
          : [];

        setInitialValues({
          ...user,
          roles: parsedRoles,
        });
      } catch (error) {
        message.error("Error al cargar el usuario");
      }
    };

    loadUser();
  }, [fetchUser, id]);

  // Cargar roles
  useEffect(() => {
    fetchRoles(rolService.getRoles).catch(() =>
      message.error("Error al cargar los roles")
    );
  }, [fetchRoles]);

  // Setear valores del formulario
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // Submit
  const onFinish = async (values) => {
    try {
      await fetchUpdateUser(usersService.updateUsuario, id, values);
      message.success("Usuario actualizado exitosamente");
      navigate("/usuarios");
    } catch (error) {
      message.error(error.message);
    }
  };

  if (!initialValues || loadingUser) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto">
      <UserForm
        form={form}
        onFinish={onFinish}
        rolesOptions={rolesOptions || []}
        loadingRoles={loadingRoles}
        showLDAP={false}
        initialValues={initialValues}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default UserEdit;
