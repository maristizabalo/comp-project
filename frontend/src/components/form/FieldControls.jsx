import { Input, Select, Switch, Form, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const FieldControls = ({ field, remove, tiposCamposOptions, mainCount, isGrupoCampos, onTipoChange }) => (
  <div className="flex items-center gap-3">
    <Form.Item
      name={[field.name, "etiqueta"]}
      className="!mb-0 flex-1"
      rules={[{ required: true, message: "Requerido" }]}
    >
      <Input size="small" placeholder="Etiqueta del campo" />
    </Form.Item>

    <Form.Item
      name={[field.name, "tipo"]}
      className="!mb-0 w-48"
      rules={[{ required: true, message: "Requerido" }]}
    >
      <Select
        size="small"
        options={tiposCamposOptions}
        placeholder="Tipo"
        onChange={onTipoChange}
      />
    </Form.Item>

    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-600">Obligatorio</span>
      <Form.Item
        name={[field.name, "obligatorio"]}
        className="!mb-0"
        valuePropName="checked"
      >
        <Switch size="small" disabled={isGrupoCampos} />
      </Form.Item>
    </div>

    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-600">Principal</span>
      <Form.Item
        name={[field.name, "principal"]}
        className="!mb-0"
        valuePropName="checked"
        rules={[
          () => ({
            validator(_, value) {
              if (!value || mainCount < 5) return Promise.resolve();
              return Promise.reject("Máximo 5 campos principales");
            },
          }),
        ]}
      >
        <Switch size="small" disabled={isGrupoCampos} />
      </Form.Item>
    </div>

    <Button
      type="text"
      icon={<DeleteOutlined />}
      danger
      onClick={() => remove(field.name)}
    />
  </div>
);

export default FieldControls;
