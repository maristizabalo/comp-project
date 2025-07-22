import { Button, Form, Input, Typography } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import FieldItem from "./FieldItem";

const { Title } = Typography;

const SectionItem = ({ section, remove, tiposCamposOptions, mainCount }) => (
  <div className="border-t-4 border-red-500 rounded-lg shadow-md p-4 bg-white mb-6">
    <Title level={5} className="text-primario">Sección</Title>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Form.Item
        name={[section.name, "nombre"]}
        label="Nombre de la sección"
        rules={[{ required: true, message: "Campo obligatorio" }]}
      >
        <Input placeholder="Ej: Información Básica" />
      </Form.Item>
    </div>

    <Form.List name={[section.name, "campos"]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field) => (
            <FieldItem
              key={field.key}
              field={field}
              remove={remove}
              tiposCamposOptions={tiposCamposOptions}
              mainCount={mainCount}
            />
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => add()}
            className="w-full mt-2"
          >
            Añadir campo
          </Button>
        </>
      )}
    </Form.List>

    <Button
      icon={<MinusCircleOutlined />}
      danger
      className="mt-4"
      onClick={() => remove(section.name)}
    >
      Eliminar Sección
    </Button>
  </div>
);

export default SectionItem;
