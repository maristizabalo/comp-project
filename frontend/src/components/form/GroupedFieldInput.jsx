// GroupedFieldInput.jsx
import { Form, Input, Select, DatePicker, Switch } from "antd";

const GroupedFieldInput = ({ field, namePath, tipo }) => {
  const rules = [{ required: field.obligatorio, message: "Campo obligatorio" }];

  switch (tipo) {
    case "texto":
      return (
        <Form.Item label={field.etiqueta} name={[...namePath, "valor"]} rules={rules}>
          <Input placeholder={field.etiqueta} />
        </Form.Item>
      );
    case "numero":
      return (
        <Form.Item label={field.etiqueta} name={[...namePath, "valor"]} rules={rules}>
          <Input type="number" placeholder={field.etiqueta} />
        </Form.Item>
      );
    case "booleano":
      return (
        <Form.Item label={field.etiqueta} name={[...namePath, "valor"]} valuePropName="checked">
          <Switch />
        </Form.Item>
      );
    case "fecha":
      return (
        <Form.Item label={field.etiqueta} name={[...namePath, "valor"]} rules={rules}>
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>
      );
    case "seleccion-unica":
      return (
        <Form.Item label={field.etiqueta} name={[...namePath, "valor"]} rules={rules}>
          <Select
            options={field.opciones.map((op) => ({
              label: op.valor,
              value: op.valor,
            }))}
          />
        </Form.Item>
      );
    case "seleccion-multiple":
      return (
        <Form.Item label={field.etiqueta} name={[...namePath, "valor"]} rules={rules}>
          <Select
            mode="multiple"
            options={field.opciones.map((op) => ({
              label: op.valor,
              value: op.valor,
            }))}
          />
        </Form.Item>
      );
    default:
      return null;
  }
};

export default GroupedFieldInput;
