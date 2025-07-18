import { useState } from "react";
import { Form, Input, Button, Select, Switch, Breadcrumb, message, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usersService } from "../../../services/admin/user";

const { Option } = Select;

const UserCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ldapOptions, setLdapOptions] = useState([]);
  const [ldapLoaded, setLdapLoaded] = useState(false);
  const [ldapLoading, setLdapLoading] = useState(false); // nuevo estado

  const handleSearchLDAP = async (value) => {
    if (!value || value.length < 3) return;
    setLdapLoading(true); // inicia loading
    try {
      const results = await usersService.buscarEnLDAP(value);
      setLdapOptions(results);
    } catch (error) {
      message.error("Error al buscar en LDAP");
    } finally {
      setLdapLoading(false); // termina loading
    }
  };

  const handleSelectLDAPUser = (usuario) => {
    const selected = ldapOptions.find((u) => u.usuario === usuario);
    if (selected) {
      form.setFieldsValue({
        ...selected,
        "activoLdap": usuario.activo
      });
      setLdapLoaded(true);
      message.success("Usuario cargado desde LDAP");
    }
  };

  const onFinish = (values) => {
    console.log("Crear usuario con:", values);
    // Aquí llamas a usersService.createUsuario(values) y manejas la navegación y feedback
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 xl:p-12 bg-white min-h-[85vh] rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <Breadcrumb
          items={[{ title: "Usuarios", href: "/usuarios" }, { title: "Crear" }]}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="w-full"
      >
        <Form.Item
          name="usuario"
          label="Buscar usuario LDAP"
          rules={[{ required: true, message: "Este campo es requerido" }]}
        >
          <Select
            showSearch
            placeholder="Buscar por usuario o nombre completo"
            onSearch={handleSearchLDAP}
            onSelect={handleSelectLDAPUser}
            filterOption={false}
            notFoundContent={ldapLoading ? <Spin size="small" /> : null}
            loading={ldapLoading}
          >
            {ldapOptions.map((user) => (
              <Option key={user.usuario} value={user.usuario}>
                {user.nombreCompleto}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Nombre completo" name="nombreCompleto">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Correo institucional" name="correo">
          <Input disabled />
        </Form.Item>

        <Form.Item label="LDAP activo" name="activoLdap">
          <Switch disabled />
        </Form.Item>

        <Form.Item
          label="¿Usuario activo?"
          name="activo"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Roles asignados"
          name="roles"
          rules={[{ required: true, message: "Debes asignar al menos un rol" }]}
        >
          <Select mode="multiple" placeholder="Selecciona uno o más roles">
            <Option value="admin">Administrador</Option>
            <Option value="editor">Editor</Option>
            <Option value="visor">Visor</Option>
            {/* Idealmente traídos desde la API */}
          </Select>
        </Form.Item>

        <div className="flex justify-end text-prima">
          <Button type="primary" htmlType="submit">
            Crear Usuario
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UserCreate;
