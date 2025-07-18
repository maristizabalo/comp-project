import { useState } from "react";
import { Form, Input, Button, Select, Switch, message, Spin } from "antd";
import { usersService } from "../../../services/admin/user";

const { Option } = Select;

const UserCreate = () => {
  const [form] = Form.useForm();
  const [ldapOptions, setLdapOptions] = useState([]);
  const [ldapLoading, setLdapLoading] = useState(false);
  const [activoLdapChecked, setActivoLdapChecked] = useState(false);

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
      });
      setActivoLdapChecked(selected.activoLdap);
      message.success("Usuario cargado desde LDAP");
    }
  };

  const onFinish = (values) => {
    console.log("Crear usuario con:", values);
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 xl:p-12 bg-white rounded-xl shadow-md w-full mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <Form.Item>
            <div className="w-full rounded-lg border border-gray-300 p-4">
              <div className="w-full flex justify-center mb-4">
                <h3 className="text-center font-medium text-gray-700">
                  Configuración de estado
                </h3>
              </div>
              <div className="grid grid-cols-2 w-full">
                <div className="flex justify-center items-center gap-2">
                  <Form.Item name="activoLdap" valuePropName="checked" noStyle>
                    <Switch checked={activoLdapChecked} disabled />
                  </Form.Item>
                  <span>LDAP activo</span>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Form.Item name="activo" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                  <span>Usuario activo</span>
                </div>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            label="Roles asignados"
            name="roles"
            rules={[
              { required: true, message: "Debes asignar al menos un rol" },
            ]}
          >
            <Select mode="multiple" placeholder="Selecciona uno o más roles">
              <Option value="admin">Administrador</Option>
              <Option value="editor">Editor</Option>
              <Option value="visor">Visor</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="flex justify-center mt-8">
          <Button type="primary" htmlType="submit" className="w-40">
            Crear Usuario
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UserCreate;
