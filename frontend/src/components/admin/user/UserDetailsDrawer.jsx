import { Drawer, Descriptions, Tag, Divider, Spin } from "antd";
import { useEffect } from "react";
import { usersService } from "../../../services/admin/user";
import { useFetch } from "../../../hooks/use-fetch";

const UserDetailsDrawer = ({ userId, open, onClose }) => {
  const { loading, data: user, fetchData } = useFetch();

  useEffect(() => {
    if (open && userId) {
      fetchData(usersService.getUsuarioById, userId).catch(() => {});
    }
  }, [userId, open, fetchData]);

  if (!user || loading) {
    return (
      <Drawer open={open} onClose={onClose} title="Detalles del usuario" width={500}>
        <div className="h-64 flex justify-center items-center">
          <Spin size="large" />
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      title={`Detalles del Usuario: ${user.nombreCompleto}`}
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Nombre completo">{user.nombreCompleto}</Descriptions.Item>
        <Descriptions.Item label="Usuario">{user.usuario}</Descriptions.Item>
        <Descriptions.Item label="Correo">{user.correo}</Descriptions.Item>
        <Descriptions.Item label="Activo">
          {user.activo ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="LDAP">
          {user.activoLdap ? <Tag color="blue">Habilitado</Tag> : <Tag>Deshabilitado</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Usuario creó">{user.usuarioCreo}</Descriptions.Item>
        <Descriptions.Item label="Usuario modificó">{user.usuarioModifico}</Descriptions.Item>
        <Descriptions.Item label="IP creó">{user.ipCreo}</Descriptions.Item>
        <Descriptions.Item label="IP modificó">{user.ipModifico}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <h3 className="font-semibold">Roles Asignados</h3>
      <div className="flex flex-col gap-4">
        {user.roles?.length ? (
          user.roles.map(({ rol }) => (
            <div key={rol.id} className="border p-2 rounded-lg">
              <p className="font-semibold">{rol.nombre}</p>
              <p className="text-sm text-gray-500">{rol.descripcion}</p>
              <p className="text-xs mt-1">
                <Tag color="purple">Permisos: {rol.permisos.length}</Tag>
                <Tag color="cyan">Formularios: {rol.permisosFormulario.length}</Tag>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Sin roles asignados.</p>
        )}
      </div>
    </Drawer>
  );
};

export default UserDetailsDrawer;
