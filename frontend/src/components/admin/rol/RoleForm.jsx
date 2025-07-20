import { Form, Input, Button, Checkbox } from "antd";

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
        <Form.Item label="Permisos" name="permisos">
          <Checkbox.Group options={permisosOptions} />
        </Form.Item>

        <Form.Item label="Permisos de Formularios" name="permisosFormulario">
          <Checkbox.Group options={permisosFormularioOptions} />
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
