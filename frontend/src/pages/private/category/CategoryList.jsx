import { useEffect, useState } from "react";
import { Button, Card, Col, Empty, Input, Row, Skeleton, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useFetch } from "../../../hooks/use-fetch";
import { categoryService } from "../../../services/category/categoryService";

const { Title, Paragraph, Text } = Typography;

const CategoryList = () => {
  const navigate = useNavigate();
  const { loading, error, data: categorias, fetchData } = useFetch();
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchData(categoryService.getCategorias);
  }, [fetchData]);

  useEffect(() => {
    if (categorias) {
      setFilteredCategorias(categorias);
    }
  }, [categorias]);

  useEffect(() => {
    if (!searchValue) {
      setFilteredCategorias(categorias);
      return;
    }
    const lowerValue = searchValue.toLowerCase();
    const filtered = categorias?.filter((categoria) =>
      categoria.nombre.toLowerCase().includes(lowerValue) ||
      categoria.area?.nombre.toLowerCase().includes(lowerValue)
    );
    setFilteredCategorias(filtered);
  }, [searchValue, categorias]);

  const groupedByArea = filteredCategorias?.reduce((acc, categoria) => {
    const areaNombre = categoria.area?.nombre || "Sin área";
    if (!acc[areaNombre]) {
      acc[areaNombre] = [];
    }
    acc[areaNombre].push(categoria);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/categorias/crear")}
        >
          Nueva Categoría
        </Button>
      </div>

      <Input
        placeholder="Buscar por área o categoría..."
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      {loading && <Skeleton active />}
      {error && <Paragraph type="danger">{error}</Paragraph>}

      {!loading && !error && (!filteredCategorias || filteredCategorias.length === 0) && (
        <Empty description="No hay categorías registradas" />
      )}

      <div className="flex flex-col gap-8">
        {!loading &&
          !error &&
          groupedByArea &&
          Object.entries(groupedByArea).map(([area, categorias]) => (
            <div key={area} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <Title level={4} className="!mb-0 !text-primario">{area}</Title>
                <Paragraph className="text-gray-400 !mb-2">Total: {categorias.length} categorías</Paragraph>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categorias.map((categoria) => (
                    <div key={categoria.id} className="relative rounded-xl shadow-md bg-white p-4 hover:shadow-lg transition-all">
                      <Button
                        icon={<EditOutlined />}
                        shape="circle"
                        size="small"
                        className="absolute right-3 top-3 z-10"
                        onClick={() => navigate(`/categorias/editar/${categoria.id}`)}
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

export default CategoryList;
