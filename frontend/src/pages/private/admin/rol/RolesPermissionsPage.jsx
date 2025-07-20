import { useEffect, useState } from "react";
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
import RoleDetailsDrawer from "../../../../components/admin/rol/RoleDetailsDrawer";
import RoleFormModal from "../../../../components/admin/rol/RoleForm";
import { rolService } from "../../../../services/admin/rol";

const RolesPermissionsPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionType, setActionType] = useState("deactivate");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rolService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error al obtener roles:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const showConfirmationModal = (role, action) => {
    setSelectedRole(role);
    setActionType(action);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setConfirmLoading(true);
    const newStatus = actionType === "activate";

    try {
      await rolService.updateRol(selectedRole.id, { activo: newStatus });
      message.success(
        `Rol ${selectedRole.nombre} ${newStatus ? "activado" : "desactivado"}`
      );
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      console.error(error);
      message.error("No se pudo actualizar el estado del rol");
    } finally {
      setConfirmLoading(false);
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
        dataSource={roles}
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

      {/* Modal de confirmación */}
      <Modal
        title={
          actionType === "deactivate"
            ? "Confirmar desactivación"
            : "Confirmar activación"
        }
        open={modalVisible}
        onOk={handleConfirm}
        confirmLoading={confirmLoading}
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

      {/* Drawer para detalles */}
      <RoleDetailsDrawer
        role={selectedRole}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  );
};

export default RolesPermissionsPage;
