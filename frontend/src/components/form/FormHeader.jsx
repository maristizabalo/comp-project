import { Form, Input } from "antd";

const FormHeader = ({ form }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Form.Item
      label="Título del formulario"
      name="titulo"
      rules={[{ required: true, message: "Este campo es obligatorio" }]}
    >
      <Input placeholder="Título" />
    </Form.Item>
    <Form.Item
      label="Descripción"
      name="descripcion"
      rules={[{ required: true, message: "Este campo es obligatorio" }]}
    >
      <Input.TextArea rows={3} placeholder="Descripción del formulario" />
    </Form.Item>
  </div>
);

export default FormHeader;
