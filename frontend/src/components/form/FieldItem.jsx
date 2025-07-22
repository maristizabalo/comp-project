import { Input, Select, Switch, Button, Form } from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";

const FieldItem = ({ field, remove, tiposCamposOptions, mainCount }) => (
  <div className="border border-gray-200 rounded-lg p-4 mb-2 flex flex-col gap-2">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
      <Form.Item
        name={[field.name, "etiqueta"]}
        label="Etiqueta"
        rules={[{ required: true, message: "Requerido" }]}
      >
        <Input size="small" placeholder="Etiqueta visible" />
      </Form.Item>

      <Form.Item
        name={[field.name, "tipo"]}
        label="Tipo de campo"
        rules={[{ required: true, message: "Requerido" }]}
      >
        <Select size="small" options={tiposCamposOptions} placeholder="Tipo" />
      </Form.Item>

      <Form.Item
        name={[field.name, "obligatorio"]}
        label="Obligatorio"
        valuePropName="checked"
      >
        <Switch size="small" />
      </Form.Item>

      <Form.Item
        name={[field.name, "principal"]}
        label="Principal"
        valuePropName="checked"
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || mainCount < 5) return Promise.resolve();
              return Promise.reject("Máximo 5 campos principales");
            },
          }),
        ]}
      >
        <Switch size="small" />
      </Form.Item>
    </div>
    <Button
      size="small"
      danger
      icon={<MinusCircleOutlined />}
      onClick={() => remove(field.name)}
    >
      Eliminar campo
    </Button>
  </div>
);

export default FieldItem;
