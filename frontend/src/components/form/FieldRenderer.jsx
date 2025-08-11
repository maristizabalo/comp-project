// src/components/form/FieldRenderer.jsx
import React, { useCallback, useMemo, useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button } from "antd";
import GroupedFieldInput from "./GroupedFieldInput";

const LazyMap = React.lazy(() => import("../maps/ArcgisMap"));
const MemoArcGISMapDraw = React.memo(LazyMap);

const toScalarId = (val) => {
  if (val == null) return val;
  if (Array.isArray(val)) return val.length ? toScalarId(val[0]) : null;
  if (typeof val === "object" && val && "value" in val) return toScalarId(val.value);
  return val;
};
const toIdArray = (val) => {
  if (val == null) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr
    .map((v) => (typeof v === "object" && v && "value" in v ? v.value : v))
    .filter((x) => x != null);
};

function SubFieldRow({ form, parentName, fieldMeta, schema, isView, onRemove }) {
  const { name, ...restField } = fieldMeta;
  const item = Form.useWatch([parentName, name], form);
  const subMeta = schema.find((c) => c.nombre === item?.nombre) || {};
  const etiquetaSub = subMeta.etiqueta || item?.nombre || "";
  const opcionesSub = subMeta.opciones || [];

  return (
    <div className="grid grid-cols-12 gap-2 items-start mb-2">
      <Form.Item {...restField} name={[name, "nombre"]} hidden>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item {...restField} name={[name, "tipo"]} hidden>
        <Input type="hidden" />
      </Form.Item>

      <div className="col-span-11">
        <GroupedFieldInput
          label={etiquetaSub}
          tipo={(item?.tipo || "").toLowerCase()}
          opciones={opcionesSub}
          name={name}
          restField={restField}
          isView={isView}
        />
      </div>

      {!isView && (
        <Button type="text" danger onClick={() => onRemove(name)} className="col-span-1">
          🗑️
        </Button>
      )}
    </div>
  );
}

const FieldRenderer = ({ campo, form, isView = false }) => {
  const { nombre, tipo, etiqueta, obligatorio, opciones, subcampos } = campo;
  const rules = obligatorio ? [{ required: true, message: "Campo obligatorio" }] : [];

  const watchedGeom = Form.useWatch([nombre, "valor_geom"], form);
  const handleGeom = useCallback(
    (geom) => form.setFieldValue(nombre, { valor_geom: geom }),
    [form, nombre]
  );

  const schemaSubcampos = useMemo(() => subcampos?.campos || [], [subcampos]);
  const [selected, setSelected] = useState(null);

  if ((tipo || "").toLowerCase() === "grupo-campos") {
    return (
      <Form.List name={nombre}>
        {(fields, { add, remove }) => (
          <div className="border rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">{etiqueta}</span>
              {!isView && (
                <div className="flex gap-2">
                  <Select
                    placeholder="Seleccionar subcampo"
                    style={{ width: 240 }}
                    value={selected}
                    onChange={setSelected}
                    options={(schemaSubcampos || []).map((c) => ({
                      label: c.etiqueta,
                      value: c.nombre,
                    }))}
                  />
                  <Button
                    type="dashed"
                    onClick={() => {
                      const meta = (schemaSubcampos || []).find((c) => c.nombre === selected);
                      if (meta) {
                        add({
                          nombre: meta.nombre,
                          tipo: (meta.tipo || "").toLowerCase(),
                          valor: null,
                        });
                        setSelected(null);
                      }
                    }}
                    disabled={!selected}
                  >
                    Agregar
                  </Button>
                </div>
              )}
            </div>

            {fields.map((f) => (
              <SubFieldRow
                key={f.key}
                form={form}
                parentName={nombre}
                fieldMeta={f}
                schema={schemaSubcampos}
                isView={isView}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </Form.List>
    );
  }

  switch ((tipo || "").toLowerCase()) {
    case "texto":
      return (
        <Form.Item name={nombre} label={etiqueta} rules={rules}>
          <Input disabled={isView} />
        </Form.Item>
      );
    case "numero":
      return (
        <Form.Item name={nombre} label={etiqueta} rules={rules}>
          <InputNumber disabled={isView} className="w-full" />
        </Form.Item>
      );
    case "booleano":
      return (
        <Form.Item name={nombre} label={etiqueta} valuePropName="checked">
          <Switch disabled={isView} />
        </Form.Item>
      );
    case "fecha":
      return (
        <Form.Item name={nombre} label={etiqueta} rules={rules}>
          <DatePicker className="w-full" format="YYYY-MM-DD" disabled={isView} />
        </Form.Item>
      );
    case "seleccion-unica":
      return (
        <Form.Item
          name={nombre}
          label={etiqueta}
          rules={rules}
          normalize={(val) => toScalarId(val)}
        >
          <Select
            disabled={isView}
            options={(opciones || []).map((op) => ({ label: op.valor, value: op.id }))}
          />
        </Form.Item>
      );
    case "seleccion-multiple":
      return (
        <Form.Item
          name={nombre}
          label={etiqueta}
          rules={rules}
          normalize={(val) => toIdArray(val)}
        >
          <Select
            mode="multiple"
            disabled={isView}
            options={(opciones || []).map((op) => ({ label: op.valor, value: op.id }))}
          />
        </Form.Item>
      );
    case "geometrico":
      return (
        <div>
          <div className="mb-1 text-sm font-medium text-gray-700">{etiqueta}</div>
          <React.Suspense fallback={<div>Cargando mapa...</div>}>
            <div className="h-[480px]">
              <MemoArcGISMapDraw
                geometry={watchedGeom}
                onGeometryChange={handleGeom}
                required={obligatorio}
                readOnly={isView}
              />
            </div>
          </React.Suspense>
          <Form.Item name={[nombre, "valor_geom"]} rules={rules} hidden>
            <input type="hidden" />
          </Form.Item>
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(FieldRenderer);
