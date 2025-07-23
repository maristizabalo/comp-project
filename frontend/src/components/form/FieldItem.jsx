import { Input, Select, Switch, Form, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const FieldItem = ({ field, remove, tiposCamposOptions, mainCount }) => (
  <div className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
    {/* Etiqueta */}
    <Form.Item
      name={[field.name, "etiqueta"]}
      className="!mb-0 flex-1"
      rules={[{ required: true, message: "Requerido" }]}
    >
      <Input size="small" placeholder="Etiqueta del campo" />
    </Form.Item>

    {/* Tipo */}
    <Form.Item
      name={[field.name, "tipo"]}
      className="!mb-0 w-48"
      rules={[{ required: true, message: "Requerido" }]}
    >
      <Select size="small" options={tiposCamposOptions} placeholder="Tipo" />
    </Form.Item>

    {/* Obligatorio */}
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-600">Obligatorio</span>
      <Form.Item
        name={[field.name, "obligatorio"]}
        className="!mb-0"
        valuePropName="checked"
      >
        <Switch size="small" />
      </Form.Item>
    </div>

    {/* Principal */}
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-600">Principal</span>
      <Form.Item
        name={[field.name, "principal"]}
        className="!mb-0"
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

    {/* Botón eliminar */}
    <Button
      type="text"
      icon={<DeleteOutlined />}
      danger
      onClick={() => remove(field.name)}
    />
  </div>
);

export default FieldItem;