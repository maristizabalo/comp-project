import { useEffect, useState } from "react";
import { Table, Tag, Button, Tooltip, Breadcrumb } from "antd";
import {
  EditOutlined,
  PlusCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
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
              onClick={() => navigate(`/usuarios/editar/${record.id}`)}
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
        <Button type="primary" onClick={() => navigate("/usuarios/crear")}>
          {" "}
          <PlusCircleOutlined className="mr-2" /> Crear Usuario{" "}
        </Button>{" "}
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
    </div>
  );
};

export default UserList;
