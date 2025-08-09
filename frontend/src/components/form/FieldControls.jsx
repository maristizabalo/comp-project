// FieldControls.jsx
import { Input, Select, Switch, Form, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import React from "react";

const FieldControls = React.memo(function FieldControls({
  field,
  remove,
  tiposCamposOptions,
  isGrupoCampos,
}) {
  const form = Form.useFormInstance();

  return (
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
                if (!value) return Promise.resolve();
                const secciones = form.getFieldValue("secciones") || [];
                const totalPrincipales = secciones.reduce((acc, s) => {
                  const campos = s?.campos || [];
                  return acc + campos.filter(c => c?.principal).length;
                }, 0);
                return totalPrincipales <= 5
                  ? Promise.resolve()
                  : Promise.reject("Máximo 5 campos principales");
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
});

export default React.memo(FieldControls);
