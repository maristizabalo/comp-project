import { useEffect, useState } from "react";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { usersService } from "../../../../services/admin/user";
import { rolService } from "../../../../services/admin/rol";
import UserForm from "../../../../components/admin/user/UserForm";
import { useFetch } from "../../../../hooks/use-fetch";

const UserCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [ldapOptions, setLdapOptions] = useState([]);

  const {
    loading: loadingRoles,
    data: rolesOptions,
    fetchData: fetchRoles,
  } = useFetch();

  const {
    loading: ldapLoading,
    fetchData: fetchLDAP,
  } = useFetch();

  const {
    loading: loadingSubmit,
    fetchData: fetchCreateUser,
  } = useFetch();

  // Cargar roles
  useEffect(() => {
    fetchRoles(rolService.getRoles).catch(() =>
      message.error("Error al cargar los roles")
    );
  }, [fetchRoles]);

  // Buscar LDAP
  const handleSearchLDAP = async (value) => {
    if (!value || value.length < 3) return;
    try {
      const results = await fetchLDAP(usersService.buscarEnLDAP, value);
      setLdapOptions(results);
    } catch (error) {
      message.error("Error al buscar en LDAP");
    }
  };

  // Seleccionar usuario LDAP
  const handleSelectLDAPUser = (usuario) => {
    const selected = ldapOptions.find((u) => u.usuario === usuario);
    if (selected) {
      form.setFieldsValue({
        ...selected,
        activo: true,
      });
    }
  };

  // Crear usuario
  const onFinish = async (values) => {
    try {
      await fetchCreateUser(usersService.createUsuario, values);
      message.success("Usuario creado exitosamente");
      form.resetFields();
      navigate("/usuarios");
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto">
      <UserForm
        form={form}
        onFinish={onFinish}
        rolesOptions={rolesOptions || []}
        loadingRoles={loadingRoles}
        ldapOptions={ldapOptions}
        ldapLoading={ldapLoading}
        onSearchLDAP={handleSearchLDAP}
        onSelectLDAPUser={handleSelectLDAPUser}
        showLDAP={true}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
};

export default UserCreate;
