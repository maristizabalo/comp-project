import { Form, Input, Button, Select } from "antd";

const CategoryForm = ({
  form,
  onFinish,
  areasOptions = [],
  loadingAreas = false,
  loadingSubmit = false,
  initialValues = {},
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      className="w-full"
    >
      <Form.Item
        label="Área"
        name="area_id"
        rules={[{ required: true, message: "Selecciona un área" }]}
      >
        <Select
          placeholder="Selecciona un área"
          loading={loadingAreas}
          options={(areasOptions || []).map((area) => ({
            label: area.nombre,
            value: area.id,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Nombre"
        name="nombre"
        rules={[{ required: true, message: "El nombre es obligatorio" }]}
      >
        <Input placeholder="Nombre de la categoría" />
      </Form.Item>

      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ required: true, message: "La descripción es obligatoria" }]}
      >
        <Input.TextArea rows={3} placeholder="Describe brevemente la categoría" />
      </Form.Item>

      <div className="flex justify-center mt-6">
        <Button
          type="primary"
          htmlType="submit"
          className="w-40"
          loading={loadingSubmit}
        >
          Guardar
        </Button>
      </div>
    </Form>
  );
};

export default CategoryForm;
