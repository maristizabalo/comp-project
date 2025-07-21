import { useEffect, useState, lazy } from "react";
import {
  Table,
  Button,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { rolService } from "../../../../services/admin/rol";
import { useFetch } from "../../../../hooks/use-fetch";

const RoleDetailsDrawer = lazy(() => import("../../../../components/admin/rol/RoleDetailsDrawer"));

const RolesPermissionsPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: roles,
    loading,
    fetchData: fetchRoles,
  } = useFetch();

  useEffect(() => {
    fetchRoles(rolService.getRoles);
  }, [fetchRoles]);


  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Permisos",
      key: "permisos",
      render: (_, record) => `${record.permisos?.length || 0} permisos`,
    },
    {
      title: "Permisos Formularios",
      key: "permisosFormulario",
      render: (_, record) => `${record.permisosFormulario?.length || 0} permisos`,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Ver Detalle">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedRole(record);
                setDrawerOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/roles/editar/${record.id}`)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button type="primary" onClick={() => navigate("/roles/crear")}>
          <PlusCircleOutlined className="mr-2" /> Crear Rol
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles || []}
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

      <RoleDetailsDrawer
        role={selectedRole}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default RolesPermissionsPage;
