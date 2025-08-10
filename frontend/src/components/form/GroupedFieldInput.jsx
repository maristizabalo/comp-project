import React from "react";
import { Form, Input, InputNumber, Switch, DatePicker, Select } from "antd";

/**
 * Props:
 *  - label
 *  - tipo: 'texto' | 'numero' | 'booleano' | 'fecha' | 'seleccion-unica' | 'seleccion-multiple'
 *  - opciones: [{ id, valor, etiqueta }]
 *  - namePath: ruta base del item del grupo, p.ej. [nombrePadre, index]
 *  - isView
 */
function GroupedFieldInput({ label, tipo, opciones = [], namePath, isView }) {
  const commonItemProps = { label };

  switch ((tipo || "").toLowerCase()) {
    case "numero":
      return (
        <Form.Item {...commonItemProps} name={[...namePath, "valor"]}>
          <InputNumber className="w-full" disabled={isView} />
        </Form.Item>
      );

    case "booleano":
      return (
        <Form.Item
          {...commonItemProps}
          name={[...namePath, "valor"]}
          valuePropName="checked"
        >
          <Switch disabled={isView} />
        </Form.Item>
      );

    case "fecha":
      return (
        <Form.Item {...commonItemProps} name={[...namePath, "valor"]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" disabled={isView} />
        </Form.Item>
      );

    case "seleccion-unica":
      return (
        <Form.Item {...commonItemProps} name={[...namePath, "valor"]}>
          <Select
            disabled={isView}
            options={(opciones || []).map((op) => ({
              label: op.etiqueta ?? op.valor,
              value: op.id,
            }))}
          />
        </Form.Item>
      );

    case "seleccion-multiple":
      return (
        <Form.Item {...commonItemProps} name={[...namePath, "valor"]}>
          <Select
            mode="multiple"
            disabled={isView}
            options={(opciones || []).map((op) => ({
              label: op.etiqueta ?? op.valor,
              value: op.id,
            }))}
          />
        </Form.Item>
      );

    case "texto":
    default:
      return (
        <Form.Item {...commonItemProps} name={[...namePath, "valor"]}>
          <Input disabled={isView} />
        </Form.Item>
      );
  }
}

export default GroupedFieldInput;