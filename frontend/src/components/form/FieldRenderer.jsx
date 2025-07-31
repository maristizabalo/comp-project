import { Form, Input, Select, DatePicker, Switch, Button } from "antd";
import React, { useState } from "react";
import GroupedFieldInput from "./GroupedFieldInput";

const FieldRenderer = ({ campo, form }) => {
    const { id, nombre, tipo, etiqueta, obligatorio, opciones, subcampos } = campo;
    const [selected, setSelected] = useState(null);

    const valoresGrupo = Form.useWatch(nombre);

    const rules = obligatorio ? [{ required: true, message: "Campo obligatorio" }] : [];

    const setValue = (value) => form.setFieldValue(nombre, { campo: id, ...value });

    if (tipo === "grupo-campos" && subcampos?.campos?.length) {
        return (
            <Form.List name={nombre}>
                {(fields, { add, remove }) => (
                    <div className="border rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">{etiqueta}</span>
                            <div className="flex gap-2">
                                <Select
                                    placeholder="Seleccionar campo"
                                    style={{ width: 200 }}
                                    value={selected}
                                    onChange={setSelected}
                                    options={subcampos.campos.map((c) => ({
                                        label: c.etiqueta,
                                        value: c.nombre,
                                    }))}
                                />
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        const campoSeleccionado = subcampos.campos.find((c) => c.nombre === selected);
                                        if (campoSeleccionado) {
                                            add({ nombre: campoSeleccionado.nombre, valor: "" });
                                        }
                                    }}
                                    disabled={!selected}
                                >
                                    Agregar
                                </Button>
                            </div>
                        </div>

                        {fields.map(({ key, name, ...restField }, index) => {
                            const campoNombre = valoresGrupo?.[index]?.nombre;
                            const current = subcampos.campos.find((c) => c.nombre === campoNombre);
                            if (!current) return null;

                            return (
                                <div key={key} className="grid grid-cols-12 gap-2 items-center mb-2">
                                    <Form.Item {...restField} name={[name, "nombre"]} hidden>
                                        <Input type="hidden" />
                                    </Form.Item>
                                    <div className="col-span-11">
                                        <GroupedFieldInput field={current} tipo={current.tipo} namePath={[name]} />
                                    </div>
                                    <Button type="text" danger onClick={() => remove(name)} className="col-span-1">
                                        🗑️
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Form.List>
        );
    }

    switch (tipo) {
        case "texto":
            return (
                <Form.Item
                    name={nombre}
                    label={etiqueta}
                    rules={rules}
                    getValueProps={(value) => ({
                        value: value?.valor_texto ?? ""
                    })}
                    normalize={(value) => ({
                        campo: campo.id,
                        valor_texto: value
                    })}
                >
                    <Input type="text" onChange={(e) => setValue({ valor_texto: e.target.value })} />
                </Form.Item>
            );
        case "numero":
            return (
                <Form.Item name={nombre} label={etiqueta} rules={rules}>
                    <Input
                        type="number"
                        onChange={(e) => setValue({ valor_numero: parseFloat(e.target.value) })}
                    />
                </Form.Item>
            );
        case "booleano":
            return (
                <Form.Item name={nombre} label={etiqueta} valuePropName="checked">
                    <Switch onChange={(val) => setValue({ valor_booleano: val })} />
                </Form.Item>
            );
        case "fecha":
            return (
                <Form.Item name={nombre} label={etiqueta} rules={rules}>
                    <DatePicker className="w-full" format="YYYY-MM-DD" onChange={(date, dateStr) => setValue({ valor_fecha: dateStr })} />
                </Form.Item>
            );
        case "seleccion-unica":
            return (
                <Form.Item name={nombre} label={etiqueta} rules={rules}>
                    <Select
                        onChange={(val) => setValue({ valor_opcion: val })}
                        options={opciones.map((op) => ({ label: op.valor, value: op.id }))}
                    />
                </Form.Item>
            );
        case "seleccion-multiple":
            return (
                <Form.Item name={nombre} label={etiqueta} rules={rules}>
                    <Select
                        mode="multiple"
                        onChange={(vals) => setValue({ valor_opciones: vals })}
                        options={opciones.map((op) => ({ label: op.valor, value: op.id }))}
                    />
                </Form.Item>
            );
        case "archivo":
            return (
                <Form.Item
                    name={nombre}
                    label={etiqueta}
                    rules={[{ required: obligatorio, message: "Debe adjuntar un archivo" }]}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                >
                    <Input type="file" />
                </Form.Item>
            );
        case "geometrico":
            const LazyMap = React.lazy(() => import("../maps/ArcgisMap"));
            return (
                <Form.Item name={nombre} label={etiqueta} rules={rules}>
                    <React.Suspense fallback={<div>Cargando mapa...</div>}>
                        <div className="h-[480px]">
                            <LazyMap onGeometryAdded={(geom) => setValue({ valor_geom: geom })} required />
                        </div>
                    </React.Suspense>
                </Form.Item>
            );
        default:
            return null;
    }
};

export default FieldRenderer;
