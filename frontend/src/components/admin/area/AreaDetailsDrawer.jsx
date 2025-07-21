import { Drawer, Descriptions } from "antd";

const AreaDetailsDrawer = ({ area, open, onClose }) => {
  if (!area) return null;

  return (
    <Drawer
      title={`Detalles del Área: ${area.nombre}`}
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Nombre">{area.nombre}</Descriptions.Item>
        <Descriptions.Item label="Siglas">{area.siglas}</Descriptions.Item>
        <Descriptions.Item label="Usuario creó">{area.usuarioCreo}</Descriptions.Item>
        <Descriptions.Item label="IP creó">{area.ipCreo}</Descriptions.Item>
        <Descriptions.Item label="Usuario modificó">{area.usuarioModifico}</Descriptions.Item>
        <Descriptions.Item label="IP modificó">{area.ipModifico}</Descriptions.Item>
        <Descriptions.Item label="Fecha creación">{area.fechaCreacion}</Descriptions.Item>
        <Descriptions.Item label="Fecha modificación">{area.fechaModificacion}</Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default AreaDetailsDrawer;
