import { useEffect, useState } from "react";
import { Button, Empty, Input, Skeleton, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useFetch } from "../../../hooks/use-fetch";
import { moduleService } from "../../../services/module/moduleService";

const { Title, Paragraph, Text } = Typography;

const ModuleList = () => {
  const navigate = useNavigate();
  const { loading, error, data: categoria, fetchData } = useFetch();
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchData(moduleService.getCategorias);
  }, [fetchData]);

  useEffect(() => {
    if (categoria) {
      setFilteredCategorias(categoria);
    }
  }, [categoria]);

  useEffect(() => {
    if (!searchValue) {
      setFilteredCategorias(categoria);
      return;
    }
    const lowerValue = searchValue.toLowerCase();
    const filtered = categoria?.filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(lowerValue) ||
        categoria.categoria?.nombre.toLowerCase().includes(lowerValue)
    );
    setFilteredCategorias(filtered);
  }, [searchValue, categoria]);

  const groupedByCategoria = filteredCategorias?.reduce((acc, categoria) => {
    const categoriaNombre = categoria.categoria?.nombre || "Sin categoría";
    if (!acc[categoriaNombre]) {
      acc[categoriaNombre] = [];
    }
    acc[categoriaNombre].push(categoria);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/categoria/crear")}>
          Nuevo Módulo
        </Button>
      </div>

      <Input
        placeholder="Buscar por módulo o categoría..."
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      {loading && <Skeleton active />}
      {error && <Paragraph type="danger">{error}</Paragraph>}

      {!loading && !error && (!filteredCategorias || filteredCategorias.length === 0) && (
        <Empty description="No hay módulos registrados" />
      )}

      <div className="flex flex-col gap-8">
        {!loading &&
          !error &&
          groupedByCategoria &&
          Object.entries(groupedByCategoria).map(([categoria, categoria]) => (
            <div key={categoria} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <Title level={4} className="!mb-0 !text-primario">{categoria}</Title>
                <Paragraph className="text-gray-400 !mb-2">Total: {categoria.length} módulos</Paragraph>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoria.map((categoria) => (
                    <div key={categoria.id} className="relative rounded-xl shadow-md bg-white p-4 hover:shadow-lg transition-all">
                      <Button
                        icon={<EditOutlined />}
                        shape="circle"
                        size="small"
                        className="absolute right-3 top-3 z-10"
                        onClick={() => navigate(`/categoria/editar/${categoria.id}`)}
                      />
                      <div className="flex flex-col gap-2">
                        <Text className="font-semibold text-base">{categoria.nombre}</Text>
                        <Paragraph className="text-gray-500 text-sm !mb-1">{categoria.descripcion}</Paragraph>
                        <Paragraph className="text-gray-400 text-xs !mb-0">
                          Creado por: {categoria.usuarioCreo}
                        </Paragraph>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ModuleList;
