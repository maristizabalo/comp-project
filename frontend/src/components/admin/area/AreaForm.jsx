import { Form, Input, Button } from "antd";

const AreaForm = ({ form, initialValues = {}, onFinish, loadingSubmit = false }) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={onFinish}
    initialValues={initialValues}
    className="w-full"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Form.Item
        label="Nombre del Área"
        name="nombre"
        rules={[{ required: true, message: "El nombre es obligatorio" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Siglas"
        name="siglas"
        rules={[{ required: true, message: "Las siglas son obligatorias" }]}
      >
        <Input />
      </Form.Item>
    </div>

    <div className="flex justify-center mt-8">
      <Button type="primary" htmlType="submit" className="w-40" loading={loadingSubmit}>
        Guardar
      </Button>
    </div>
  </Form>
);

export default AreaForm;
