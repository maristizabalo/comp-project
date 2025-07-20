import { Table, Button, Tooltip, Tag, Popconfirm } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  StopOutlined
} from "@ant-design/icons";

const RolesTable = ({ roles, onViewDetails, onEditRole, onDeactivateRole }) => {
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
              onClick={() => onViewDetails(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Editar Rol">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEditRole(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="¿Estás seguro de desactivar este rol?"
            onConfirm={() => onDeactivateRole(record)}
            okText="Sí"
            cancelText="No"
          >
            <Tooltip title="Desactivar">
              <Button
                icon={<StopOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={roles}
      rowKey="id"
      pagination={false}
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
  );
};

export default RolesTable;
