// src/components/form/GroupedFieldInput.jsx
import React from "react";
import { Form, Input, InputNumber, Select, DatePicker, Switch } from "antd";
import dayjs from "dayjs";

/**
 * Renderiza el control del subcampo dentro de un grupo.
 * - namePath: ruta base del item -> [padreNombre, index]
 *   Este componente escribe/lee en [...namePath, 'valor']
 * - tipo: 'texto' | 'numero' | 'booleano' | 'fecha' | 'seleccion-unica' | 'seleccion-multiple'
 * - opciones: [{id, valor, etiqueta}] (solo para select)
 * - label: etiqueta visible
 * - isView: deshabilitar controles
 */
const GroupedFieldInput = ({ namePath, tipo, opciones = [], label, isView = false }) => {
  const valueName = [...namePath, "valor"];

  switch ((tipo || "").toLowerCase()) {
    case "numero":
      return (
        <Form.Item name={valueName} label={label}>
          <InputNumber disabled={isView} className="w-full" />
        </Form.Item>
      );

    case "booleano":
      return (
        <Form.Item name={valueName} label={label} valuePropName="checked">
          <Switch disabled={isView} />
        </Form.Item>
      );

    case "fecha":
      return (
        <Form.Item
          name={valueName}
          label={label}
          getValueProps={(v) => ({ value: v ? dayjs(v) : null })}
          getValueFromEvent={(d) => (d ? d.format("YYYY-MM-DD") : null)}
        >
          <DatePicker className="w-full" format="YYYY-MM-DD" disabled={isView} />
        </Form.Item>
      );

    case "seleccion-unica":
      return (
        <Form.Item name={valueName} label={label}>
          <Select
            disabled={isView}
            options={(opciones || []).map((op) => ({ label: op.valor, value: op.id }))}
          />
        </Form.Item>
      );

    case "seleccion-multiple":
      return (
        <Form.Item name={valueName} label={label}>
          <Select
            mode="multiple"
            disabled={isView}
            options={(opciones || []).map((op) => ({ label: op.valor, value: op.id }))}
          />
        </Form.Item>
      );

    case "texto":
    default:
      return (
        <Form.Item name={valueName} label={label}>
          <Input disabled={isView} />
        </Form.Item>
      );
  }
};

export default React.memo(GroupedFieldInput);
