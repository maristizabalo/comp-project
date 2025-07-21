import { lazy, useEffect, useState } from "react";
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
  PlusCircleOutlined,
  StopOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { usersService } from "../../../../services/admin/user";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../../../hooks/use-fetch"
const UserDetailsDrawer = lazy(() => import("../../../../components/admin/user/UserDetailsDrawer"));

const UserList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("deactivate");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();

  const {
    loading,
    error,
    fetchData: fetchUsuariosData,
  } = useFetch();

  const {
    loading: loadingUpdate,
    fetchData: fetchUpdateUsuario,
  } = useFetch();

  const fetchUsuarios = async () => {
    const data = await fetchUsuariosData(usersService.getUsuarios);
    if (data) setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const showConfirmationModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;
    const newStatus = actionType === "activate";
    try {
      await fetchUpdateUsuario(usersService.updateUsuario, selectedUser.id, {
        activo: newStatus,
      });
      message.success(
        `Usuario ${selectedUser.nombreCompleto} ${newStatus ? "activado" : "desactivado"
        }`
      );
      setModalVisible(false);
      fetchUsuarios();
    } catch (err) {
      message.error(err.message);
    }
  };

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
          <Tooltip title="Ver Detalle">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedUserId(record.id);
                setDrawerOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/usuarios/editar/${record.id}`)}
            />
          </Tooltip>

          {record.activo ? (
            <Tooltip title="Desactivar">
              <Button
                icon={<StopOutlined />}
                danger
                size="small"
                onClick={() => showConfirmationModal(record, "deactivate")}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Activar">
              <Button
                icon={<CheckOutlined />}
                type="primary"
                size="small"
                onClick={() => showConfirmationModal(record, "activate")}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button type="primary" onClick={() => navigate("/usuarios/crear")}>
          <PlusCircleOutlined className="mr-2" /> Crear Usuario
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

      <UserDetailsDrawer
        userId={selectedUserId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
        {selectedUser && (
          <p>
            ¿Estás seguro que deseas{" "}
            <strong>
              {actionType === "deactivate" ? "desactivar" : "activar"}
            </strong>{" "}
            al usuario <strong>{selectedUser.nombreCompleto}</strong>?
          </p>
        )}
      </Modal>
    </div>
  );
};

export default UserList;
