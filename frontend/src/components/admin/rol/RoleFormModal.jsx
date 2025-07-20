import { Modal, Form, Input, Button, Checkbox } from "antd";
import { useEffect } from "react";

const RoleFormModal = ({ role, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (role) {
      form.setFieldsValue({
        nombre: role.nombre,
        descripcion: role.descripcion,
        permisos: role.permisos,
        permisosFormulario: role.permisosFormulario,
      });
    }
  }, [role, form]);

  const onFinish = async (values) => {
    await someService.updateRole(role.id, values);
    onSuccess();
  };

  return (
    <Modal
      title="Editar Rol"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Nombre" name="nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Descripción" name="descripcion">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Permisos" name="permisos">
          <Checkbox.Group options={[
            { label: 'Permiso 1', value: 1 },
            { label: 'Permiso 2', value: 2 },
            { label: 'Permiso 3', value: 3 },
          ]} />
        </Form.Item>

        <Form.Item label="Permisos de Formularios" name="permisosFormulario">
          <Checkbox.Group options={[
            { label: 'Formulario 1', value: 1 },
            { label: 'Formulario 2', value: 2 },
          ]} />
        </Form.Item>

        <div className="flex justify-end">
          <Button onClick={onClose} className="mr-2">Cancelar</Button>
          <Button type="primary" htmlType="submit">Guardar Cambios</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
