import { Form, Input, Button, Select } from "antd";
const { Option } = Select;

const RoleForm = ({
  form,
  initialValues = {},
  permisosOptions = [],
  permisosFormularioOptions = [],
  onFinish,
  loadingSubmit = false,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          label="Nombre del Rol"
          name="nombre"
          rules={[{ required: true, message: "El nombre es obligatorio" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Descripción" name="descripcion">
          <Input.TextArea rows={3} />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          label="Permisos"
          name="permisos"
          rules={[{ required: true, message: "Debes asignar al menos un permiso" }]}
        >
          <Select
            mode="multiple"
            placeholder="Selecciona uno o más permisos"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {permisosOptions.map((p) => (
              <Option key={p.value} value={p.value}>
                {p.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Permisos de Formularios"
          name="permisosFormulario"
          rules={[{ required: true, message: "Debes asignar al menos un permiso de formulario" }]}
        >
          <Select
            mode="multiple"
            placeholder="Selecciona uno o más permisos de formularios"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {permisosFormularioOptions.map((p) => (
              <Option key={p.value} value={p.value}>
                {p.label}
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

export default RoleForm;
