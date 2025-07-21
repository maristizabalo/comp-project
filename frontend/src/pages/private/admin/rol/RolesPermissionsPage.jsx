import { useEffect, useState, lazy } from "react";
import {
  Table,
  Tag,
  Button,
  Tooltip,
  Modal,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  StopOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { rolService } from "../../../../services/admin/rol";
import { useFetch } from "../../../../hooks/use-fetch";

const RoleDetailsDrawer = lazy(() => import("../../../../components/admin/rol/RoleDetailsDrawer"));

const RolesPermissionsPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState("deactivate");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: roles,
    loading,
    fetchData: fetchRoles,
  } = useFetch();

  const {
    loading: loadingUpdate,
    fetchData: updateRole,
  } = useFetch();

  useEffect(() => {
    fetchRoles(rolService.getRoles);
  }, [fetchRoles]);

  const showConfirmationModal = (role, action) => {
    setSelectedRole(role);
    setActionType(action);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    const newStatus = actionType === "activate";

    try {
      await updateRole(rolService.updateRol, selectedRole.id, { activo: newStatus });
      message.success(
        `Rol ${selectedRole.nombre} ${newStatus ? "activado" : "desactivado"}`
      );
      setModalVisible(false);
      fetchRoles(rolService.getRoles);
    } catch (error) {
      message.error(error.message);
    }
  };

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
      title: "Activo",
      dataIndex: "activo",
      key: "activo",
      render: (activo) =>
        activo ? <Tag color="green">Sí</Tag> : <Tag color="red">No</Tag>,
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

          <Tooltip title={record.activo ? "Desactivar" : "Activar"}>
            <Button
              icon={<StopOutlined />}
              danger={record.activo}
              type={!record.activo ? "primary" : "default"}
              size="small"
              onClick={() =>
                showConfirmationModal(record, record.activo ? "deactivate" : "activate")
              }
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

      <Modal
        title={
          actionType === "deactivate"
            ? "Confirmar desactivación"
            : "Confirmar activación"
        }
        open={modalVisible}
        onOk={handleConfirm}
        confirmLoading={loadingUpdate}
        onCancel={() => setModalVisible(false)}
        okText={actionType === "deactivate" ? "Sí, desactivar" : "Sí, activar"}
        cancelText="Cancelar"
      >
        {selectedRole && (
          <p>
            ¿Estás seguro que deseas{" "}
            <strong>
              {actionType === "deactivate" ? "desactivar" : "activar"}
            </strong>{" "}
            el rol <strong>{selectedRole.nombre}</strong>?
          </p>
        )}
      </Modal>

      <RoleDetailsDrawer
        role={selectedRole}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default RolesPermissionsPage;
