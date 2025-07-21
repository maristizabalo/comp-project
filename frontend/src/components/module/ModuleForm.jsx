import { Form, Input, Select, Button } from "antd";

const ModuleForm = ({ form, onFinish, categorias = [], loadingSubmit = false, initialValues = {} }) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues} className="w-full">
      <Form.Item
        label="Categoría"
        name="categoria_id"
        rules={[{ required: true, message: "Selecciona una categoría" }]}
      >
        <Select
          placeholder="Selecciona una categoría"
          options={categorias.map((categoria) => ({
            label: categoria.nombre,
            value: categoria.id,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Nombre"
        name="nombre"
        rules={[{ required: true, message: "El nombre es obligatorio" }]}
      >
        <Input placeholder="Nombre del módulo" />
      </Form.Item>

      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ required: true, message: "La descripción es obligatoria" }]}
      >
        <Input.TextArea rows={3} placeholder="Describe brevemente el módulo" />
      </Form.Item>

      <div className="flex justify-center">
        <Button type="primary" htmlType="submit" loading={loadingSubmit} className="w-40">
          Guardar
        </Button>
      </div>
    </Form>
  );
};

export default ModuleForm;
