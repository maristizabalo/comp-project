import { Form, Input } from "antd";

const FormHeader = ({ values, onChange }) => {
  return (
    <Form layout="vertical" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Form.Item label="Título">
        <Input
          value={values.titulo}
          onChange={(e) => onChange({ titulo: e.target.value })}
          placeholder="Título del formulario"
        />
      </Form.Item>
      <Form.Item label="Descripción">
        <Input.TextArea
          rows={3}
          value={values.descripcion}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          placeholder="Describe el propósito del formulario"
        />
      </Form.Item>
    </Form>
  );
};

export default FormHeader;
