import { Button, Form, Input, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import FieldItem from "./FieldItem";

const { Title } = Typography;

const SectionItem = ({ section, remove, tiposCamposOptions, mainCount }) => (
  <div className="relative border-t-8 border-t-red-500 border-b-4 border-b-gray-400 rounded-lg shadow-md p-6 bg-white mb-10">
    <div className="flex justify-between items-center mb-4">
      <Title level={5} className="text-primario !mb-0">Sección</Title>
      <Button
        danger
        icon={<DeleteOutlined />}
        type="text"
        onClick={() => remove(section.name)}
      >
        Eliminar sección
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Form.Item
        name={[section.name, "nombre"]}
        rules={[{ required: true, message: "Debe dar un nombre a la sección" }]}
      >
        <Input placeholder="Nombre de la sección" />
      </Form.Item>
    </div>

    <Form.List name={[section.name, "campos"]}>
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <FieldItem
                field={field}
                remove={remove}
                tiposCamposOptions={tiposCamposOptions}
                mainCount={mainCount}
                fieldPath={[section.name, "campos", field.name]} // 👈 Añadido
              />

            </div>
          ))}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => add()}
            className="w-1/3 mt-1 text-green-900 border-green-500 bg-green-50 hover:bg-green-100 hover:!border-green-900"
          >
            Añadir campo
          </Button>

        </div>
      )}
    </Form.List>
  </div>
);

export default SectionItem;
