// pages/admin/UserCreate.jsx
import { useEffect, useState } from "react";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { usersService } from "../../../../services/admin/user";
import { rolService } from "../../../../services/admin/rol";
import UserForm from "../../../../components/admin/user/UserForm";

const UserCreate = () => {
  const [form] = Form.useForm();
  const [ldapOptions, setLdapOptions] = useState([]);
  const [ldapLoading, setLdapLoading] = useState(false);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();

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

  const handleSearchLDAP = async (value) => {
    if (!value || value.length < 3) return;
    setLdapLoading(true);
    try {
      const results = await usersService.buscarEnLDAP(value);
      setLdapOptions(results);
    } catch (error) {
      message.error("Error al buscar en LDAP");
    } finally {
      setLdapLoading(false);
    }
  };

  const handleSelectLDAPUser = (usuario) => {
    const selected = ldapOptions.find((u) => u.usuario === usuario);
    if (selected) {
      form.setFieldsValue({
        ...selected,
        activo: true,
      });
    }
  };

  const onFinish = async (values) => {
    setLoadingSubmit(true);
    try {
      await usersService.createUsuario(values);
      message.success("Usuario creado exitosamente");
      form.resetFields();
      navigate("/usuarios");
    } catch (error) {
      message.error("Error al crear el usuario");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full mx-auto">
      <UserForm
        form={form}
        onFinish={onFinish}
        rolesOptions={rolesOptions}
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
