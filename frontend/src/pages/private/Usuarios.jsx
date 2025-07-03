import { useEffect, useState } from "react";
import { Table, Tag, Button, Tooltip, Breadcrumb } from "antd";
import { EditOutlined, StopOutlined } from "@ant-design/icons";
import { usersService } from "../../services/admin/user";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usersService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const columns = [
    {
      title: "Nombre completo",
      dataIndex: "nombreCompleto",
      key: "nombreCompleto",
      ellipsis: true,
    },
    {
      title: "Usuario",
      dataIndex: "usuario",
      key: "usuario",
    },
    {
      title: "Activo",
      dataIndex: "activo",
      key: "activo",
      render: (activo) =>
        activo ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: "LDAP",
      dataIndex: "activoLdap",
      key: "activoLdap",
      render: (ldap) =>
        ldap ? (
          <Tag color="blue">Habilitado</Tag>
        ) : (
          <Tag color="default">Deshabilitado</Tag>
        ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => console.log("Editar", record)}
            />
          </Tooltip>
          <Tooltip title="Desactivar">
            <Button
              icon={<StopOutlined />}
              danger
              size="small"
              onClick={() => console.log("Desactivar", record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[{ title: "Usuario", href: "/usuarios" }, { title: "Lista" }]}
        />
        <Button
          type="primary"
          onClick={() => console.log("Crear nuevo usuario")}
        >
          Nuevo Usuario
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={usuarios}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default Usuarios;
