// pages/admin/UserEdit.jsx
import { useEffect, useState } from "react";
import { Form, message, Spin } from "antd";
import { usersService } from "../../../services/admin/user";
import { rolService } from "../../../services/admin/rol";
import { useParams, useNavigate } from "react-router-dom";
import UserForm from "../../../components/user/UserForm";

const UserEdit = () => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Carga los datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await usersService.getUsuarioById(id);

        const parsedRoles = Array.isArray(user.roles)
          ? user.roles.map((r) => r.rol.id)
          : [];

        const parsedUser = {
          ...user,
          roles: parsedRoles,
        };

        setInitialValues(parsedUser);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        message.error("Error al cargar el usuario");
      }
    };

    fetchUser();
  }, [id]);

  // Establece los valores del formulario cuando initialValues ya existe
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // Carga los roles
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const roles = await rolService.getRoles();
        setRolesOptions(roles);
      } catch (error) {
        message.error("Error al cargar los roles");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const onFinish = async (values) => {
    setLoadingSubmit(true);
    try {
      await usersService.updateUsuario(id, values);
      message.success("Usuario actualizado exitosamente");
      navigate("/usuarios");
    } catch (error) {
      message.error("Error al actualizar el usuario");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!initialValues) {
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
        rolesOptions={rolesOptions}
        loadingRoles={loadingRoles}
        showLDAP={false}
        initialValues={initialValues}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default UserEdit;
