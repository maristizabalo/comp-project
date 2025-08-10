// src/components/form/FieldRenderer.jsx
import React, { useCallback, useMemo, useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button } from "antd";
import dayjs from "dayjs";

const LazyMap = React.lazy(() => import("../maps/ArcgisMap"));
const MemoArcGISMapDraw = React.memo(LazyMap);

const FieldRenderer = ({ campo, form, isView = false }) => {
  const { id, nombre, tipo, etiqueta, obligatorio, opciones, subcampos } = campo;
  const rules = obligatorio ? [{ required: true, message: "Campo obligatorio" }] : [];

  // ====== GEOM ======
  const watchedGeom = Form.useWatch([nombre, "valor_geom"], form);
  const handleGeom = useCallback(
    (geom) => form.setFieldValue(nombre, { valor_geom: geom }),
    [form, nombre]
  );

  // ====== GRUPO-CAMPOS ======
  // El backend te entrega: valores[nombrePadre] = [ { nombre, tipo, valor }, ... ]
  // El "esquema" del subcampo viene en `subcampos?.campos` (con etiquetas/opciones).
  const schemaSubcampos = useMemo(() => subcampos?.campos || [], [subcampos]);
  const [selected, setSelected] = useState(null);

  const getSubMetaByName = useCallback(
    (subName) => schemaSubcampos.find((c) => c.nombre === subName),
    [schemaSubcampos]
  );

  if (tipo === "grupo-campos") {
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
                    options={schemaSubcampos.map((c) => ({
                      label: c.etiqueta,
                      value: c.nombre,
                    }))}
                  />
                  <Button
                    type="dashed"
                    onClick={() => {
                      const sub = getSubMetaByName(selected);
                      if (sub) {
                        // inserta estructura base { nombre, tipo, valor }
                        add({ nombre: sub.nombre, tipo: (sub.tipo || "").toLowerCase(), valor: null });
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

            {fields.map(({ key, name, ...restField }) => {
              // cada item del array es { nombre, tipo, valor }
              const itemNombre = Form.useWatch([nombre, name, "nombre"], form);
              const itemTipo = Form.useWatch([nombre, name, "tipo"], form);

              const subMeta = getSubMetaByName(itemNombre) || {};
              // De subMeta usamos etiqueta/opciones: el tipo lo dicta "item.tipo" (el que viene en la respuesta)
              const etiquetaSub = subMeta.etiqueta || itemNombre;
              const opcionesSub = subMeta.opciones || [];

              return (
                <div key={key} className="grid grid-cols-12 gap-2 items-start mb-2">
                  {/* Mantén nombre y tipo en el item (para el backend) */}
                  <Form.Item {...restField} name={[name, "nombre"]} hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "tipo"]} hidden>
                    <Input type="hidden" />
                  </Form.Item>

                  {/* El input real escribe/lee en ...['valor'] */}
                  <div className="col-span-11">
                    <GroupedFieldInput
                      label={etiquetaSub}
                      tipo={(itemTipo || "").toLowerCase()}
                      opciones={opcionesSub}
                      namePath={[nombre, name]}
                      isView={isView}
                    />
                  </div>

                  {!isView && (
                    <Button
                      type="text"
                      danger
                      onClick={() => remove(name)}
                      className="col-span-1"
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Form.List>
    );
  }

  // ====== CAMPOS SIMPLES ======
  switch (tipo) {
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
        <Form.Item name={nombre} label={etiqueta} rules={rules} initialValue={null}>
          <DatePicker className="w-full" format="YYYY-MM-DD" disabled={isView} />
        </Form.Item>
      );

    case "seleccion-unica":
      return (
        <Form.Item name={nombre} label={etiqueta} rules={rules}>
          <Select
            disabled={isView}
            options={(opciones || []).map((op) => ({ label: op.valor, value: op.id }))}
          />
        </Form.Item>
      );

    case "seleccion-multiple":
      return (
        <Form.Item name={nombre} label={etiqueta} rules={rules}>
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

          {/* Campo oculto controlado por el form */}
          <Form.Item name={[nombre, "valor_geom"]} rules={rules} hidden>
            <input type="hidden" />
          </Form.Item>
        </div>
      );

    default:
      return null;
  }
};

export default FieldRenderer;
