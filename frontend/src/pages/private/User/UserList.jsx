import { useEffect, useState } from "react";
import { Table, Tag, Button, Tooltip, Breadcrumb } from "antd";
import { EditOutlined, StopOutlined } from "@ant-design/icons";
import { usersService } from "../../../services/admin/user";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        <Button type="primary" onClick={() => navigate("/usuarios/crear")}>
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
        className="
    rounded-xl overflow-hidden 
    [&_.ant-table-container]:rounded-xl 
    [&_.ant-table-thead>tr>th]:!bg-gray-400 
    [&_.ant-table-thead>tr>th]:!text-black 
    [&_.ant-table-thead>tr>th]:!font-semibold 
    [&_.ant-table-cell]:!text-sm 
    [&_.ant-table]:!border-none 
    shadow-md
  "
      />
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {user.nombreCompleto}
            </h3>
            <p className="text-sm text-gray-600">Usuario: {user.usuario}</p>
            <div className="mt-2 flex items-center gap-2">
              <Tag color={user.activo ? "green" : "red"}>
                {user.activo ? "Activo" : "Inactivo"}
              </Tag>
              <Tag color={user.activoLdap ? "blue" : "default"}>
                {user.activoLdap ? "LDAP ON" : "LDAP OFF"}
              </Tag>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => console.log("Editar", user)}
              >
                Editar
              </Button>
              <Button
                icon={<StopOutlined />}
                danger
                size="small"
                onClick={() => console.log("Desactivar", user)}
              >
                Desactivar
              </Button>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default UserList;
