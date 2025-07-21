import { useEffect, useState, lazy } from "react";
import { Table, Button, Tooltip, Modal, message } from "antd";
import { EyeOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { areaService } from "../../../../services/admin/area";
import { useFetch } from "../../../../hooks/use-fetch";

const AreaDetailsDrawer = lazy(() => import("../../../../components/admin/area/AreaDetailsDrawer"));

const AreaList = () => {
  const [areas, setAreas] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const navigate = useNavigate();
  const { loading, fetchData: fetchAreasData } = useFetch();

  const fetchAreas = async () => {
    const data = await fetchAreasData(areaService.getAreas);
    if (data) setAreas(data);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Siglas", dataIndex: "siglas", key: "siglas" },
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
                setSelectedArea(record);
                setDrawerOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/areas/editar/${record.id}`)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button type="primary" onClick={() => navigate("/areas/crear")}>
          <PlusCircleOutlined className="mr-2" /> Crear Área
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={areas}
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

      <AreaDetailsDrawer
        area={selectedArea}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default AreaList;
