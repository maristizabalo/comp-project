import { Form, Input, Select, Typography } from "antd";
const { TextArea } = Input;
const { Title } = Typography;

const FormHeader = ({ form, categoria = [] }) => {
  return (
    <div className="flex flex-col gap-4">
      <Title level={3} className="text-primario !mb-2">
        Crear nuevo formulario
      </Title>

      <Form.Item
        name="titulo"
        className="mb-0"
        rules={[{ required: true, message: "Este campo es obligatorio" }]}
      >
        <Input
          placeholder="Título del formulario"
          className="text-lg py-2 border border-gray-400"
        />
      </Form.Item>

      <Form.Item
        name="descripcion"
        className="!mb-0"
        rules={[{ required: true, message: "Este campo es obligatorio" }]}
      >
        <TextArea
          rows={3}
          placeholder="Breve descripción del formulario"
          className="border border-gray-400"
        />
      </Form.Item>

      <Form.Item
        label="Categoría al que pertenece"
        name="categoriaId"
        className="!mb-0"
        rules={[{ required: true, message: "Debes seleccionar una categoría" }]}
      >
        <Select
          placeholder="Selecciona una categoría"
          options={categoria.map((mod) => ({
            label: mod.nombre,
            value: mod.id,
          }))}
          className="!rounded-md"
          style={{
            border: "1px solid #9ca3af", // gray-400
            borderRadius: 6,
          }}
        />
      </Form.Item>

    </div>
  );
};

export default FormHeader;
