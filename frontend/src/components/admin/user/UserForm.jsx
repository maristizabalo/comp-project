// components/admin/UserForm.jsx
import { useEffect, useState } from "react";
import { Form, Input, Button, Select, Switch, Spin } from "antd";

const { Option } = Select;

const UserForm = ({
  initialValues = {},
  onFinish,
  rolesOptions = [],
  loadingRoles = false,
  ldapOptions = [],
  ldapLoading = false,
  onSearchLDAP,
  onSelectLDAPUser,
  showLDAP = true,
  form,
  loadingSubmit = false,
}) => {
  const [activoLdapChecked, setActivoLdapChecked] = useState(
    initialValues.activoLdap || false
  );

  useEffect(() => {
    if (initialValues.activoLdap !== undefined) {
      setActivoLdapChecked(initialValues.activoLdap);
    }
  }, [initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showLDAP && (
          <Form.Item
            name="usuario"
            label="Buscar usuario LDAP"
            rules={[{ required: true, message: "Este campo es requerido" }]}
          >
            <Select
              showSearch
              placeholder="Buscar por usuario o nombre completo"
              onSearch={onSearchLDAP}
              onSelect={onSelectLDAPUser}
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
        )}

        <Form.Item label="Usuario" name="usuario">
          <Input disabled />
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
          rules={[{ required: true, message: "Debes asignar al menos un rol" }]}
        >
          <Select
            mode="multiple"
            placeholder="Selecciona uno o más roles"
            loading={loadingRoles}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {rolesOptions.map((rol) => (
              <Option key={rol.id} value={rol.id}>
                {rol.nombre}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          type="primary"
          htmlType="submit"
          className="w-40"
          loading={loadingSubmit}
        >
          Guardar
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;
