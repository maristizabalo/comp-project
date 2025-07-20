import { Drawer, Descriptions, Tag, Divider } from "antd";

const RoleDetailsDrawer = ({ role, open, onClose }) => {
  if (!role) return null;

  return (
    <Drawer
      title={`Detalles del Rol: ${role.nombre}`}
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Nombre">{role.nombre}</Descriptions.Item>
        <Descriptions.Item label="Descripción">{role.descripcion}</Descriptions.Item>
        <Descriptions.Item label="Activo">
          {role.activo ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Usuario creó">{role.usuarioCreo}</Descriptions.Item>
        <Descriptions.Item label="Usuario modificó">{role.usuarioModifico}</Descriptions.Item>
        <Descriptions.Item label="IP creó">{role.ipCreo}</Descriptions.Item>
        <Descriptions.Item label="IP modificó">{role.ipModifico}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <h3 className="font-semibold">Permisos Asignados</h3>
      <div className="flex flex-wrap gap-2">
        {role.permisos?.length ? (
          role.permisos.map((permiso) => (
            <Tag key={permiso.id} color="blue">
              {permiso.nombre}
            </Tag>
          ))
        ) : (
          <p className="text-gray-400">Sin permisos asignados.</p>
        )}
      </div>

      <Divider />

      <h3 className="font-semibold">Permisos de Formularios</h3>
      <div className="flex flex-wrap gap-2">
        {role.permisosFormulario?.length ? (
          role.permisosFormulario.map((permiso) => (
            <Tag key={permiso.id} color="purple">
              {permiso.nombre} ({permiso.tipo})
            </Tag>
          ))
        ) : (
          <p className="text-gray-400">Sin permisos de formularios asignados.</p>
        )}
      </div>
    </Drawer>
  );
};

export default RoleDetailsDrawer;
