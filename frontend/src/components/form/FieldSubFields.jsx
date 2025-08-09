import { Form, Input, Select, Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import React, { useState }  from "react";

const TIPO_SUBCAMPOS_VALIDOS = [
  { value: "texto", label: "Texto" },
  { value: "numero", label: "Número" },
  { value: "booleano", label: "Booleano" },
  { value: "fecha", label: "Fecha" },
];

const FieldSubFields = ({ field }) => {
  const [tipoGlobal, setTipoGlobal] = useState(null);

  return (
    <div className="w-full">
      {/* Selector de tipo global */}
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tipo de dato para todos los subcampos
        </label>
        <Select
          size="small"
          options={TIPO_SUBCAMPOS_VALIDOS}
          placeholder="Selecciona el tipo"
          value={tipoGlobal}
          onChange={setTipoGlobal}
          className="w-64"
        />
      </div>

      <Form.List name={[field.name, "subcampos"]}>
        {(fields, { add, remove }) => (
          <div className="space-y-2">
            {/* Tabla */}
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 text-xs font-medium px-4 py-2">
                <div className="col-span-10">Etiqueta</div>
                <div className="col-span-2 text-right">Acciones</div>
              </div>
              {fields.map((sub) => (
                <div
                  key={sub.key}
                  className="grid grid-cols-12 items-center gap-2 px-4 py-2 border-t"
                >
                  <Form.Item
                    name={[sub.name, "etiqueta"]}
                    className="!mb-0 col-span-10"
                    rules={[{ required: true, message: "Requerido" }]}
                  >
                    <Input size="small" placeholder="Etiqueta del subcampo" />
                  </Form.Item>

                  {/* Campo oculto para el tipo (heredado del global) */}
                  <Form.Item
                    name={[sub.name, "tipo"]}
                    initialValue={tipoGlobal}
                    hidden
                  >
                    <Input type="hidden" />
                  </Form.Item>

                  <div className="col-span-2 text-right">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => remove(sub.name)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="dashed"
              size="small"
              onClick={() => add({ tipo: tipoGlobal })}
              icon={<PlusOutlined />}
              className="w-fit text-blue-700 border-blue-300 bg-blue-50 hover:!border-blue-500"
              disabled={!tipoGlobal}
            >
              Añadir subcampo
            </Button>
          </div>
        )}
      </Form.List>
    </div>
  );
};

export default React.memo(FieldSubFields);
