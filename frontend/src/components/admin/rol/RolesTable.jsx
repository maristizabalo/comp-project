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
